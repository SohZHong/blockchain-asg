// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/OrganiserToken.sol";

contract OrganiserTokenTest is Test {
    OrganiserToken public organiserToken;
    address public organiser;

    function setUp() public {
        organiserToken = new OrganiserToken(
            "ipfs://bafybeiawnhynmc7iqgelc5ro7chmxewnwn5hzkxpfhbefmkx4wykstmdxa/"
        );
        organiser = makeAddr("organiser");
    }

    function test_Mint() public {
        vm.prank(address(this));
        organiserToken.mint(organiser);
        vm.stopPrank();
        assertEq(organiserToken.balanceOf(organiser), 1);
    }

    function test_Burn() public {
        vm.prank(address(this));
        organiserToken.mint(organiser);
        assertEq(organiserToken.balanceOf(organiser), 1);
        organiserToken.burn(0);
        assertEq(organiserToken.balanceOf(organiser), 0);
        vm.stopPrank();
    }

    function test_TokenURI() public {
        organiserToken.mint(organiser);
        string memory uri = organiserToken.tokenURI(0);
        assertEq(
            uri,
            "ipfs://bafybeiawnhynmc7iqgelc5ro7chmxewnwn5hzkxpfhbefmkx4wykstmdxa/0.json"
        );
    }

    function test_Update_DisallowsTransfer() public {
        organiserToken.mint(organiser);
        address anotherUser = makeAddr("anotherUser");
        vm.prank(organiser);
        vm.expectRevert("Soulbound: Transfers are disabled");
        organiserToken.transferFrom(organiser, anotherUser, 0);
    }

    function test_TokenOwnerIsCorrect() public {
        organiserToken.mint(organiser);
        assertEq(organiserToken.ownerOf(0), organiser);
    }

    function test_TokenDoesNotExist_ShouldRevertOnTokenURI() public {
        vm.expectRevert("Token does not exist");
        organiserToken.tokenURI(0);
    }

    function test_BurnNonexistentToken_ShouldRevert() public {
        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 0)
        );
        organiserToken.burn(0);
    }

    function test_DoubleMint_ShouldRevert() public {
        organiserToken.mint(organiser);
        vm.expectRevert("Already an organizer");
        organiserToken.mint(organiser);
    }

    function test_TransferFromWithoutOwnership_ShouldRevert() public {
        organiserToken.mint(organiser);
        address attacker = makeAddr("attacker");
        vm.prank(attacker);
        vm.expectRevert("Soulbound: Transfers are disabled");
        organiserToken.transferFrom(organiser, attacker, 0);
    }
}
