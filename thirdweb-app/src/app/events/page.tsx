"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ThirdWebConnectButton from "@/components/ThirdWebConnectButton";
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import { Event, EventField } from "@curvegrid/multibaas-sdk";
import { useRouter } from "next/navigation";
import Navbar from "@/components/custom/navbar";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabase";

export default function EventListingsPage() {
  const router = useRouter();
  // const { getOrganisedEvents } = useMultiBaasWithThirdweb();

  const supabase = getSupabaseClient();
  // State for events and pagination
  const eventsPerPage = 10;
  const [events, setEvents] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const extractEvents = (data: any[]) => {
    return data.map((event) => ({
      eventId: event.event_id,
      name: event.name,
      description: event.description,
      startDate: event.start_date,
      organizer: event.organizer,
      eventContract: event.address,
      location: event.location,
      participantLimit: event.participant_limit,
      registeredParticipants: event.registered_participants,
      rewardCount: event.reward_count,
      isStarted: event.is_started
    }));
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        console.log("Fetching events from Supabase...");
        
        // First check if the table has any data
        const { data: eventCount, error: countError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
          
        console.log("Event count check:", { eventCount, countError });
        
        // Get the actual events
        const { data: eventData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
          
        console.log("Events query result:", { eventData, eventsError });
        
        if (eventsError) {
          console.error("Supabase error:", eventsError);
          return;
        }
        
        // Process the real event data
        const processedEvents = extractEvents(eventData);
        console.log("Processed events:", processedEvents);
        setEvents(processedEvents);
      } catch (error) {
        console.error("Error in fetchEvents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page]);

  return (
    <main className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <div className="relative w-screen h-[30rem]">
        <Image
          src="/dapp/events.png"
          alt="Events Banner"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <div className="max-w-4xl px-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-dark-mystic">
              Events
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Join forces with fellow Beast Legend players, share strategies,
              and build lasting friendships in our thriving communities.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-stretch w-full">
        <div className="text-white rounded-xl p-8 shadow-lg mt-8 max-w-4xl w-full flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <Spinner size={"medium"} />
            ) : events.length === 0 ? (
              <p className="text-center min-h-36">No events found.</p>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900">
                  <TableRow>
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                    <TableHead className="text-white">Start Date</TableHead>
                    <TableHead className="text-white">Organizer</TableHead>
                    <TableHead className="text-white">Contract</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow
                      key={index}
                      onClick={() => router.push(`/events/${event.eventContract}`)}
                      className="cursor-pointer hover:bg-zinc-800 transition"
                    >
                      <TableCell className="text-white">{event.eventId}</TableCell>
                      <TableCell className="text-white">{event.name}</TableCell>
                      <TableCell className="text-white">{event.description}</TableCell>
                      <TableCell className="text-white">{event.startDate}</TableCell>
                      <TableCell className="text-white">{event.organizer}</TableCell>
                      <TableCell>
                        <Link
                          href={`https://alfajores.celoscan.io/address/${event.eventContract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {event.eventContract}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button onClick={() => setPage((prev) => prev + 1)} variant="outline">
                Next
              </Button>
            </div>
            <nav className="flex flex-col items-center justify-center mt-4">
              <Link href={"/organiser"}>Organiser Page</Link>
              <Link href={"/events/create"}>Event Creation Page</Link>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
