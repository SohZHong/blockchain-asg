// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    // Fee percentage (in basis points, 100 = 1%)
    uint256 public feePercentage;

    // Counter for unique listing IDs
    uint256 private listingCounter;

    // Listing structure
    struct Listing {
        uint256 listingId;
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    // Mapping from listingId to Listing
    mapping(uint256 => Listing) public listings;
    
    // Array to track all listing IDs
    uint256[] public allListingIds;

    // Events
    event BeastListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, address nftAddress, uint256 price);
    event BeastSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCanceled(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);

    constructor(uint256 _feePercentage) {
        require(_feePercentage <= 1000, "Fee percentage cannot exceed 10%");
        feePercentage = _feePercentage;
    }

    // List a beast for sale
    function listBeast(address nftAddress, uint256 tokenId, uint256 price) external {
        IERC721 beastNFT = IERC721(nftAddress);
        require(beastNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");
        require(
            beastNFT.isApprovedForAll(msg.sender, address(this)) || 
            beastNFT.getApproved(tokenId) == address(this), 
            "Marketplace not approved"
        );

        // Increment the listing counter to generate a unique ID
        uint256 listingId = listingCounter++;
        
        // Create the listing
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        // Add to tracking array
        allListingIds.push(listingId);

        emit BeastListed(listingId, tokenId, msg.sender, nftAddress, price);
    }

    // Buy a beast
    function buyBeast(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient funds");

        // Calculate fee and seller amount
        uint256 fee = (listing.price * feePercentage) / 10000;
        uint256 sellerAmount = listing.price - fee;

        // Mark listing as inactive first (security best practice)
        listing.active = false;

        // Transfer NFT to buyer
        IERC721(listing.nftAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Transfer funds to seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Failed to send ETH to seller");

        emit BeastSold(listingId, listing.tokenId, msg.sender, listing.price);

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Failed to refund excess");
        }
    }

    // Cancel a listing
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Not the seller");

        // Mark as inactive
        listing.active = false;

        emit ListingCanceled(listingId, listing.tokenId, msg.sender);
    }

    // Get all active listings
    function getActiveBeastListings() external view returns (uint256[] memory) {
        // First, count active listings
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allListingIds.length; i++) {
            uint256 listingId = allListingIds[i];
            if (listings[listingId].active) {
                activeCount++;
            }
        }

        // Then create and populate the array
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allListingIds.length; i++) {
            uint256 listingId = allListingIds[i];
            if (listings[listingId].active) {
                activeListings[index] = listingId;
                index++;
            }
        }

        return activeListings;
    }

    // Get details of a specific listing
    function getListingDetails(uint256 listingId) external view returns (
        address seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        bool active
    ) {
        Listing memory listing = listings[listingId];
        return (
            listing.seller,
            listing.nftAddress,
            listing.tokenId,
            listing.price,
            listing.active
        );
    }

    // Update fee percentage (only owner)
    function updateFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee percentage cannot exceed 10%");
        uint256 oldFee = feePercentage;
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(oldFee, feePercentage);
    }

    // Withdraw accumulated fees (only owner)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Failed to withdraw fees");
    }
}