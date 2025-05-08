import { useThirdWeb } from "@/hooks/useThirdWeb";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QrScannerProps {
  onSuccess?: () => void;
}

const QrScanner = ({ onSuccess }: QrScannerProps) => {
  const { account } = useThirdWeb();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      console.log(`Code scanned = ${decodedText}`);
      setScanning(false);
      await scanner.clear();

      try {
        if (onSuccess) {
          // Validate that the scanned text is a valid JSON string
          let scannedData;
          try {
            scannedData = JSON.parse(decodedText.trim());
          } catch (parseError) {
            throw new Error(
              "Invalid QR code format. Expected valid JSON data."
            );
          }

          console.log("Scanned Data:", scannedData); // Log the scanned data for validatio

          // Validate required fields
          if (
            !scannedData.eventAddress ||
            !scannedData.address ||
            !scannedData.scannedPerson
          ) {
            throw new Error("Invalid QR code data. Missing required fields.");
          }

          const response = await fetch("/api/scan-nft", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: account?.address as string,
              eventAddress: scannedData.eventAddress,
              scannedPerson: scannedData.scannedPerson,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to process NFT scan");
          }

          onSuccess();
        }
      } catch (error) {
        console.error("Error processing scan:", error);
        // You might want to show this error to the user through a UI component
      }
    };

    const onScanError = (error: any) => {
      console.error("QR code scan error:", error);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onSuccess]);

  return (
    <div className="text-black">
      <h1>Scan QR Code</h1>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default QrScanner;
