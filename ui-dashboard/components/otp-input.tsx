import React, { useState } from "react";
import VerificationInput from "react-verification-input";
import { twMerge } from "tailwind-merge";
import { Check } from "@phosphor-icons/react";
import { OTP_LENGTH } from "@gnosispay/email-otp-verification";
import { MAX_SIGNIN_ATTEMPTS } from "@/lib/constants";
import Button from "./buttons/buttonv2";

interface OTPInputProps {
  onComplete: (token: string) => Promise<void>;
  onResend: () => Promise<void>;
}

const OTPInput: React.FC<OTPInputProps> = ({ onComplete, onResend }) => {
  const [token, setToken] = useState<string>("");
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [resent, setResent] = useState<boolean>(false);

  const handleTokenChange = async (value: string) => {
    setToken(value);

    if (value.length === OTP_LENGTH) {
      setAttemptsCount(attemptsCount + 1);
      try {
        await onComplete(value);
      } catch (error) {
        setToken("");
        setError("Verification failed. Please try again.");

        if (attemptsCount === MAX_SIGNIN_ATTEMPTS - 1) {
          setError(
            "You've reached the maximum number of attempts. Please request a new OTP.",
          );
          setInputDisabled(true);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <VerificationInput
        value={token}
        autoFocus={true}
        inputProps={{
          autoComplete: "one-time-code",
          inputMode: "numeric",
          disabled: inputDisabled,
        }}
        validChars="0-9"
        placeholder=""
        onChange={handleTokenChange}
        classNames={{
          container: "flex gap-2 outline-0 focus:outline-0",
          character: twMerge(
            "rounded-md p-2 text-center text-xl focus:outline-0",
            inputDisabled && "bg-gray-200",
          ),
          characterSelected: "border-0 outline-high-contrast",
          characterInactive: twMerge(
            "border border-low-contrast bg-gp-bg-subtle",
            inputDisabled && "bg-gray-200",
          ),
          characterFilled: twMerge(
            "border-low-contrast text-black",
            inputDisabled && "bg-gray-200",
          ),
        }}
      />
      {error && (
        <div className="bg-red-100 px-2 py-1 text-red-900 text-xs rounded-lg">
          {error}
        </div>
      )}
      {resent ? (
        <Button disabled className="w-full mt-12">
          <Check /> One-time password resent
        </Button>
      ) : (
        <Button
          className="w-full mt-12"
          onClick={() => {
            setResent(true);
            onResend();
          }}
        >
          Resend new one-time password
        </Button>
      )}
    </div>
  );
};

export default OTPInput;
