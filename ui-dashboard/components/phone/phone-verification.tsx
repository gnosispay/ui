"use client";

import { useEffect } from "react";
import {
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
} from "react-phone-number-input";
import { twMerge } from "tailwind-merge";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import VerificationInput from "react-verification-input";
import Spinner from "@/components/spinner";
import { usePhoneVerification } from "@/hooks/use-phone-verification";
import Button from "@/components/buttons/buttonv2";
import Dialog from "../dialog";
import PhoneInput from "./phone-input";

const PhoneVerification: React.FC<{
  userPhoneNumber?: string;
  onSuccess: (...args: any[]) => void;
  onVerificationDialogClose?: () => void;
}> = ({ userPhoneNumber, onSuccess, onVerificationDialogClose }) => {
  const {
    loading,
    codeLoading,
    phoneNumber,
    verificationSent,
    verificationCode,
    error,
    validPhoneNumberEntered,
    codeError,
    handleSendVerification,
    handleVerifyCode,
    setVerificationCode,
    setPhoneNumber,
    setVerificationSent,
    validatePhoneNumber,
    setError,
  } = usePhoneVerification(userPhoneNumber, onSuccess);

  // Effect to reset error when phone number is valid
  useEffect(() => {
    if (phoneNumber && isPossiblePhoneNumber(phoneNumber)) {
      setError(false);
    }
  }, [phoneNumber, setError]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <PhoneInput
          value={phoneNumber}
          onChange={(value) => {
            setPhoneNumber(value);
          }}
          onBlur={() => {
            validatePhoneNumber();
          }}
        />
        {error && (
          <div className="flex w-full items-center gap-2 rounded-lg border-2 border-red-300 bg-red-200 p-2 text-red-900">
            <div className="bg-red-20 relative flex aspect-square h-8 w-8 items-center justify-center rounded-full">
              <WarningCircle size={20} />
            </div>
            <p className="text-left text-sm">
              Please enter a valid phone number.
            </p>
          </div>
        )}
        <Button
          className="w-full"
          onClick={handleSendVerification}
          disabled={loading || error || !validPhoneNumberEntered}
        >
          {loading && <Spinner monochromatic className="w-6 h-6" />}
          {loading ? "Sending..." : "Continue"}
        </Button>
      </div>
      <Dialog
        isOpen={verificationSent}
        handleClose={() => {
          onVerificationDialogClose && onVerificationDialogClose();
          setVerificationSent(false);
        }}
        containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
      >
        <div className="border-b border-stone-200 pb-4 -mx-4 -mt-1">
          <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
            Enter verification code
          </h3>
        </div>
        <p className="text-primary text-center">
          We sent a 6-digit verification code to{" "}
          {phoneNumber && formatPhoneNumberIntl(phoneNumber)}. Please enter the code below.
        </p>
        <div className="flex items-center justify-center">
          <VerificationInput
            autoFocus={true}
            inputProps={{ autoComplete: "one-time-code", inputMode: "numeric" }}
            validChars="0-9"
            placeholder=""
            value={verificationCode} // Ensure value is controlled
            onChange={(value) => setVerificationCode(value)}
            classNames={{
              container: "flex gap-2 outline-0 focus:outline-0",
              character: twMerge(
                "rounded-md p-2 text-center text-xl",
                "focus:outline-0",
              ),
              characterSelected: "border-0 outline-high-contrast",
              characterInactive: "border border-low-contrast bg-gp-bg-subtle",
              characterFilled: "border-low-contrast",
            }}
          />
        </div>

        {codeError && (
          <div className="flex w-full items-center gap-2 rounded-lg border-2 border-red-300 bg-red-200 p-2 text-red-900">
            <div className="bg-red-20 relative flex aspect-square h-8 w-8 items-center justify-center rounded-full">
              <WarningCircle size={20} />
            </div>
            <p className="text-left text-sm">
              That code failed verification. Please try again.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <Button className="w-full" onClick={handleVerifyCode} disabled={codeLoading || verificationCode.length !== 6}>
            {codeLoading && <Spinner monochromatic className="w-6 h-6" />}
            {codeLoading ? "Verifying..." : "Verify Code"}
          </Button>
          <Button
            onClick={async () => {
              setError(false);
              await handleSendVerification();
            }}
            disabled={loading}
            className="bg-bg-secondary text-primary border-low-contrast border focus:border-medium-contrast w-full"
          >
            {loading ? "Resending..." : "Resend code"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default PhoneVerification;
