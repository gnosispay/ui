import { useState } from "react";
import { postApiV1AuthSignupOtp } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CollapsedError } from "@/components/collapsedError";

// Registration steps (expandable for future steps)
enum RegisterStep {
  Email = "email",
  // Otp = "otp", // for future steps
}

export const NewUserRoute = () => {
  const [step, setStep] = useState<RegisterStep>(RegisterStep.Email);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSentSuccessfully, setOtpSentSuccessfully] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setOtpSentSuccessfully(false);
    try {
      const { error, data } = await postApiV1AuthSignupOtp({
        body: { email },
      });
      if (error) {
        setError("Error while requesting the OTP");
        console.error(error)
      } else {
        setOtpSentSuccessfully(true);
        // setStep(RegisterStep.Otp); // for future steps
      }
    } catch (err) {
      setError("Error while requesting the OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-4 col-start-2">
        <h2 className="text-xl">Register</h2>
        <p className="text-muted-foreground">Register by typing in your email</p>
      </div>
      <div className="col-span-4 col-start-2">
        {step === RegisterStep.Email && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" loading={isLoading} disabled={isLoading || !email}>
              Send verification code
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {otpSentSuccessfully && (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Verification code sent to your email.
                </AlertDescription>
              </Alert>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
