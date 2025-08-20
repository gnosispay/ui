import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/otpInput";
import { postApiV1AuthSignupOtp, postApiV1AuthSignup } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { userTerms, type UserTermsTypeFromApi } from "@/constants";

export type EmailVerificationStepProps = {
  onComplete: (token?: string) => void;
  setError: (err: string) => void;
  onCancel?: () => void;
  requireToS?: boolean;
  submitButtonText?: string;
  title?: string;
  description?: string;
};

enum EmailStep {
  TypeEmail = "type-email",
  OtpVerification = "otp-verification",
}

const EmailVerificationStep = ({
  onComplete,
  setError,
  onCancel,
  requireToS = false,
  submitButtonText = "Get code",
  title = "Email verification",
  description = "A one time code will be sent to your email. Please enter your email address to continue.",
}: EmailVerificationStepProps) => {
  const [step, setStep] = useState<EmailStep>(EmailStep.TypeEmail);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptedTos, setIsAcceptedTos] = useState(false);

  const handleSubmitOtpRequest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setOtp("");

      try {
        const { error, data } = await postApiV1AuthSignupOtp({
          body: { email },
        });
        if (error) {
          const message = extractErrorMessage(error, "unknown");
          setError(`Error returned while requesting the OTP: ${message}`);
          console.error("Error returned while requesting the OTP", error);
        }

        data?.ok && setStep(EmailStep.OtpVerification);
      } catch (err) {
        const message = extractErrorMessage(err, "unknown");
        setError(`Error while requesting the OTP: ${message}`);
        console.error("Error requesting OTP", err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, setError],
  );

  const handleOtpSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        const { error, data } = await postApiV1AuthSignup({
          body: { authEmail: email, otp },
        });

        if (error || !data) {
          const message = extractErrorMessage(error, "unknown");
          setError(`Error returned while verifying: ${message}`);
          console.error("Error returned while verifying", error);
          return;
        }

        onComplete(data.token);
      } catch (err) {
        const message = extractErrorMessage(err, "unknown");
        setError(`Error while verifying: ${message}`);
        console.error("Error while verifying", err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, otp, setError, onComplete],
  );

  const canSubmitEmail = email && (!requireToS || isAcceptedTos);

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
      {step === EmailStep.TypeEmail && (
        <>
          <h2 className="text-lg font-semibold mb-4 mt-4">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          <form className="space-y-4 mt-4" onSubmit={handleSubmitOtpRequest}>
            <Label htmlFor="email">Email address</Label>
            <Input
              className="lg:w-1/2"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />

            {requireToS && (
              <div className="flex items-center space-x-2 mt-2">
                <input
                  id="accept-tos"
                  type="checkbox"
                  checked={isAcceptedTos}
                  onChange={(e) => setIsAcceptedTos(e.target.checked)}
                  disabled={isLoading}
                  required
                />
                <Label htmlFor="accept-tos" className="text-sm">
                  I have read and agree to the{" "}
                  {Object.entries(userTerms).map(([type, { url }], idx, arr) => (
                    <span key={type}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                        {userTerms[type as UserTermsTypeFromApi].title}
                      </a>
                      {idx < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </Label>
              </div>
            )}

            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={isLoading} disabled={isLoading || !canSubmitEmail}>
                {submitButtonText}
              </Button>
            </div>
          </form>
        </>
      )}

      {step === EmailStep.OtpVerification && (
        <form className="space-y-4 mt-4" onSubmit={handleOtpSubmit}>
          <Label htmlFor="otp">Enter the 6-digit code sent to your email</Label>
          <OtpInput value={otp} onChange={setOtp} isLoading={isLoading} disabled={isLoading} />
          <Button className="mr-4" variant="outline" onClick={() => setStep(EmailStep.TypeEmail)} disabled={isLoading}>
            Edit email address
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading || otp.length !== 6}>
            Verify
          </Button>
        </form>
      )}
    </div>
  );
};

export default EmailVerificationStep;
