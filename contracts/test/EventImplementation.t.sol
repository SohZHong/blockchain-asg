// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EventImplementation.sol";

error ERC721NonexistentToken(uint256 tokenId);

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
                participantLimit: 3,
                registeredParticipants: 0,
                startDate: block.timestamp,
                rewardCount: 2,
                baseUri: "ipfs://test-uri/"
            });

        vm.prank(owner);
        eventImpl.initialize(owner, eventData);
    }

    function test_RegisterParticipant_Success() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        assertTrue(eventImpl.isParticipant(participant1));

        // Check if registeredParticipants increased
        (, , , , uint256 registeredParticipants, , , ) = eventImpl.eventData();
        assertEq(registeredParticipants, 1);
    }

    function test_RegisterParticipant_AlreadyRegistered() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();

        vm.expectRevert("Already registered");
        vm.prank(participant1);
        eventImpl.registerParticipant();
    }

    function test_RegisterParticipant_LimitReached() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();
        address participant3 = makeAddr("participant3");
        vm.prank(participant3);
        eventImpl.registerParticipant();

        address participant4 = makeAddr("participant4");
        vm.expectRevert("Participant limit reached");
        vm.prank(participant4);
        eventImpl.registerParticipant();
    }

    function test_StartEvent_Success() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();

        vm.prank(owner);
        eventImpl.startEvent();

        assertTrue(eventImpl.eventStarted());
        assertEq(eventImpl.milestoneMap(0), 1);
    }

    function test_StartEvent_AlreadyStarted() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
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

        vm.prank(participant1);
        eventNoReward.registerParticipant();

        vm.expectRevert("Invalid reward count");
        vm.prank(owner);
        eventNoReward.startEvent();
    }

    function test_RecordScan_Success() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();

        vm.prank(owner);
        eventImpl.startEvent();

        vm.prank(participant1);
        eventImpl.recordScan(participant2);
        assertEq(eventImpl.scanCount(participant1), 1);
    }

    function test_RecordScan_EventNotStarted() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();

        vm.expectRevert("Event has not started");
        vm.prank(participant1);
        eventImpl.recordScan(participant2);
    }

    function test_RecordScan_NotParticipant() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(owner);
        eventImpl.startEvent();

        vm.expectRevert("Not a registered participant");
        vm.prank(participant1);
        eventImpl.recordScan(participant2);
    }

    function test_MintNFT_SingleMilestoneSuccess() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();
        address participant3 = makeAddr("participant3");
        vm.prank(participant3);
        eventImpl.registerParticipant();

        vm.prank(owner);
        eventImpl.startEvent();

        // Scan 2 others to hit both milestones
        vm.prank(participant1);
        eventImpl.recordScan(participant2);
        vm.prank(participant1);
        eventImpl.recordScan(participant3);

        // First milestone
        vm.prank(participant1);
        eventImpl.mintNFT();
        assertEq(eventImpl.ownerOf(0), participant1);
        assertEq(eventImpl.tokenURI(0), "ipfs://test-uri/0.json");
    }

    function test_MintNFT_EventNotStarted() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();

        vm.expectRevert("Event has not started");
        vm.prank(participant1);
        eventImpl.mintNFT();
    }

    function test_MintNFT_NoEligibleMilestone() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();

        vm.prank(owner);
        eventImpl.startEvent();

        // No scan done, so no milestones achieved
        vm.prank(participant1);
        eventImpl.mintNFT();

        // Should not mint anything
        vm.expectRevert(
            abi.encodeWithSelector(ERC721NonexistentToken.selector, 0)
        );
        eventImpl.ownerOf(0);
    }

    function test_MintNFT_CannotMintSameMilestoneTwice() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();

        vm.prank(owner);
        eventImpl.startEvent();

        // Achieve milestone 1
        vm.prank(participant1);
        eventImpl.recordScan(participant2);
        vm.prank(participant1);
        eventImpl.mintNFT();

        // Attempt mint again with same scan count
        vm.prank(participant1);
        eventImpl.mintNFT();

        // Only 1 NFT should exist
        assertEq(eventImpl.balanceOf(participant1), 1);
    }

    function test_GetMilestones() public {
        vm.prank(participant1);
        eventImpl.registerParticipant();
        vm.prank(participant2);
        eventImpl.registerParticipant();
        vm.prank(owner);
        eventImpl.startEvent();

        uint256[] memory milestones = eventImpl.getMilestones();
        assertEq(milestones.length, 2);
        assertEq(milestones[0], 1);
        assertEq(milestones[1], 2);
    }
}
