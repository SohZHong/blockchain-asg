"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/common/supabase";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import QrScanner from "@/components/custom/scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/custom/navbar";

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
  const [scanCount, setScanCount] = useState(0);
  const { account } = useThirdWeb();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleScanSuccess = async () => {
    setScanCount((prev) => prev + 1);
    setDialogOpen(false);
    window.location.reload();
  };

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
          const eventStartDate = new Date(data.start_date!);
          const today = new Date();
          const canStartEvent =
            account?.address?.toLowerCase() === data.organizer!.toLowerCase() &&
            eventStartDate.toDateString() === today.toDateString();
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

  const userInfo = JSON.stringify({
    eventAddress: contractAddress,
    address: account?.address as string,
    scannedPerson: account?.address as string,
  });

  const onStartEvent = async () => {
    try {
      const response = await fetch("/api/event/start", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          eventAddress: contractAddress,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast("Event Started", {
          description: "Event has been started successfully",
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

  const onRegisteringEvent = async () => {
    try {
      const response = await fetch("/api/event/register", {
        method: "POST",
        body: JSON.stringify({
          address: account?.address as string,
          eventAddress: contractAddress,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast("Registration Successful", {
          description: "You have successfully registered for this event",
          action: {
            label: "Close",
            onClick: () => console.log("Closed"),
          },
        });
      } else {
        toast("Error Joining Event", {
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
      <Navbar />
      {eventData && !eventData.isStarted && (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">{eventData?.name}</h1>
            <h3 className="text-lg font-semibold mb-4">
              Registered: {eventData?.registeredParticipant}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-gray-600">{eventData?.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Start Date</h2>
              <p className="text-gray-600">{eventData?.startDate}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Started</h2>
              <p className="text-gray-600">{eventData?.isStarted}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Organizer</h2>
              <p className="text-gray-600">{eventData?.organizer}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Event Contract</h2>
              <Link
                href={`https://alfajores.celoscan.io/address/${eventData?.eventContract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {eventData?.eventContract}
              </Link>
            </div>
          </div>
        </div>
      )}
      {eventData && !eventData.isStarted && isOrganiser && (
        <div className="mt-6">
          <Button
            onClick={onStartEvent}
            disabled={!canStartEvent}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Start Event
          </Button>
        </div>
      )}
      {!loading && eventData && eventData.isStarted && !isOrganiser && (
        <>
          <h1 className="text-3xl font-bold">Ongoing Event</h1>

          {account?.address ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCode value={userInfo} size={256} />
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold">Your Scan Count</p>
                <p className="text-4xl font-bold">{scanCount}</p>
              </div>

              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">{eventData.name}</h2>
                <p className="text-gray-600">{eventData.description}</p>
                <p className="text-gray-600 mt-2">{eventData.location}</p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Scan QR Code
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Scan QR Code</DialogTitle>
                  </DialogHeader>
                  <QrScanner onSuccess={handleScanSuccess} />
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <p className="text-lg">Please connect your wallet to participate</p>
          )}
        </>
      )}
      {!loading && eventData && !eventData.isStarted && !isOrganiser && (
        <div className="mt-6">
          <Button
            onClick={onRegisteringEvent}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Register
          </Button>
        </div>
      )}
    </div>
  );
}
