import { useState } from "react";
import { postApiV1AuthSignupOtp } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

enum RegisterStep {
  Email = "email",
  Otp = "otp",
}

export const NewUserRoute = () => {
  const [step, setStep] = useState<RegisterStep>(RegisterStep.Email);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { error, data } = await postApiV1AuthSignupOtp({
        body: { email },
      });
      if (error) {
        const message = "error" in error ? error.error : "message" in error ? error.message : "unkown";
        setError(`Error while requesting the OTP: ${message}`);
        console.error(error);
      }

      data?.ok && setStep(RegisterStep.Otp);
    } catch (err) {
      setError("Error while requesting the OTP");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
        <h2 className="text-xl">Register</h2>
        <div>Type your email to receive a 1 time code.</div>
        {step === RegisterStep.Email && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="mt-4">
              <Input
                className="lg:w-1/2"
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
