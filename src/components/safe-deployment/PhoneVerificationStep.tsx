import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { OtpInput } from "@/components/otpInput";
import { postApiV1Verification, postApiV1VerificationCheck } from "@/client";
import { useTimer } from "@/hooks/useTimer";
import { extractErrorMessage } from "@/utils/errorHelpers";

export type PhoneVerificationStepProps = {
  onComplete: () => void;
  setError: (err: string) => void;
  onCancel?: () => void;
};

enum PhoneStep {
  TypePhone = "type-phone",
  VerifyPhoneNumber = "verify-phone-number",
  OtpVerification = "otp-verification",
}

const PhoneVerificationStep = ({ onComplete, setError, onCancel }: PhoneVerificationStepProps) => {
  const [step, setStep] = useState<PhoneStep>(PhoneStep.TypePhone);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const { timer: resendTimer, start: startResendTimer } = useTimer(60);

  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(PhoneStep.VerifyPhoneNumber);
  };

  const sendCode = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const { error, data } = await postApiV1Verification({ body: { phoneNumber: phone } });
      if (error || !data?.ok) {
        const message = extractErrorMessage(error, "Unknown error");
        setError(`Error sending code: ${message}`);
        return false;
      }
      setStep(PhoneStep.OtpVerification);
      startResendTimer();
      return true;
    } catch (err) {
      setError("Error sending code");
      console.error(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsOtpLoading(true);
    try {
      const { error, data } = await postApiV1VerificationCheck({ body: { code: otp } });
      if (error || !data?.ok) {
        const message = extractErrorMessage(error, "Unknown error");
        setError(`Error verifying code: ${message}`);
        return;
      }
      onComplete();
    } catch (_err) {
      setError("Error verifying code");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (resendTimer > 0) return;
    await sendCode();
    startResendTimer();
  };

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
      {step === PhoneStep.TypePhone && (
        <>
          <h2 className="text-lg font-semibold mb-4 mt-4">Mobile phone verification</h2>
          <p className="text-muted-foreground mb-4">
            A one time code will be sent to your phone. Please enter your phone number to continue.
          </p>
          <form className="space-y-4 mt-4 w-xs" onSubmit={handlePhoneContinue}>
            <PhoneInput value={phone} onChange={setPhone} disabled={isSubmitting} />
            {onCancel && (
              <Button className="mr-4" type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!phone || isSubmitting}>
              Continue
            </Button>
          </form>
        </>
      )}
      {step === PhoneStep.VerifyPhoneNumber && (
        <form className="space-y-4 mt-4" onSubmit={handlePhoneSubmit}>
          <h2 className="text-lg font-semibold mb-4 mt-4">This number will be used to send you a one time code:</h2>
          <div className="mb-4 font-mono text-lg">{phone}</div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(PhoneStep.TypePhone)}
              disabled={isSubmitting}
            >
              Edit
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Send code
            </Button>
          </div>
        </form>
      )}
      {step === PhoneStep.OtpVerification && (
        <form className="space-y-4 mt-4" onSubmit={handleOtpSubmit}>
          <label htmlFor="otp" className="block mb-4 font-medium mt-4">
            Enter the 6-digit code sent to your phone
          </label>
          <OtpInput value={otp} onChange={setOtp} isLoading={isOtpLoading} disabled={isOtpLoading} />
          <Button type="submit" loading={isOtpLoading} disabled={isOtpLoading || otp.length !== 6}>
            Verify
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={handleResendCode}
            disabled={isSubmitting || isOtpLoading || resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Resend code"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PhoneVerificationStep;
