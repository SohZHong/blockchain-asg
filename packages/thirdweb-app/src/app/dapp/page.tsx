"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineSwap, AiOutlineCopy } from "react-icons/ai";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import Navigation from "@/components/landing-page/Navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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

// Sidebar component
function Sidebar({
  account,
  isEventCreator,
  setIsEventCreator,
  selectedTab,
  setSelectedTab,
  router,
  sidebarOpen,
  setSidebarOpen,
}: any) {
  // Copy address to clipboard
  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied!");
    }
  };
  return (
    <aside
      className={`z-20 fixed md:static left-0 top-0 h-full md:h-auto w-4/5 max-w-xs md:w-1/4 bg-black/40 backdrop-blur-lg rounded-xl p-4 flex flex-col shadow-xl border border-white/10 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      tabIndex={-1}
    >
      {/* Sidebar close button for mobile */}
      <button
        className="md:hidden absolute top-4 right-4 text-white text-2xl focus:outline-dashed"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        ×
      </button>
      <div className="mb-2">
        <Image src="/landing-page/white-title.svg" alt="Mystic Kaizer" width={300} height={100} />
      </div>
      {/* Character Profile */}
      <div className="flex items-center gap-4 border-b border-gray-600 pb-4 px-2">
        <div className="relative">
          <Image
            src="/profile.png"
            alt="Player Avatar"
            width={64}
            height={64}
            className="rounded-full border-2 border-purple-500"
          />
        </div>
        <div className="flex flex-col w-full">
          <h2 className="text-lg font-bold font-dark-mystic text-white">
            {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
          </h2>
          <div className="flex items-center gap-1 text-gray-300 text-xs">
            <span>ID: {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}</span>
            <button
              onClick={handleCopy}
              className="ml-1 p-1 rounded hover:bg-gray-700"
              title="Copy address"
              tabIndex={0}
            >
              <AiOutlineCopy className="text-white text-base" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsEventCreator((v: boolean) => !v)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="Switch role"
            tabIndex={0}
          >
            <AiOutlineSwap className="text-white text-2xl" />
          </button>
          <span className="text-xs text-gray-300">
            {isEventCreator ? "Event Creator" : "User"}
          </span>
        </div>
      </div>
      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2 mt-6 font-dark-mystic text-lg">
        {[
          { id: "home", label: "HOME" },
          { id: "beasts", label: "MY BEASTS" },
          { id: "shop", label: "MARKETPLACE" },
        ].map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-150 font-medium tracking-wide ${
              selectedTab === item.id
                ? "bg-purple-800 text-white scale-105 shadow-lg"
                : "hover:bg-purple-700 hover:text-white text-gray-200"
            }`}
            onClick={() => {
              if (item.id === "shop") router.push("/dapp/marketplace");
              else setSelectedTab(item.id);
            }}
            tabIndex={0}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ActivityCard component
function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card
      onClick={activity.onClick}
      tabIndex={0}
      className={`relative overflow-hidden group cursor-pointer h-56 md:h-72 w-full flex flex-col justify-end ${activity.color} transition-transform hover:scale-105 hover:shadow-2xl border-none focus:outline-dashed`}
      style={{ minHeight: "14rem" }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") activity.onClick();
      }}
      aria-label={activity.title}
    >
      <Image
        src={activity.image}
        alt={activity.title}
        width={600}
        height={400}
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ minHeight: "14rem" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70 z-10" />
      <div className="relative z-20 flex flex-col justify-end h-full p-6">
        <h3 className="text-2xl font-bold mb-2 font-dark-mystic drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white">
          {activity.title}
        </h3>
        <p className="text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{activity.subtitle}</p>
        {"isEvent" in activity && (
          <div className="mt-2 bg-black/60 backdrop-blur-sm p-2 rounded">
            <p className="text-xs text-white">
              Contract: {(activity as EventActivity).eventData.address.slice(0, 6)}...{(activity as EventActivity).eventData.address.slice(-4)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Dapp() {
  const [selectedTab, setSelectedTab] = useState("home");
  const [isEventCreator, setIsEventCreator] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
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
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching events:", error);
          toast.error("Failed to load events");
          return;
        }
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
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
          onClick: () => router.push("/event/create"),
        },
        {
          id: "manage",
          title: "Manage Event",
          subtitle: "MANAGE EXISTING EVENTS",
          image: "/dapp/event-bg.png",
          color: "bg-red-700",
          onClick: () => router.push("/event/manage"),
        },
      ]
    : [
        {
          id: "event",
          title: "Events",
          subtitle: "Find Events",
          image: "/dapp/event-bg.png",
          color: "bg-amber-700",
          onClick: () => router.push("/event"),
        },
        {
          id: "dapp/battle",
          title: "Battle",
          subtitle: "PVP Arena",
          image: "/dapp/battle-bg.png",
          color: "bg-blue-700",
          onClick: () => router.push("/dapp/battle"),
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

  // Loading skeleton for activities
  const ActivitySkeleton = () => (
    <div className="h-56 md:h-72 w-full rounded-xl bg-gray-800/70 animate-pulse" style={{ minHeight: "14rem" }} />
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center text-gray-400 py-12">
      <p>No activities available yet. Check back soon!</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-right text-white flex flex-col">
      {/* Header */}
      <header className="w-full bg-black/60 backdrop-blur-md shadow-lg z-10 px-0 md:px-6 py-4 flex items-center justify-between relative">
        <button
          className="md:hidden text-white text-3xl ml-4 focus:outline-dashed"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          ☰
        </button>
        <span className="font-dark-mystic text-2xl font-bold tracking-wider hidden md:block">Dapp Dashboard</span>
      </header>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-8 relative">
        {/* Sidebar (collapsible on mobile) */}
        <Sidebar
          account={account}
          isEventCreator={isEventCreator}
          setIsEventCreator={setIsEventCreator}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          router={router}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        {/* Main Content Area */}
        <section className="flex-1 flex flex-col">
          {/* Events Title */}
          <div className="mb-8 mt-2 md:mt-0 flex items-center justify-between px-2 md:px-0">
            <h2 className="text-3xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Available Activities</h2>
            {fetchingEvents && <span className="text-gray-300">Loading events...</span>}
          </div>
          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-2 md:px-0">
            {fetchingEvents
              ? Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
              : activities.length === 0
              ? <EmptyState />
              : activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
          </div>
        </section>
      </main>
    </div>
  );
}
