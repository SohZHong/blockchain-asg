"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/common/supabase";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";

interface EventData {
  eventId: number;
  name: string;
  description: string;
  location: string;
  eventContract: string;
  startDate: string;
  participantLimit: number;
  registeredParticipant: number;
  organizer: string;
  rewardCount: number;
  isStarted: boolean;
}

export default function ContractAddressPage() {
  const { contractAddress } = useParams();
  const [eventData, setEventData] = useState<EventData>();
  const [canStartEvent, setCanStartEvent] = useState<boolean>(false);
  const [isOrganiser, setIsOrganiser] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { account } = useThirdWeb();

  useEffect(() => {
    const fetchEventFromSupabase = async () => {
      if (!contractAddress) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("address", contractAddress as string)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
      } else {
        if (account?.address === data.organizer!) {
          setIsOrganiser(true);
          // Check if event can be started
          const canStartEvent =
            account.address.toLowerCase() === data.organizer!.toLowerCase() &&
            new Date() > new Date(eventData!.startDate);

          setCanStartEvent(canStartEvent);
        }
        setEventData({
          eventId: data.event_id!,
          name: data.name!,
          description: data.description!,
          location: data.location!,
          eventContract: data.address,
          organizer: data.organizer!,
          participantLimit: data.participant_limit!,
          registeredParticipant: data.registered_participants!,
          startDate: data.start_date!,
          rewardCount: data.reward_count!,
          isStarted: data.is_started,
        });
      }

      setLoading(false);
    };

    fetchEventFromSupabase();
  }, [contractAddress, account]);

  if (loading) {
    return (
      <div>
        <Spinner />
        <p className="text-white text-center">Loading Event...</p>
      </div>
    );
  }

  const onClick = async () => {
    try {
      const response = await fetch("/api/event/start", {
        method: "POST",
      });
      const res = await response.json();
      if (res.success) {
        toast("Event Started", {
          description: JSON.stringify(res, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          ),
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      } else {
        toast("Error Starting Event", {
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center flex-col justify-center p-6">
      {eventData ? (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">{eventData.name}</h1>
            <h3 className="text-lg font-semibold mb-4">
              Registered: {eventData.registeredParticipant}
            </h3>
          </div>

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
              <h2 className="text-lg font-semibold">Started</h2>
              <p className="text-gray-600">{eventData.isStarted}</p>
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
      {eventData?.isStarted && isOrganiser && (
        <div className="mt-6">
          <Button
            onClick={onClick}
            disabled={!canStartEvent}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Start Event
          </Button>
        </div>
      )}
    </div>
  );
}
