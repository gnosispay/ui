"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Spinner from "@/components/spinner";
import OTPInput from "@/components/otp-input";
import { requestEmailChange, validateEmailChangeToken } from "@/lib/otp";
import Input from "../inputs/input-base";
import Button from "../buttons/button";

interface EmailVerificationProps {
  userId: string;
  oldEmail: string;
  onVerificationSuccess: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  userId,
  oldEmail,
  onVerificationSuccess,
}) => {
  const { update } = useSession();
  const [newEmail, setNewEmail] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await requestEmailChange(newEmail);
      if (result.success) {
        setStep("verify");
      } else {
        setError(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error requesting email change:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await validateEmailChangeToken(userId, newEmail, token);
      if (result.success) {
        await update({ user: { email: newEmail } });
        onVerificationSuccess();
      } else {
        throw new Error(result.message || "Failed to verify OTP.");
      }
    } catch (error: any) {
      toast.error("Verification failed. Please try again.");
      console.error(error);
      throw error; // Propagate the error to OTPInput for attempt counting
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {step === "input" && (
        <>
          <p className="text-primary">
            Your current email: <span className="font-medium">{oldEmail}</span>
          </p>
          <p className="text-primary">
            One Time Password (OTP) verifications will be sent to the new email
            once updated.
          </p>
          <div className="space-y-4">
            <Input
              type="email"
              value={newEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEmail(e.target.value)
              }
              placeholder="New Email Address"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Button
              onClick={handleEmailChange}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner monochromatic className="w-3 h-3 mx-auto" />
              ) : (
                "Change Email"
              )}
            </Button>
          </div>
        </>
      )}
      {step === "verify" && (
        <div className="flex flex-col space-y-6">
          <p className="text-center text-primary">
            A one-time password (OTP) has been sent to{" "}
            <span className="font-semibold">{newEmail}</span>. Please check your
            inbox and enter the code below:
          </p>
          <OTPInput onComplete={handleComplete} onResend={handleEmailChange} />
          {isLoading && <Spinner monochromatic className="w-3 h-3 mx-auto" />}
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
};

export default EmailVerification;
