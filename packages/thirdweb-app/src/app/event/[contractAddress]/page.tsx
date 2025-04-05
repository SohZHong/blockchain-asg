"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import Image from "next/image";
import Link from "next/link";
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";
import { Event, EventField } from "@curvegrid/multibaas-sdk";

interface EventData {
  eventId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  startDate: string | undefined;
  organizer: string | undefined;
  eventContract: string | undefined;
}

export default function ContractAddressPage() {
  const { contractAddress } = useParams();
  const { getOrganiserEvent } = useMultiBaasWithThirdweb();

  // State for events and pagination
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);

  const extractEvents = (data: Event): EventData => {
    const inputs = data.event.inputs;

    const eventJson: EventData = {
      eventId: inputs.find((input: EventField) => input.name === "eventId")
        ?.value,
      name: inputs.find((input: EventField) => input.name === "name")?.value,
      description: inputs.find(
        (input: EventField) => input.name === "description"
      )?.value,
      startDate: inputs.find((input: EventField) => input.name === "startDate")
        ?.value,
      organizer: inputs.find((input: EventField) => input.name === "organizer")
        ?.value,
      eventContract: inputs.find(
        (input: EventField) => input.name === "eventContract"
      )?.value,
    };

    return eventJson;
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      console.log(contractAddress as `0x${string}`);
      const fetchedEvents = await getOrganiserEvent(
        contractAddress as `0x${string}`
      );
      console.log(fetchedEvents);
      if (fetchedEvents) {
        setEventData(extractEvents(fetchedEvents));
      }
      setLoading(false);
    };

    fetchEvents();
  }, [getOrganiserEvent, contractAddress]);

  if (loading) {
    return <p className="text-white text-center">Loading Events...</p>;
  }

  return (
    <div className="min-h-screen flex items-center flex-col justify-center p-6">
      {eventData ? (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">{eventData.name}</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-gray-600">{eventData.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Start Date</h2>
              <p className="text-gray-600">{eventData.startDate}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Organizer</h2>
              <p className="text-gray-600">{eventData.organizer}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Event Contract</h2>
              <Link
                href={`https://alfajores.celoscan.io/address/${eventData.eventContract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {eventData.eventContract}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white text-center">No event data found.</p>
      )}
    </div>
  );
}
