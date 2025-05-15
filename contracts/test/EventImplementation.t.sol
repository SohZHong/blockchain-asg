// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EventImplementation.sol";

contract EventImplementationTest is Test {
    EventImplementation public eventImpl;
    address public owner;
    address public participant1;
    address public participant2;

    function setUp() public {
        owner = makeAddr("owner");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");

        eventImpl = new EventImplementation();

        EventImplementation.EventData memory eventData = EventImplementation
            .EventData({
                name: "Test Event",
                description: "An event for testing",
                location: "Test Location",
                participantLimit: 2,
                registeredParticipants: 0,
                startDate: block.timestamp,
                rewardCount: 2,
                baseUri: "ipfs://test-uri/"
            });

        vm.prank(owner);
        eventImpl.initialize(owner, eventData);
    }

    function test_RegisterParticipant_Success() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        assertTrue(eventImpl.isParticipant(participant1));
        (, , , , uint256 registeredParticipants, , , ) = eventImpl.eventData();

        assertEq(registeredParticipants, 1);
    }

    function test_RegisterParticipant_AlreadyRegistered() public {
        eventImpl.registerParticipant(participant1);
        vm.expectRevert("Already registered");
        eventImpl.registerParticipant(participant1);
    }

    function test_RegisterParticipant_LimitReached() public {
        eventImpl.registerParticipant(participant1);
        eventImpl.registerParticipant(participant2);
        address participant3 = makeAddr("participant3");
        vm.expectRevert("Participant limit reached");
        eventImpl.registerParticipant(participant3);
    }

    function test_StartEvent_Success() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.registerParticipant(participant2);
        vm.prank(owner);
        eventImpl.startEvent();
        assertTrue(eventImpl.eventStarted());
        assertEq(eventImpl.milestoneMap(1), 1);
        assertEq(eventImpl.milestoneMap(2), 2);
    }

    function test_StartEvent_AlreadyStarted() public {
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.startEvent();
        vm.expectRevert("Event already started");
        vm.prank(owner);
        eventImpl.startEvent();
    }

    function test_StartEvent_NoParticipants() public {
        vm.expectRevert("No participants registered");
        vm.prank(owner);
        eventImpl.startEvent();
    }

    function test_StartEvent_NoRewards() public {
        EventImplementation.EventData memory eventData = EventImplementation
            .EventData({
                name: "No Reward Event",
                description: "An event with no rewards",
                location: "Nowhere",
                participantLimit: 1,
                registeredParticipants: 0,
                startDate: block.timestamp,
                rewardCount: 0,
                baseUri: "ipfs://test-uri/"
            });

        EventImplementation eventNoReward = new EventImplementation();
        vm.prank(owner);
        eventNoReward.initialize(owner, eventData);

        vm.prank(owner);
        eventNoReward.registerParticipant(participant1);

        vm.expectRevert("Invalid reward count");
        vm.prank(owner);
        eventNoReward.startEvent();
    }

    function test_RecordScan_Success() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.startEvent();

        vm.prank(participant1);
        eventImpl.recordScan();
        assertEq(eventImpl.scanCount(participant1), 1);
    }

    function test_RecordScan_EventNotStarted() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.expectRevert("Event has not started");
        vm.prank(participant1);
        eventImpl.recordScan();
    }

    function test_RecordScan_NotParticipant() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.startEvent();
        vm.expectRevert("Not a registered participant");
        vm.prank(participant2);
        eventImpl.recordScan();
    }

    function test_MintNFT_Success() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.registerParticipant(participant2);
        vm.prank(owner);
        eventImpl.startEvent();

        vm.prank(participant1);
        eventImpl.recordScan();
        vm.prank(participant1);
        eventImpl.recordScan();

        vm.prank(participant1);
        eventImpl.mintNFT();
        assertEq(eventImpl.ownerOf(1), participant1);
        assertEq(eventImpl.tokenURI(1), "ipfs://test-uri/1.json");
    }

    function test_MintNFT_EventNotStarted() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.expectRevert("Event has not started");
        vm.prank(participant1);
        eventImpl.mintNFT();
    }

    function test_MintNFT_AllRewardsMinted() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.startEvent();

        vm.prank(participant1);
        eventImpl.recordScan();

        vm.prank(participant1);
        eventImpl.mintNFT();

        vm.prank(participant1);
        eventImpl.recordScan();

        vm.prank(participant1);
        eventImpl.mintNFT();

        vm.expectRevert("All rewards minted");
        vm.prank(participant1);
        eventImpl.mintNFT();
    }

    function test_MintNFT_MilestoneNotReached() public {
        vm.prank(owner);
        eventImpl.registerParticipant(participant1);
        vm.prank(owner);
        eventImpl.registerParticipant(participant2);
        vm.prank(owner);
        eventImpl.startEvent();

        vm.expectRevert("Milestone not reached");
        vm.prank(participant1);
        eventImpl.mintNFT();
    }
}
