"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import QrScanner from "../../components/custom/scanner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../components/ui/dialog";

export default function OngoingEvent() {
  const address = useAddress();
  const [scanCount, setScanCount] = useState(0);
  const eventData = {
    title: "Event 1",
    description: "This is a description of the event",
    location: "Location 1",
    date: "2021-01-01",
    rewardCount: 10,
    id: "123",
  };

  // Generate QR code value with event and user data
  const qrCodeValue = JSON.stringify({
    eventId: eventData.id,
    userAddress: address,
  });

  return (
    <div className="flex flex-col justify-center items-center mt-16 p-4 space-y-8">
      <h1 className="text-3xl font-bold">Ongoing Event</h1>

      {address ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCode value={qrCodeValue} size={256} />
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">Your Scan Count</p>
            <p className="text-4xl font-bold">{scanCount}</p>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">{eventData.title}</h2>
            <p className="text-gray-600">{eventData.description}</p>
            <p className="text-gray-600 mt-2">{eventData.location}</p>
            <p className="text-gray-600">{eventData.date}</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Scan QR Code
              </button>
            </DialogTrigger>
            <DialogContent>
              <QrScanner />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-lg">Please connect your wallet to participate</p>
      )}
    </div>
  );
}
