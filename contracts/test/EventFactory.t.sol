// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EventFactory.sol";
import "../src/EventImplementation.sol";
import "../src/OrganiserToken.sol";

error OwnableUnauthorizedAccount(address account);

contract EventFactoryTest is Test {
    EventFactory public eventFactory;
    EventImplementation public implementation;
    OrganiserToken public organiserToken;

    address public owner;
    address public organiser;
    address public nonOrganiser;

    function setUp() public {
        owner = makeAddr("owner");
        organiser = makeAddr("organiser");
        nonOrganiser = makeAddr("nonOrganiser");

        organiserToken = new OrganiserToken(
            "ipfs://bafybeiawnhynmc7iqgelc5ro7chmxewnwn5hzkxpfhbefmkx4wykstmdxa/"
        );
        implementation = new EventImplementation();

        // Deploy and initialize EventFactory as 'owner'
        vm.startPrank(owner);
        eventFactory = new EventFactory();
        eventFactory.initialize(
            address(implementation),
            address(organiserToken)
        );
        vm.stopPrank();
    }

    function test_CannotCreateEvent_IfNotOrganizer() public {
        vm.prank(nonOrganiser);
        vm.expectRevert("Not an organizer");
        eventFactory.createEvent(
            "Name",
            "Desc",
            "Loc",
            100,
            block.timestamp,
            10,
            "ipfs://uri/"
        );
    }

    function test_CanCreateEvent_AsOrganizer() public {
        organiserToken.mint(organiser);

        vm.prank(organiser);
        address eventAddr = eventFactory.createEvent(
            "Name",
            "Desc",
            "Loc",
            100,
            block.timestamp,
            10,
            "ipfs://uri/"
        );

        assertTrue(eventAddr != address(0));
    }

    function test_EventIsStoredCorrectly() public {
        organiserToken.mint(organiser);

        vm.prank(organiser);
        address eventAddr = eventFactory.createEvent(
            "Name",
            "Desc",
            "Loc",
            100,
            block.timestamp,
            10,
            "ipfs://uri/"
        );

        address stored = eventFactory.events(0);
        assertEq(stored, eventAddr);
    }

    function test_EventEmitsCorrectly() public {
        organiserToken.mint(organiser);
        vm.startPrank(organiser);
        vm.recordLogs();

        address eventAddr = eventFactory.createEvent(
            "EventName",
            "Desc",
            "Loc",
            100,
            block.timestamp,
            10,
            "ipfs://uri/"
        );

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 expectedSig = keccak256(
            "EventCreated(uint256,address,address,string,string,string,string,uint256,uint256,uint256)"
        );

        bool found;
        for (uint256 i = 0; i < logs.length; i++) {
            if (
                logs[i].topics.length == 4 && logs[i].topics[0] == expectedSig
            ) {
                assertEq(uint256(logs[i].topics[1]), 0); // eventId
                assertEq(
                    address(uint160(uint256(logs[i].topics[2]))),
                    organiser
                ); // organizer
                assertEq(
                    address(uint160(uint256(logs[i].topics[3]))),
                    eventAddr
                ); // event contract
                found = true;
                break;
            }
        }

        assertTrue(found, "EventCreated log not found");
    }

    function test_CanSetAndReadImplementation() public {
        address newImpl = makeAddr("newImpl");
        vm.prank(owner);
        eventFactory.setImplementation(newImpl);

        assertEq(eventFactory.implementation(), newImpl);
        assertEq(eventFactory.getStoredImplementation(), newImpl);
    }

    function test_SetImplementation_RevertsForNonOwner() public {
        vm.prank(nonOrganiser);

        vm.expectRevert(
            abi.encodeWithSelector(
                OwnableUnauthorizedAccount.selector,
                nonOrganiser
            )
        );
        eventFactory.setImplementation(makeAddr("x"));
    }
}
