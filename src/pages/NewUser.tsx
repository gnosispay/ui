import { useEffect, useState } from "react";
import { postApiV1AuthSignup, postApiV1AuthSignupOtp } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/otpInput";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle } from "lucide-react";

enum RegisterStep {
  eoaAuthentication = "eoa-authentication",
  Email = "email",
  Otp = "otp",
}

export const NewUserRoute = () => {
  const { isAuthenticated, isAuthenticating } = useAuth();
  const [step, setStep] = useState<RegisterStep>(RegisterStep.eoaAuthentication);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    isAuthenticated && setStep(RegisterStep.Email);
  }, [isAuthenticated]);

  const handleSubmitOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setOtp("");

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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { error, data } = await postApiV1AuthSignup({
        body: { authEmail: email, otp },
      });

      console.log("registered");
      console.log(data);
      if (error) {
        const message = "error" in error ? error.error : "message" in error ? error.message : "unkown";
        setError(`Error while signin up: ${message}`);
        console.error(error);
      }
    } catch (err) {
      setError("Error while signing up");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("step", step);
  console.log("isAuthenticated", isAuthenticated);
  console.log("isAuthenticating", isAuthenticating);
  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
        {step === RegisterStep.eoaAuthentication && !isAuthenticated && !isAuthenticating && (
          <div className="col-span-6 lg:col-start-2 lg:col-span-4">
            <h2 className="text-xl">Welcome to Gnosis Pay</h2>
            <p className="text-muted-foreground">Connect your wallet to get started.</p>
          </div>
        )}
        {step === RegisterStep.eoaAuthentication && isAuthenticating && (
          <div className="col-span-6 lg:col-start-2 lg:col-span-4">
            <h2 className="flex items-center text-xl">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
            </h2>
            <p>Please sign the message request.</p>
          </div>
        )}
        {step === RegisterStep.Email && (
          <form className="space-y-4 mt-8" onSubmit={handleSubmitOtpRequest}>
            <Label htmlFor="register-email">Type your email to receive a 1 time code.</Label>
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
              Get code
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        )}
        {step === RegisterStep.Otp && (
          <form className="space-y-4 mt-8" onSubmit={handleOtpSubmit}>
            <Label htmlFor="otp">Enter the 6-digit code sent to your email</Label>
            <OtpInput value={otp} onChange={setOtp} isLoading={isLoading} disabled={isLoading} />
            {error && (
              <Button variant={"link"} onClick={handleSubmitOtpRequest}>
                Send new code
              </Button>
            )}
            {!error && (
              <Button type="submit" loading={isLoading} disabled={isLoading || otp.length !== 6}>
                Verify and Sign Up
              </Button>
            )}
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
