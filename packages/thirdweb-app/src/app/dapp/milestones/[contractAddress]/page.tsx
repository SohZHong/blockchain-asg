"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { motion } from "framer-motion";
import Navigation from "@/components/landing-page/Navigation";
import { useParams } from "next/navigation";
import useMultiBaas from "@/hooks/useMultiBaas";
import { toast } from "sonner";
import VerificationModal from "@/components/verificationModal";

export default function MilestonesPage() {
  const { contractAddress } = useParams();
  const { account } = useThirdWeb();
  const { getMilestoneData, getScanCount } = useMultiBaas();
  const [scanCount, setScanCount] = useState(0);
  const [activeTab, setActiveTab] = useState("milestones");
  const [milestoneData, setMilestoneData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mintingMilestoneId, setMintingMilestoneId] = useState<number | null>(null);
  const [mintedMilestones, setMintedMilestones] = useState<{[key: number]: boolean}>({});
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<number | null>(null);
  useEffect(() => {
    if (!contractAddress || !account?.address) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get milestone requirements from contract
        const milestones = await getMilestoneData(contractAddress as string);
        console.log("Milestones from contract:", milestones);
        
        // Get user's current scan count
        const scans = await getScanCount(contractAddress as string, account.address as string);
        console.log("User scan count:", scans);
        
        setScanCount(scans as number || 0);
        
        if (milestones && Array.isArray(milestones)) {
          // Create milestone objects from the contract data
          const milestoneObjects = milestones.map((requirement, index) => ({
            id: index + 1,
            milestoneIndex: index,
            title: `Milestone ${index + 1}`,
            description: `Connect with ${requirement} friend${Number(requirement) !== 1 ? 's' : ''}`,
            requirement: Number(requirement),
            reward: `${Number(requirement) * 10} MK Tokens`,
            image: `/dapp/${index % 4 === 0 ? 'quest-bg.png' : 
                   index % 4 === 1 ? 'battle-bg.png' : 
                   index % 4 === 2 ? 'event-bg.png' : 'story-bg1.png'}`,
            completed: scans ? Number(scans) >= Number(requirement) : false,
          }));
          
          setMilestoneData(milestoneObjects);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load milestone data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contractAddress, account?.address, getMilestoneData, getScanCount]);

  const handleMintNFT = async (milestoneId: number) => {
    setMintingMilestoneId(milestoneId);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = async () => {
    if (currentMilestoneId === null) return;
    
    // Now proceed with minting after successful verification
    setMintingMilestoneId(currentMilestoneId);
    try {
      // Mint NFT logic here
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventAddress: contractAddress, 
          address: account?.address
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('NFT minted successfully!');
        
        // Update the minted milestones state
        setMintedMilestones(prev => ({
          ...prev,
          [currentMilestoneId]: true
        }));
      } else {
        throw new Error('Failed to mint NFT');
      }
    } catch (error) {
      console.error('Mint NFT error:', error);
      toast.error('Failed to mint NFT');
      throw error; // Re-throw to be caught by the verification modal
    } finally {
      setMintingMilestoneId(null);
      setCurrentMilestoneId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center text-white">
      {/* Main Content Area */}
      <div className="hidden">
            <Navigation />
        </div>
      <div className="container mx-auto pt-28 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column - Stats & Latest Friends */}
            <div className="w-full md:w-1/3">
              {/* User Stats Card */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-8">
                <h2 className="text-3xl font-bold mb-4 font-dark-mystic">Friend Network</h2>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image 
                        src="/profile.png" 
                        alt="Player Avatar" 
                        width={60} 
                        height={60} 
                        className="rounded-full border-2 border-yellow-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                      </h3>
                      <p className="text-purple-300">Mystic Explorer</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-lg">Total Scans</span>
                    <span className="text-2xl font-bold">{scanCount}</span>
                  </div>
                  
                  <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-lg">Milestones Achieved</span>
                    <span className="text-2xl font-bold">{milestoneData.filter(m => m.completed).length}/{milestoneData.length}</span>
                  </div>
                  
                  <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-lg">Event Contract</span>
                    <span className="text-xs font-bold overflow-hidden text-ellipsis">
                      {contractAddress ? 
                        `${(contractAddress as string).slice(0, 6)}...${(contractAddress as string).slice(-4)}` : 
                        'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Milestones */}
            <div className="w-full md:w-2/3">
              {/* Tab Navigation */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="flex gap-4">
                  <button 
                    className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'milestones' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('milestones')}
                  >
                    Milestones
                  </button>
                </div>
              </div>
              
              {/* Milestones Grid */}
              {milestoneData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {milestoneData.map((milestone) => (
                    <motion.div 
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`relative overflow-hidden rounded-xl h-64 group ${milestone.completed ? 'border-2 border-yellow-500' : 'border border-gray-700'}`}
                    >
                      <Image
                        src={milestone.image}
                        alt={milestone.title}
                        width={500}
                        height={300}
                        className="h-full w-full object-cover brightness-50 group-hover:brightness-75 transition-all duration-300"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex flex-col justify-end p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-2xl font-bold font-dark-mystic">{milestone.title}</h3>
                          {milestone.completed && (
                            <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full">
                              COMPLETED
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-2">{milestone.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="bg-purple-900/70 rounded-full px-3 py-1 text-sm">
                            {scanCount}/{milestone.requirement} Scans
                          </div>
                          <div className="text-yellow-400 font-medium">
                            Reward: {milestone.reward}
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (scanCount/milestone.requirement) * 100)}%` }}
                          ></div>
                        </div>
                        
                        {/* Mint button for completed milestones that haven't been minted */}
                        {milestone.completed && !mintedMilestones[milestone.id] && (
                          <button 
                            className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-2 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all"
                            disabled={mintingMilestoneId === milestone.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMintNFT(milestone.id);
                            }}
                          >
                            {mintingMilestoneId === milestone.id ? (
                              <div className="flex justify-center items-center">
                                <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                                Minting...
                              </div>
                            ) : (
                              'Mint NFT Reward'
                            )}
                          </button>
                        )}
                        
                        {/* Already minted indicator */}
                        {mintedMilestones[milestone.id] && (
                          <div className="mt-3 w-full bg-green-700/50 text-center text-white font-medium py-2 rounded-lg">
                            NFT Claimed ✓
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 text-center">
                  <p className="text-lg">No milestone data available for this event.</p>
                </div>
              )}
            </div>
          </div>
        )}
        <VerificationModal
  isOpen={isVerificationModalOpen}
  onOpenChange={setIsVerificationModalOpen}
  onVerificationSuccess={handleVerificationSuccess}
  onVerificationError={(error) => toast.error(error)}
/>
      </div>
    </div>
  );
}
