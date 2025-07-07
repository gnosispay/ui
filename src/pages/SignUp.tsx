import { useEffect, useState, useCallback, useMemo } from "react";
import {
  postApiV1AuthSignup,
  postApiV1AuthSignupOtp,
  getApiV1UserTerms,
  postApiV1UserTerms,
  type GetApiV1UserTermsResponse,
} from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/otpInput";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { userTermsTitle, type UserTermsTypeFromApi } from "@/constants";

enum ScreenStep {
  EmailAndTos = "email-and-tos",
  OtpVerification = "otp-verification",
}

export const SignUpRoute = () => {
  const { updateJwt, updateClient } = useAuth();
  const { isUserSignedUp } = useUser();
  const [step, setStep] = useState<ScreenStep>(ScreenStep.EmailAndTos);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [isAcceptedTos, setIsAcceptedTos] = useState(false);
  const navigate = useNavigate();
  // list of terms that the user has not accepted or that have a different version than the current one
  const [tosToBeAccepted, setTosToBeAccepted] = useState<GetApiV1UserTermsResponse["terms"]>([]);
  const atLeastOneToSMustBeAccepted = useMemo(() => tosToBeAccepted && tosToBeAccepted.length > 0, [tosToBeAccepted]);

  useEffect(() => {
    // if the user is authenticated and signed up, we should go to kyc
    if (isUserSignedUp) {
      navigate("/kyc");
    }
  }, [isUserSignedUp, navigate]);

  useEffect(() => {
    if (step !== ScreenStep.EmailAndTos) return;

    getApiV1UserTerms()
      .then(({ data, error }) => {
        const termsList = data?.terms || [];

        setTosToBeAccepted(termsList.filter((term) => !term.accepted || term.currentVersion !== term.acceptedVersion));

        if (error) {
          const message = extractErrorMessage(error, "unknown");
          setError(`Error getting terms: ${message}`);
          console.error(error);
        }
      })
      .catch((err) => {
        setError("Error while getting user terms");
        console.error(err);
      });
  }, [step]);

  const acceptAllUserTerms = useCallback(async () => {
    try {
      if (!tosToBeAccepted) return;

      // accept all terms that are not already accepted
      // since we displayed all of them in the UI with their respective link
      for (const term of tosToBeAccepted) {
        if (!term.type || !term.currentVersion) continue;

        const { error } = await postApiV1UserTerms({
          body: {
            terms: term.type,
            version: term.currentVersion,
          },
        });
        if (error) {
          const message = extractErrorMessage(error, "unknown");
          setError(`Error accepting terms (${term.type}): ${message}`);
          console.error(error);
        }
      }
    } catch (termsErr) {
      setError("Error while accepting user terms");
      console.error(termsErr);
    }
  }, [tosToBeAccepted]);

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
          setError(`Error while requesting the OTP: ${message}`);
          console.error(error);
        }

        data?.ok && setStep(ScreenStep.OtpVerification);
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
          const message = extractErrorMessage(error, "unknown");
          setError(`Error while signin up: ${message}`);
          console.error(error);
          return;
        }

        // unless we update the client with the new JWT, it will not be used for subsequent requests
        // and we will not be able to accept user terms
        updateJwt(data.token);
        updateClient(data.token);

        await acceptAllUserTerms();
        navigate("/kyc");
      } catch (err) {
        setError("Error while signing up");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, otp, updateJwt, acceptAllUserTerms, updateClient, navigate],
  );

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
        {step === ScreenStep.EmailAndTos && (
          <form className="space-y-4 mt-8" onSubmit={handleSubmitOtpRequest}>
            <Label htmlFor="register-email">Type your email to receive a one time code.</Label>
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
            {atLeastOneToSMustBeAccepted && (
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
                  {(tosToBeAccepted || []).map(({ type, url }, idx, arr) => (
                    <span key={type}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                        {userTermsTitle[type as UserTermsTypeFromApi]}
                      </a>
                      {idx < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </Label>
              </div>
            )}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || !email || (!isAcceptedTos && atLeastOneToSMustBeAccepted)}
            >
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
        {step === ScreenStep.OtpVerification && (
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
