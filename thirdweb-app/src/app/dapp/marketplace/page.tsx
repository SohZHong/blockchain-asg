"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import { marketplaceService, ListingItem } from "@/services/marketplaceService";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import Image from "next/image";

const RARITIES = ["Common", "Rare", "Epic", "Mythic"];

export default function Marketplace() {
  const { account, client } = useThirdWeb();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newListing, setNewListing] = useState({
    nftAddress: '',
    tokenId: '',
    price: ''
  });
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [operationType, setOperationType] = useState<'listing' | 'removal'>('listing');

  // Filter state
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-asc");

  // Collection stats (dummy data)
  const collectionStats = {
    totalVolume: "2,100 A-CELO",
    floorPrice: "1,890 A-CELO",
    bestOffer: "500 A-CELO",
    listed: "10%",
    owners: "26 (43%)"
  };

  useEffect(() => {
    const fetchData = async () => {
      const listings = await marketplaceService.fetchListings();
      setItems(listings);
    };
    fetchData();
  }, []);

  // Filtering and sorting
  const filteredItems = items
    .filter((item) => {
      const price = Number(item.price) / 10 ** 18;
      const rarity = item.metadata?.attributes?.find(attr => attr.trait_type === 'Rarity')?.value ?? "Common";
      return (
        price >= priceRange[0] &&
        price <= priceRange[1] &&
        (selectedRarities.length === 0 || selectedRarities.includes(rarity))
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return 0;
    });

  const handleViewDetails = (item: ListingItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAddListing = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewListing({ nftAddress: '', tokenId: '', price: '' });
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsApproving(true);
      setError(null);
      
      // Convert price to wei (multiply by 10^18)
      const priceInWei = (Number(newListing.price) * 10 ** 18).toString();
      
      const tx = await marketplaceService.addListing(
        {
          tokenId: newListing.tokenId,
          price: priceInWei,
          nftAddress: newListing.nftAddress
        },
        account,
        client
      );
      
      // Set transaction hash and show success modal
      setTransactionHash(tx);
      setOperationType('listing');
      setShowSuccessModal(true);
      
      // Refresh listings
      const listings = await marketplaceService.fetchListings();
      setItems(listings);
      
      // Reset form
      setNewListing({
        nftAddress: '',
        tokenId: '',
        price: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding listing:", error);
      setError(error instanceof Error ? error.message : "Failed to add listing");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRemoveFromMarket = async (listingId: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      const tx = await marketplaceService.removeListing(listingId, account, client);
      setItems(items.filter(item => item.listingid !== listingId));
      handleCloseModal();
      
      // Set transaction hash and show success modal
      setTransactionHash(tx);
      setOperationType('removal');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error removing NFT from market:", error);
      setError(error instanceof Error ? error.message : "Failed to remove listing");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBuy = async (listingId: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setIsBuying(true);
    setBuyError(null);

    try {
      await marketplaceService.buyNFT(listingId, account, client);
      // Refresh listings after successful purchase
      const listings = await marketplaceService.fetchListings();
      setItems(listings);
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error buying NFT:", error);
      setBuyError(error instanceof Error ? error.message : "Failed to buy NFT");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <main className="min-h-screen w-screen bg-black bg-cover bg-center flex flex-col items-center justify-center">
      <Navbar />
      <div className="w-full bg-gradient-to-b from-zinc-900 to-black">
        <div className="relative w-full h-[500px]">
          {/* Banner Image */}
          <div className="absolute inset-0">
            <Image
              src="/dapp/marketplace-bg2.png"
              alt="Collection Banner"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
          </div>
          {/* Collection Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start gap-6">
              {/* Collection Avatar */}
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-500">
                <Image
                  src="/favicon.png"
                  alt="Collection Avatar"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              {/* Collection Details */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2 font-dark-mystic">Mystic Kaizer Collection</h1>
                <p className="text-gray-300 mb-4 max-w-2xl">
                  Discover the mystical world of Mystic Legends, where ancient creatures come to life as unique digital collectibles. Each beast carries its own story and power.
                </p>
                {/* Collection Stats */}
                <div className="flex gap-8 text-white">
                  <div>
                    <p className="text-xl font-bold">{collectionStats.totalVolume}</p>
                    <p className="text-sm text-gray-400">Total volume</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{collectionStats.floorPrice}</p>
                    <p className="text-sm text-gray-400">Floor price</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{collectionStats.bestOffer}</p>
                    <p className="text-sm text-gray-400">Best offer</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{collectionStats.listed}</p>
                    <p className="text-sm text-gray-400">Listed</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{collectionStats.owners}</p>
                    <p className="text-sm text-gray-400">Owners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Filter + Grid Section */}
        <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto w-full px-4 py-12">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 mb-8 md:mb-0">
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-dark-mystic text-white mb-6">Price Range (Celo)</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-sm">0</span>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.1}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-yellow-400"
                />
                <span className="text-white text-sm">100</span>
              </div>
              <h2 className="text-xl font-dark-mystic text-white mb-2">Rarity</h2>
              <div className="flex flex-col gap-2 mb-6">
                {RARITIES.map(rarity => (
                  <label key={rarity} className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={selectedRarities.includes(rarity)}
                      onChange={() => setSelectedRarities(selectedRarities.includes(rarity)
                        ? selectedRarities.filter(r => r !== rarity)
                        : [...selectedRarities, rarity])}
                      className="accent-yellow-400"
                    />
                    {rarity}
                  </label>
                ))}
              </div>
              <h2 className="text-xl font-dark-mystic text-white mb-2">Sort By</h2>
              <select
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </aside>
          {/* NFT Cards Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-dark-mystic text-white mb-6">Listed NFTs</h2>
              <Button
                className="bg-green-600 text-white hover:bg-green-700 font-inter"
                onClick={handleAddListing}
              >
                Add Listing
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.listingid}
                  className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col items-center"
                >
                  <img
                    src={item.metadata?.image}
                    alt={item.metadata?.name}
                    className="w-40 h-40 object-contain mb-4 rounded-md"
                  />
                  <h2 className="text-xl font-bold text-gray-700 mb-2">
                    {item.metadata?.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 text-center">
                    {item.metadata?.description}
                  </p>
                  <p className="text-gray-800 font-semibold text-lg mb-6">
                    Price: {Number(item.price) / 10 ** 18} A-CELO
                  </p>
                  <div className="flex gap-4">
                    <Button
                      className="bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300"
                      onClick={() => handleViewDetails(item)}
                    >
                      View Details
                    </Button>
                    {account && item.seller && typeof item.seller === 'string' && 
                      account.address.toLowerCase() === item.seller.toLowerCase() ? (
                      <Button
                        className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-300"
                        onClick={() => handleRemoveFromMarket(item.listingid)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? 'Removing...' : 'Remove from Market'}
                      </Button>
                    ) : (
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                        onClick={() => handleBuy(item.listingid)}
                        disabled={isBuying}
                      >
                        {isBuying ? 'Buying...' : 'Buy Now'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Add Listing Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Add New Listing</h2>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">NFT Address</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newListing.nftAddress}
                    onChange={(e) => setNewListing({...newListing, nftAddress: e.target.value})}
                    placeholder="0x..."
                    disabled={isApproving}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Token ID</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="flex-1 p-2 border rounded"
                      value={newListing.tokenId}
                      onChange={(e) => setNewListing({...newListing, tokenId: e.target.value})}
                      placeholder="Enter token ID"
                      disabled={isApproving}
                    />
                    <a
                      href={`https://alfajores.celoscan.io/token/${newListing.nftAddress}?a=${newListing.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price (A-CELO)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                    placeholder="Enter price in A-CELO"
                    disabled={isApproving}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={handleCloseAddModal}
                  disabled={isApproving}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={handleSubmitListing}
                  disabled={isApproving}
                >
                  {isApproving ? "Approving NFT..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">{selectedItem.metadata?.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Token ID:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{selectedItem.tokenid}</p>
                    <a
                      href={`https://alfajores.celoscan.io/nft/${selectedItem.nftaddress}/${selectedItem.tokenid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        View
                      </Button>
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Price:</p>
                  <p className="font-semibold">{Number(selectedItem.price) / 10 ** 18} A-CELO</p>
                </div>
                <div>
                  <p className="text-gray-600">Seller:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold break-all">{selectedItem.seller}</p>
                    <a
                      href={`https://alfajores.celoscan.io/address/${selectedItem.seller}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        View
                      </Button>
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">NFT Address:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold break-all">{selectedItem.nftaddress}</p>
                    <a
                      href={`https://alfajores.celoscan.io/address/${selectedItem.nftaddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        View
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">NFT Stats</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                  <p className="text-gray-600">Rarity:</p>
                  <p className="font-semibold break-all">{selectedItem.metadata?.attributes?.find(attr => attr.trait_type === 'Rarity')?.value}</p>
              </div>
              <div>
                  <p className="text-gray-600">Health:</p>
                  <p className="font-semibold break-all">{selectedItem.metadata?.attributes?.find(attr => attr.trait_type === 'Health')?.value}</p>
              </div>
              <div>
                  <p className="text-gray-600">Minimum Attack:</p>
                  <p className="font-semibold break-all">{selectedItem.metadata?.attributes?.find(attr => attr.trait_type === 'Minimum Attack')?.value}</p>
              </div>
              <div>
                  <p className="text-gray-600">Maximum Attack:</p>
                  <p className="font-semibold break-all">{selectedItem.metadata?.attributes?.find(attr => attr.trait_type === 'Maximum Attack')?.value}</p>
              </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Buy Error Modal */}
        {buyError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Error Buying NFT</h2>
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {buyError}
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={() => setBuyError(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                {operationType === 'listing' ? 'Listing Created Successfully!' : 'NFT Removed Successfully!'}
              </h2>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Transaction Hash:</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">{transactionHash}</p>
                  <a
                    href={`https://alfajores.celoscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                      View
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-red-600">
                {operationType === 'listing' ? 'Failed to Create Listing' : 'Failed to Remove NFT'}
              </h2>
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setShowErrorModal(false);
                    if (operationType === 'listing') {
                      setShowAddModal(false);
                    }
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
