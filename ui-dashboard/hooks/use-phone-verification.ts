import { useCallback, useEffect, useState } from "react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { usePostHog } from "posthog-js/react";
import { fetchApi } from "@/lib/api";

export const usePhoneVerification = (
  initialPhoneNumber?: string,
  onSuccessCallback?: (phoneNumber: string) => void,
) => {
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? "");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState(false);
  const [validPhoneNumberEntered, setValidPhoneNumberEntered] = useState(
    !!initialPhoneNumber || false,
  );
  const [codeError, setCodeError] = useState(false);
  const posthog = usePostHog();

  const handleSendVerification = async () => {
    setLoading(true);
    setCodeError(false);
    const isPossibleNumber = isPossiblePhoneNumber(phoneNumber);

    if (!isPossibleNumber) {
      setError(true);
      setLoading(false);
      return;
    }

    posthog?.capture("verify_phone:send_verification_start");
    try {
      const { response } = await fetchApi("/verification", {
        method: "POST",
        body: { phoneNumber },
      });

      if (response.status === 200) {
        posthog?.capture("verify_phone:send_verification_success");
        setLoading(false);
        setVerificationSent(true);
      } else {
        // It might be good to handle other statuses here or throw a more specific error
        throw new Error("Failed to send verification");
      }
    } catch (err) {
      setLoading(false);
      setError(true); // Assuming a general error state for sending issues
      console.error(err);
      posthog?.capture("verify_phone:send_verification_error", { error: err });
    }
  };

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) return; // Or handle this more explicitly

    posthog?.capture("verify_phone:verify_code_start");
    setCodeError(false);
    setCodeLoading(true);
    try {
      const { response } = await fetchApi("/verification/check", {
        method: "POST",
        body: { code: verificationCode, phoneNumber }, // Added phoneNumber for backend validation
      });

      if (response.status === 200) {
        posthog?.capture("verify_phone:verify_code_success");
        setCodeLoading(false);
        if (onSuccessCallback) {
          onSuccessCallback(phoneNumber);
        }
      } else {
        throw new Error("Failed to verify code");
      }
    } catch (err) {
      setCodeError(true);
      setCodeLoading(false);
      console.error(err);
      posthog?.capture("verify_phone:verify_code_error", { error: err });
    }
  }, [verificationCode, onSuccessCallback, posthog, phoneNumber]);

  useEffect(() => {
    if (verificationCode.length === 6) {
      handleVerifyCode();
    }
  }, [handleVerifyCode, verificationCode]);

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (!value || !isPossiblePhoneNumber(value)) {
      setValidPhoneNumberEntered(false);
    } else {
      setValidPhoneNumberEntered(true);
      setError(false);
    }
  };

  const validatePhoneNumber = () => {
    if (!phoneNumber || !isPossiblePhoneNumber(phoneNumber)) {
      setError(true);
      return false;
    }
    setError(false);
    return true;
  };

  return {
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
    setPhoneNumber: handlePhoneNumberChange,
    setVerificationSent,
    validatePhoneNumber,
    setError,
  };
};
