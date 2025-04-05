import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QrScanner = () => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      window.location.href = decodedText;
    };

    if (scanning) {
      scanner.render(onScanSuccess, console.error);
    } else {
      scanner.clear().catch(console.error);
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning]);

  return (
    <div className="text-black">
      <h1>Scan QR Code</h1>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default QrScanner;
