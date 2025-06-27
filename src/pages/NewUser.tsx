import { useEffect, useState, useCallback } from "react";
import { postApiV1AuthSignup, postApiV1AuthSignupOtp, getApiV1UserTerms, postApiV1UserTerms } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/otpInput";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle } from "lucide-react";
import { userTerms } from "@/constants";

enum RegisterStep {
  eoaAuthentication = "eoa-authentication",
  EmailAndTos = "email-and-tos",
  Otp = "otp",
}

export const NewUserRoute = () => {
  const { isAuthenticated, isAuthenticating, updateJwt, updateClient } = useAuth();
  const [step, setStep] = useState<RegisterStep>(RegisterStep.eoaAuthentication);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [acceptedTos, setAcceptedTos] = useState(false);

  useEffect(() => {
    isAuthenticated && setStep(RegisterStep.EmailAndTos);
  }, [isAuthenticated]);

  const acceptAllUserTerms = useCallback(async () => {
    try {
      // verify what terms the user has accepted
      const termsRes = await getApiV1UserTerms();
      const termsList = termsRes?.data?.terms || [];

      // accept all terms that are not already accepted
      // and that we display in the UI with their respective link
      for (const term of termsList) {
        const termAccepted = !!term.type && userTerms[term.type];
        if (
          termAccepted &&
          term.type &&
          term.currentVersion &&
          termAccepted.version === term.currentVersion &&
          !term.accepted
        ) {
          const { error: termsError } = await postApiV1UserTerms({
            body: {
              terms: term.type,
              version: term.currentVersion,
            },
          });
          if (termsError) {
            const message =
              "error" in termsError ? termsError.error : "message" in termsError ? termsError.message : "unkown";
            setError(`Error accepting terms (${term.type}): ${message}`);
            console.error(termsError);
            return false;
          }
        }
      }
      return true;
    } catch (termsErr) {
      setError("Error while accepting user terms");
      console.error(termsErr);
      return false;
    }
  }, []);

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
          const message = "error" in error ? error.error : "message" in error ? error.message : "unkown";
          setError(`Error while requesting the OTP: ${message}`);
          console.error(error);
        }

        data?.ok && setStep(RegisterStep.Otp);
      } catch (err) {
        setError("Error while requesting the OTP");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [email],
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
          const message = "error" in error ? error.error : "message" in error ? error.message : "unkown";
          setError(`Error while signin up: ${message}`);
          console.error(error);
          return;
        }

        // unless we update the client with the new JWT, it will not be used for subsequent requests
        // and we will not be able to accept user terms
        updateJwt(data.token);
        updateClient(data.token);

        // Accept user terms after updating client with new JWT
        const accepted = await acceptAllUserTerms();
      } catch (err) {
        setError("Error while signing up");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, otp, updateJwt, acceptAllUserTerms, updateClient],
  );

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
        {step === RegisterStep.eoaAuthentication && !isAuthenticated && !isAuthenticating && (
          <>
            <h2 className="text-xl">Welcome to Gnosis Pay</h2>
            <p className="text-muted-foreground">Connect your wallet to get started.</p>
          </>
        )}
        {step === RegisterStep.eoaAuthentication && isAuthenticating && (
          <>
            <h2 className="flex items-center text-xl">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
            </h2>
            <p>Please sign the message request.</p>
          </>
        )}
        {step === RegisterStep.EmailAndTos && (
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
            <div className="flex items-center space-x-2 mt-2">
              <input
                id="accept-tos"
                type="checkbox"
                checked={acceptedTos}
                onChange={(e) => setAcceptedTos(e.target.checked)}
                disabled={isLoading}
                required
              />
              <Label htmlFor="accept-tos" className="text-sm">
                I have read and agree to the{" "}
                {Object.entries(userTerms).map(([type, term], idx, arr) => (
                  <span key={type}>
                    <a href={term.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {term.title}
                    </a>
                    {idx < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Label>
            </div>
            <Button type="submit" loading={isLoading} disabled={isLoading || !email || !acceptedTos}>
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
