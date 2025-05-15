// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Marketplace} from "../src/Marketplace.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Mock NFT contract for testing
contract MockNFT is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MockBeast", "MBST") {}

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        return tokenId;
    }
}

contract MarketplaceTest is Test {
    Marketplace public marketplace;
    MockNFT public mockNFT;

    address public constant SELLER = address(1);
    address public constant BUYER = address(2);
    address public constant RANDOM_USER = address(3);

    uint256 public constant INITIAL_FEE_PERCENTAGE = 250; // 2.5%
    uint256 public constant LISTING_PRICE = 1 ether;

    event BeastListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        address nftAddress,
        uint256 price
    );
    event BeastSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event ListingCanceled(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller
    );
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);

    function setUp() public {
        // Deploy contracts
        marketplace = new Marketplace(INITIAL_FEE_PERCENTAGE);
        mockNFT = new MockNFT();

        // Setup initial balances
        vm.deal(BUYER, 10 ether);
        vm.deal(SELLER, 1 ether);

        // Mint NFT to seller
        vm.startPrank(SELLER);
        mockNFT.setApprovalForAll(address(marketplace), true);
        vm.stopPrank();
    }

    function test_ListBeast() public {
        vm.startPrank(SELLER);
        uint256 tokenId = 0; // First minted token

        vm.expectEmit(true, true, true, true);
        emit BeastListed(0, tokenId, SELLER, address(mockNFT), LISTING_PRICE);

        marketplace.listBeast(address(mockNFT), tokenId, LISTING_PRICE);

        // Verify listing details
        (
            address seller,
            address nftAddress,
            uint256 listedTokenId,
            uint256 price,
            bool active
        ) = marketplace.getListingDetails(0);

        assertEq(seller, SELLER);
        assertEq(nftAddress, address(mockNFT));
        assertEq(listedTokenId, tokenId);
        assertEq(price, LISTING_PRICE);
        assertTrue(active);
        vm.stopPrank();
    }

    function test_BuyBeast() public {
        // First list a beast
        vm.prank(SELLER);
        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);

        uint256 initialSellerBalance = SELLER.balance;
        uint256 initialBuyerBalance = BUYER.balance;

        // Calculate expected fee and seller amount
        uint256 fee = (LISTING_PRICE * INITIAL_FEE_PERCENTAGE) / 10000;
        uint256 sellerAmount = LISTING_PRICE - fee;

        vm.startPrank(BUYER);
        vm.expectEmit(true, true, true, true);
        emit BeastSold(0, 0, BUYER, LISTING_PRICE);

        marketplace.buyBeast{value: LISTING_PRICE}(0);

        // Verify ownership transfer
        assertEq(mockNFT.ownerOf(0), BUYER);

        // Verify balances
        assertEq(SELLER.balance, initialSellerBalance + sellerAmount);
        assertEq(BUYER.balance, initialBuyerBalance - LISTING_PRICE);
        assertEq(address(marketplace).balance, fee);

        // Verify listing is inactive
        (, , , , bool active) = marketplace.getListingDetails(0);
        assertFalse(active);
        vm.stopPrank();
    }

    function test_CancelListing() public {
        // First list a beast
        vm.prank(SELLER);
        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);

        vm.startPrank(SELLER);
        vm.expectEmit(true, true, true, true);
        emit ListingCanceled(0, 0, SELLER);

        marketplace.cancelListing(0);

        // Verify listing is inactive
        (, , , , bool active) = marketplace.getListingDetails(0);
        assertFalse(active);
        vm.stopPrank();
    }

    function test_GetActiveBeastListings() public {
        // List multiple beasts
        vm.startPrank(SELLER);
        uint256 tokenId1 = mockNFT.mint(SELLER);
        uint256 tokenId2 = mockNFT.mint(SELLER);

        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);
        marketplace.listBeast(address(mockNFT), tokenId1, LISTING_PRICE);
        marketplace.listBeast(address(mockNFT), tokenId2, LISTING_PRICE);

        // Cancel one listing
        marketplace.cancelListing(1);
        vm.stopPrank();

        uint256[] memory activeListings = marketplace.getActiveBeastListings();
        assertEq(activeListings.length, 2);
        assertEq(activeListings[0], 0);
        assertEq(activeListings[1], 2);
    }

    function test_UpdateFeePercentage() public {
        uint256 newFee = 500; // 5%

        vm.expectEmit(true, true, true, true);
        emit FeePercentageUpdated(INITIAL_FEE_PERCENTAGE, newFee);

        marketplace.updateFeePercentage(newFee);
        assertEq(marketplace.feePercentage(), newFee);
    }

    function test_WithdrawFees() public {
        // First generate some fees through a purchase
        vm.prank(SELLER);
        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);

        vm.prank(BUYER);
        marketplace.buyBeast{value: LISTING_PRICE}(0);

        uint256 initialOwnerBalance = marketplace.owner().balance;
        uint256 marketplaceBalance = address(marketplace).balance;

        marketplace.withdrawFees();

        assertEq(address(marketplace).balance, 0);
        assertEq(
            marketplace.owner().balance,
            initialOwnerBalance + marketplaceBalance
        );
    }

    // Failure cases
    function test_RevertWhen_ListingWithoutApproval() public {
        // Mint new NFT without approval
        vm.startPrank(SELLER);
        uint256 tokenId = mockNFT.mint(SELLER);
        mockNFT.setApprovalForAll(address(marketplace), false);

        vm.expectRevert("Marketplace not approved");
        marketplace.listBeast(address(mockNFT), tokenId, LISTING_PRICE);
        vm.stopPrank();
    }

    function test_RevertWhen_BuyingWithInsufficientFunds() public {
        vm.prank(SELLER);
        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);

        vm.prank(BUYER);
        vm.expectRevert("Insufficient funds");
        marketplace.buyBeast{value: LISTING_PRICE - 0.1 ether}(0);
    }

    function test_RevertWhen_CancelingByNonSeller() public {
        vm.prank(SELLER);
        marketplace.listBeast(address(mockNFT), 0, LISTING_PRICE);

        vm.prank(RANDOM_USER);
        vm.expectRevert("Not the seller");
        marketplace.cancelListing(0);
    }

    function test_RevertWhen_UpdatingFeeByNonOwner() public {
        vm.prank(RANDOM_USER);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                RANDOM_USER
            )
        );
        marketplace.updateFeePercentage(500);
    }

    receive() external payable {}
}
