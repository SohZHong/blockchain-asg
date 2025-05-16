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
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";


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
  const [isRegistering, setIsRegistering] = useState(false);
  const [isStartingEvent, setIsStartingEvent] = useState(false);
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
            account?.address?.toLowerCase() === data.organizer!.toLowerCase()
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
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" />
          <p className="text-white text-lg mt-4 font-medium">Loading Event...</p>
        </div>
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
      setIsStartingEvent(true);
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
        // Refresh page after starting event
        window.location.reload();
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
      toast.error("Failed to start the event");
    } finally {
      setIsStartingEvent(false);
    }
  };

  const onRegisteringEvent = async () => {
    try {
      setIsRegistering(true);
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
        // Refresh data after registration
        window.location.reload();
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
      toast.error("Failed to register for event");
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // This renders an ongoing event for participants (with QR code)
  const renderOngoingEvent = () => {
    if (!eventData || !eventData.isStarted || isOrganiser) return null;
    
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl mb-8">
          <div className="p-8 flex flex-col md:flex-row gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg flex-shrink-0">
              <QRCode value={userInfo} size={200} />
            </div>
            
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">{eventData.name}</h1>
                <p className="text-gray-300 mb-6">{eventData.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CalendarIcon className="h-5 w-5" />
                    <span>{formatDate(eventData.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{eventData.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <UserIcon className="h-5 w-5" />
                    <span>{eventData.registeredParticipant} / {eventData.participantLimit} registered</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg">
                      Scan QR Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <QrScanner onSuccess={handleScanSuccess} />
                  </DialogContent>
                </Dialog>
                
                <div className="text-center md:text-left mt-4">
                  <p className="text-gray-300 font-medium">Your Scan Count</p>
                  <p className="text-3xl font-bold text-white">{scanCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // This renders an event that hasn't started yet or has already started
  const renderUpcomingEvent = () => {
    if (!eventData || (eventData.isStarted && !isOrganiser)) return null;
    
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute bottom-4 left-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                eventData.isStarted 
                  ? "bg-purple-100 text-purple-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {eventData.isStarted ? "Ongoing" : "Upcoming"}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">{eventData.name}</h1>
                <p className="text-gray-400 mb-6 max-w-2xl">{eventData.description}</p>
              </div>
              
              <div className="text-right mb-4 md:mb-0">
                <div className="bg-gray-800 rounded-lg px-4 py-3 inline-block">
                  <p className="text-sm text-gray-400">Registered</p>
                  <p className="text-xl font-bold text-white">
                    {eventData.registeredParticipant} / {eventData.participantLimit}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-gray-400 text-sm">Date & Time</p>
                  <p className="text-white">{formatDate(eventData.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">{eventData.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserIcon className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-gray-400 text-sm">Organizer</p>
                  <p className="text-white truncate max-w-[200px]">
                    {eventData.organizer.slice(0, 6)}...{eventData.organizer.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
              <div>
                <Link
                  href={`https://alfajores.celoscan.io/address/${eventData.eventContract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  View contract on explorer
                </Link>
              </div>
              
              <div>
                {isOrganiser ? (
                  <Button
                    onClick={onStartEvent}
                    disabled={!canStartEvent || isStartingEvent || eventData.isStarted}
                    className={`${
                      canStartEvent && !eventData.isStarted
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gray-600 cursor-not-allowed"
                    } text-white font-bold py-3 px-6 rounded-lg`}
                  >
                    {isStartingEvent ? (
                      <>
                        <Spinner size="small" /> 
                        <span className="ml-2">Starting...</span>
                      </>
                    ) : eventData.isStarted ? (
                      <>Event Already Started</>
                    ) : (
                      <>Start Event</>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={onRegisteringEvent}
                    disabled={isRegistering || eventData.isStarted}
                    className={`${
                      !eventData.isStarted
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "bg-gray-600 cursor-not-allowed"
                    } text-white font-bold py-3 px-8 rounded-lg min-w-[150px]`}
                  >
                    {isRegistering ? (
                      <>
                        <Spinner size="small" /> 
                        <span className="ml-2">Registering...</span>
                      </>
                    ) : eventData.isStarted ? (
                      <>Registration Closed</>
                    ) : (
                      <>Register</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-4 pt-24 pb-16 flex flex-col items-center">
        {account?.address ? (
          <>
            {/* For participants of ongoing events, show QR code */}
            {eventData?.isStarted && !isOrganiser && renderOngoingEvent()}
            
            {/* Always show the event details card */}
            {renderUpcomingEvent()}
          </>
        ) : (
          <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to view event details and register</p>
          </div>
        )}
      </div>
    </div>
  );
}
