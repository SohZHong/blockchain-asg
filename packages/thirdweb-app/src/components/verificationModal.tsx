"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationSuccess: () => Promise<void>;
  onVerificationError?: (error: string) => void;
}

export default function VerificationModal({
  isOpen,
  onOpenChange,
  onVerificationSuccess,
  onVerificationError
}: VerificationModalProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Generate a user ID when the modal opens
    if (isOpen) {
      setUserId(uuidv4());
      setErrorMessage(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  if (!userId) return null;

  // Create the SelfApp configuration with name disclosure
  const selfApp = new SelfAppBuilder({
    appName: "Mystic Kaizer",
    scope: "mystic-kaizer",
    endpoint: "https://justanendpoint.vercel.app/api/verify",
    userId,
    disclosures: {
      name: true
    }
  }).build();

  const handleVerificationSuccess = async () => {
    try {
      setIsVerifying(true);
      // Call the parent's onVerificationSuccess handler
      await onVerificationSuccess();
      // Close the modal after success
      onOpenChange(false);
    } catch (error) {
      let message = "Verification failed";
      if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
      if (onVerificationError) {
        onVerificationError(message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center">Verify to Mint Your NFT</DialogTitle>
        </DialogHeader>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="text-center mb-4">
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        )}
        
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Verifying your identity...</p>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleVerificationSuccess}
              size={300}
            />
          </div>
        )}
        
        <div className="text-sm text-gray-500 text-center mt-2">
          Scan the QR code with the Self app to verify your identity and mint your NFT
        </div>
        
        <Button 
          onClick={() => onOpenChange(false)}
          variant="outline"
          className="mt-4"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}