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

export default function EventListingsPage() {
  const router = useRouter();
  const { getOrganisedEvents } = useMultiBaasWithThirdweb();

  // State for events and pagination
  const eventsPerPage = 10;
  const [events, setEvents] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const extractEvents = (data: Event[]) => {
    return data.map((item: Event) => {
      const inputs = item.event.inputs;

      return {
        eventId: inputs.find((input: EventField) => input.name === "eventId")
          ?.value,
        name: inputs.find((input: EventField) => input.name === "name")?.value,
        description: inputs.find(
          (input: EventField) => input.name === "description"
        )?.value,
        startDate: inputs.find(
          (input: EventField) => input.name === "startDate"
        )?.value,
        organizer: inputs.find(
          (input: EventField) => input.name === "organizer"
        )?.value,
        eventContract: inputs.find(
          (input: EventField) => input.name === "eventContract"
        )?.value,
      };
    });
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const fetchedEvents = await getOrganisedEvents(page, eventsPerPage);
      if (fetchedEvents) {
        setEvents(extractEvents(fetchedEvents));
      }
      setLoading(false);
    };

    fetchEvents();
  }, [page, getOrganisedEvents]);

  return (
    <main className="p-6 min-h-[100vh] container max-w-screen-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Event Listings</h1>
          <ThirdWebConnectButton />
        </div>

        {loading ? (
          <Spinner size={"medium"} />
        ) : events.length === 0 ? (
          <p className="text-center">No events found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Contract</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow
                  key={index}
                  onClick={() => router.push(`/event/${event.eventContract}`)}
                  className="cursor-pointer"
                >
                  <TableCell>{event.eventId}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>{event.startDate}</TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://alfajores.celoscan.io/address/${event.eventContract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {event.eventContract}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Controls */}
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
        <nav className="flex flex-col items-center justify-center">
          <Link href={"/"}>Home Page</Link>
          <Link href={"/organiser"}>Organiser Page</Link>
          <Link href={"/event/create"}>Event Creation Page</Link>
        </nav>
      </div>
    </main>
  );
}
