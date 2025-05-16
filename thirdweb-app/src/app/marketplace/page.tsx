"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import { marketplaceService, ListingItem, NFT_CONTRACT_ADDRESS } from "@/services/marketplaceService";
import { useThirdWeb } from "@/hooks/useThirdWeb";

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

  useEffect(() => {
    const fetchData = async () => {
      const listings = await marketplaceService.fetchListings();
      setItems(listings);
    };
    fetchData();
  }, []);

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
    setNewListing({
      nftAddress: '',
      tokenId: '',
      price: ''
    });
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your wallet first");
      setOperationType('listing');
      setShowErrorModal(true);
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
          price: priceInWei
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
      setOperationType('listing');
      setShowErrorModal(true);
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
      setShowErrorModal(true);
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
    <main className="min-h-screen w-screen bg-[url('/dapp/marketplace-bg.png')] bg-cover bg-center flex items-center justify-center">
      <Navbar />
      <div className="py-10 w-full max-w-screen-lg p-6 mt-10 flex flex-col">
        <div className="flex justify-between mb-12">
          <h1 className="text-4xl font-extrabold text-white">
            Marketplace
          </h1>
          <Button 
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handleAddListing}
          >
            Add Listing
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
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

        {/* Add Listing Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Add New Listing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">NFT Address</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newListing.nftAddress}
                    onChange={(e) => setNewListing({...newListing, nftAddress: e.target.value})}
                    placeholder="Enter NFT contract address"
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
                      href={`https://alfajores.celoscan.io/token/${NFT_CONTRACT_ADDRESS}?a=${newListing.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View on Explorer
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
                  {isApproving ? "Listing NFT..." : "Submit"}
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
