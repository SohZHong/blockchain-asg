"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiAward } from "react-icons/fi";
import Navigation from "@/components/landing-page/Navigation";

// Dummy data for events
const eventsData = {
  upcoming: [
    {
      id: 1,
      title: "Mystic Tournament - Season 1",
      description: "Join the first official tournament of Mystic Kaiser and compete for exclusive rewards and glory!",
      date: "July 15, 2023",
      time: "18:00 UTC",
      location: "Virtual Arena",
      image: "/dapp/event-bg.png",
      participants: 128,
      rewards: "5000 MK Tokens + Exclusive NFT",
      registrationOpen: true,
    },
    {
      id: 2,
      title: "Community Meetup - Taipei",
      description: "Meet fellow Mystic Kaiser players in Taipei for networking, mini-games, and exclusive sneak peeks.",
      date: "July 23, 2023",
      time: "14:00 UTC+8",
      location: "Taipei, Taiwan",
      image: "/dapp/story-bg1.png",
      participants: 42,
      rewards: "Limited Edition Badge + 100 MK Tokens",
      registrationOpen: true,
    },
    {
      id: 3,
      title: "Beast Training Workshop",
      description: "Learn advanced strategies and techniques to train and evolve your mythical beasts.",
      date: "August 5, 2023",
      time: "16:00 UTC",
      location: "Virtual Training Grounds",
      image: "/dapp/battle-bg.png",
      participants: 75,
      rewards: "Training Certificate + Beast Power-Up",
      registrationOpen: true,
    },
  ],
  registered: [
    {
      id: 4,
      title: "Alliance Formation Summit",
      description: "Form alliances with other players to tackle upcoming raid bosses and expand your territory.",
      date: "July 10, 2023",
      time: "19:00 UTC",
      location: "Grand Council Hall",
      image: "/dapp/quest-bg.png",
      participants: 87,
      rewards: "Alliance Crest + Territory Expansion",
      registrationOpen: false,
    },
  ],
  past: [
    {
      id: 5,
      title: "Beta Launch Party",
      description: "Celebrating the successful beta launch of Mystic Kaiser with early adopters and community members.",
      date: "June 15, 2023",
      time: "20:00 UTC",
      location: "Main Kingdom Hall",
      image: "/dapp/event-bg.png",
      participants: 256,
      rewards: "Beta Tester Badge + 500 MK Tokens",
      registrationOpen: false,
      results: "Successful launch with over 250 participants. Players received exclusive badges and tokens.",
    },
    {
      id: 6,
      title: "Mini-Tournament: Beasts of Fire",
      description: "A specialized tournament featuring only fire-type beasts. Winners earned unique fire-based rewards.",
      date: "June 28, 2023",
      time: "17:00 UTC",
      location: "Fire Arena",
      image: "/dapp/battle-bg.png",
      participants: 64,
      rewards: "Fire Element Boost + 300 MK Tokens",
      registrationOpen: false,
      results: "Champion: Crypto Explorer (0x1234...5678). Runner-up: NFT Hunter (0xabcd...ef01).",
    },
  ],
};

export default function EventsPage() {
  const { account } = useThirdWeb();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Function to register for an event (mock)
  const handleRegister = (eventId: number) => {
    alert(`Successfully registered for event #${eventId}!`);
  };

  // Render individual event card
  const renderEventCard = (event: any, isRegistered = false, isPast = false) => (
    <motion.div 
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden"
    >
        <div className="hidden">
            <Navigation />
        </div>  
      <div className="relative h-48">
        <Image
          src={event.image}
          alt={event.title}
          width={500}
          height={300}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-4">
          <h3 className="text-xl md:text-2xl font-bold font-dark-mystic">{event.title}</h3>
          <div className="flex items-center gap-2 text-yellow-400">
            <FiCalendar className="shrink-0" />
            <span className="text-sm">{event.date} • {event.time}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-300 mb-4">{event.description}</p>
        
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-purple-400 shrink-0" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiUsers className="text-purple-400 shrink-0" />
            <span>{event.participants} Participants</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiAward className="text-purple-400 shrink-0" />
            <span>{event.rewards}</span>
          </div>
          
          {isPast && event.results && (
            <div className="mt-2 p-3 bg-purple-900/30 rounded-lg">
              <h4 className="font-semibold mb-1">Results:</h4>
              <p className="text-sm text-gray-300">{event.results}</p>
            </div>
          )}
        </div>
        
        {!isPast && (
          <div className="flex justify-end">
            {isRegistered ? (
              <span className="px-4 py-2 bg-purple-900 text-white rounded-lg">Registered</span>
            ) : (
              event.registrationOpen && (
                <button 
                  onClick={() => handleRegister(event.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Register Now
                </button>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center text-white">
      {/* Main Content Area */}
      <div className="container mx-auto pt-28 px-4 pb-10">
        <div className="flex flex-col gap-8">
          {/* Header with tabs */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-dark-mystic">Mystic Events</h1>
                <p className="text-gray-300 mt-2">Discover, join and track community events</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image 
                    src="/profile.png" 
                    alt="Player Avatar" 
                    width={50} 
                    height={50} 
                    className="rounded-full border-2 border-yellow-500"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                  </h3>
                  <p className="text-purple-300 text-sm">Mystic Explorer</p>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-4">
              <button 
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Events
              </button>
              <button 
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'registered' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                onClick={() => setActiveTab('registered')}
              >
                My Registered Events
              </button>
              <button 
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'past' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                onClick={() => setActiveTab('past')}
              >
                Past Events
              </button>
            </div>
          </div>
          
          {/* Content area */}
          <div>
            {activeTab === 'upcoming' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-dark-mystic">Upcoming Events</h2>
                  <span className="bg-purple-800 px-3 py-1 rounded-full text-sm">
                    {eventsData.upcoming.length} Events
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsData.upcoming.map(event => renderEventCard(event))}
                </div>
              </>
            )}
            
            {activeTab === 'registered' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-dark-mystic">My Registered Events</h2>
                  <span className="bg-purple-800 px-3 py-1 rounded-full text-sm">
                    {eventsData.registered.length} Events
                  </span>
                </div>
                
                {eventsData.registered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventsData.registered.map(event => renderEventCard(event, true))}
                  </div>
                ) : (
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-10 text-center">
                    <h3 className="text-xl font-bold mb-2">No Registered Events</h3>
                    <p className="text-gray-400 mb-6">You haven&apos;t registered for any upcoming events yet.</p>
                    <button 
                      onClick={() => setActiveTab('upcoming')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Browse Events
                    </button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'past' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-dark-mystic">Past Events</h2>
                  <span className="bg-purple-800 px-3 py-1 rounded-full text-sm">
                    {eventsData.past.length} Events
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsData.past.map(event => renderEventCard(event, false, true))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
