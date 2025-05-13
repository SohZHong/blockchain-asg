"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineSwap } from "react-icons/ai";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import Navigation from "@/components/landing-page/Navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

// Define interface for event data
interface EventData {
  id: number;
  name: string;
  description: string;
  address: string;
  created_at: string;
  image_url?: string;
}

// Define interfaces for the activity items
interface BaseActivity {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  onClick: () => void;
}

interface EventActivity extends BaseActivity {
  isEvent: true;
  eventData: EventData;
}

type Activity = BaseActivity | EventActivity;

export default function Dapp() {
  const [selectedTab, setSelectedTab] = useState("home");
  const [isEventCreator, setIsEventCreator] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useThirdWeb();
  const [events, setEvents] = useState<EventData[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(false);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setFetchingEvents(true);
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching events:', error);
          toast.error('Failed to load events');
          return;
        }
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setFetchingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Handle navigation to milestone page with contract address
  const handleMilestoneClick = (event: EventData) => {
    if (event.address) {
      router.push(`/dapp/milestones/${event.address}`);
    }
  };

  // Mock data for activities
  const basicActivities = isEventCreator
    ? [
        {
          id: "event/create",
          title: "Create Event",
          subtitle: "CREATE NEW EVENT",
          image: "/dapp/story-bg1.png",
          color: "bg-green-700",
          onClick: () => router.push('/event/create'),
        },
        {
          id: "manage",
          title: "Manage Event",
          subtitle: "MANAGE EXISTING EVENTS",
          image: "/dapp/event-bg.png",
          color: "bg-red-700",
          onClick: () => router.push('/event/manage'),
        },
      ]
    : [
        {
          id: "event",
          title: "Events",
          subtitle: "Find Events",
          image: "/dapp/event-bg.png",
          color: "bg-amber-700",
          onClick: () => router.push('/event'),
        },
        {
          id: "dapp/battle",
          title: "Battle",
          subtitle: "PVP Arena",
          image: "/dapp/battle-bg.png",
          color: "bg-blue-700",
          onClick: () => router.push('/dapp/battle'),
        },
      ];

  // Generate event activities from the events fetched from Supabase
  const eventActivities = events.map((event) => ({
    id: `event-${event.id}`,
    title: event.name,
    subtitle: "View Milestones",
    image: event.image_url || "/dapp/quest-bg.png",
    color: "bg-purple-700",
    onClick: () => handleMilestoneClick(event),
    isEvent: true,
    eventData: event,
  }));

  // Combine basic activities with event activities
  const activities = [...basicActivities, ...eventActivities] as Activity[];

  // Main dapp content
  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-right text-white">
      <div className="hidden">
        <Navigation />
      </div>
      {/* Main Content Area */}
      <div className="flex justify-between h-[calc(100vh-5rem)] p-6">
        {/* Left Sidebar - Character Info */}
        <div className="w-1/4 bg-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col">
          <Image
            src="/landing-page/white-title.svg"
            alt="Title"
            onClick={() => router.push('/')}
            width={320}
            height={100}
            className="object-cover w-full items-center cursor-pointer"
          />

          {/* Character Profile */}
          <div className="flex items-center gap-4 border-b border-gray-600 pb-4 px-5">
            <div className="relative">
              <Image
                src="/profile.png"
                alt="Player Avatar"
                width={100}
                height={100}
                className="rounded-full border-2 border-yellow-500"
              />
            </div>

            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-bold font-dark-mystic">
                {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
              </h2>
              <p className="text-gray-300 text-sm">
                ID: {account?.address?.slice(0, 6)}...
                {account?.address?.slice(-4)}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => setIsEventCreator(!isEventCreator)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <AiOutlineSwap className="text-white text-3xl" />
              </button>
              <span className="text-sm text-gray-300">
                {isEventCreator ? "Event Creator" : "User"}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-2 mt-6 font-dark-mystic text-2xl">
            <button
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTab === "home" ? "bg-purple-800" : "hover:bg-gray-800"
              }`}
              onClick={() => setSelectedTab("home")}
            >
              <span className="font-medium">Home</span>
            </button>

            <button
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTab === "beasts" ? "bg-purple-800" : "hover:bg-gray-800"
              }`}
              onClick={() => setSelectedTab("beasts")}
            >
              <span className="font-medium">My Beasts</span>
            </button>

            <button
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTab === "shop" ? "bg-purple-800" : "hover:bg-gray-800"
              }`}
              onClick={() => router.push('/marketplace')}
            >
              <span className="font-medium">Marketplace</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-6">
          {/* Events Title */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold">Available Activities</h2>
            {fetchingEvents && <p className="text-gray-300">Loading events...</p>}
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-15rem)]">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={activity.onClick}
                className={`relative overflow-hidden rounded-xl ${activity.color} group cursor-pointer h-72`}
              >
                <Image
                  src={activity.image}
                  alt={activity.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold mb-2 font-dark-mystic">
                    {activity.title}
                  </h3>
                  <p className="text-gray-300">{activity.subtitle}</p>
                  
                  {/* Display event information if this is an event */}
                  {'isEvent' in activity && (
                    <div className="mt-2 bg-black/40 backdrop-blur-sm p-2 rounded">
                      <p className="text-xs text-white">Contract: {(activity as EventActivity).eventData.address.slice(0, 6)}...{(activity as EventActivity).eventData.address.slice(-4)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
