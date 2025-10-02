import { useEffect, useState, useCallback, Fragment } from "react";
import { postApiV1AuthSignup, getApiV1UserTerms, postApiV1UserTerms } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { userTerms, type UserTermsTypeFromApi } from "@/constants";
import { PARTNER_ID } from "@/constants";

export const SignUpRoute = () => {
  const { updateJwt, updateClient } = useAuth();
  const { isUserSignedUp } = useUser();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAcceptedTos, setIsAcceptedTos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // if the user is authenticated and signed up, we should go to kyc
    if (isUserSignedUp) {
      navigate("/kyc");
    }
  }, [isUserSignedUp, navigate]);

  const acceptAllUserTerms = useCallback(async () => {
    try {
      // verify what terms the user has accepted
      // we can't do this before since the user is not authenticated yet
      // and this endpoint requires authentication
      const { data, error: termsError } = await getApiV1UserTerms();

      if (termsError) {
        const message = extractErrorMessage(termsError, "unknown");
        setError(`Error getting terms: ${message}`);
        console.error("Error getting terms", termsError);
        return;
      }

      const termsList = data?.terms || [];
      const tosToBeAccepted = termsList.filter(
        (term) => !term.accepted || term.currentVersion !== term.acceptedVersion,
      );

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
          console.error("Error accepting terms", error);
        }
      }
    } catch (termsErr) {
      const message = extractErrorMessage(termsErr, "unknown");
      setError(`Error while accepting user terms: ${message}`);
      console.error("Error accepting user terms", termsErr);
    }
  }, []);

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        const { error, data } = await postApiV1AuthSignup({
          body: { authEmail: email, partnerId: PARTNER_ID },
        });

        if (error || !data) {
          const message = extractErrorMessage(error, "unknown");
          if (message.includes("already registered")) {
            setError(
              `This email is already associated with a Gnosis Pay account, make sure you are using the correct wallet account to connect.`,
            );
          } else {
            setError(`Error returned while signing up: ${message}`);
            console.error("Error returned while signing up", error);
          }
          return;
        }

        // unless we update the client with the new JWT, it will not be used for subsequent requests
        // and we will not be able to accept user terms
        updateJwt(data.token);
        updateClient(data.token);

        await acceptAllUserTerms();
        navigate("/kyc");
      } catch (err) {
        const message = extractErrorMessage(err, "unknown");
        setError(`Error while signing up: ${message}`);
        console.error("Error while signing up", err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, updateJwt, acceptAllUserTerms, updateClient, navigate],
  );

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
        <form className="space-y-4 mt-8" onSubmit={handleSignup}>
          <Label htmlFor="register-email">Type your email</Label>
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
          <div className="flex items-start gap-2 mt-2">
            <input
              id="accept-tos"
              type="checkbox"
              checked={isAcceptedTos}
              onChange={(e) => setIsAcceptedTos(e.target.checked)}
              disabled={isLoading}
              required
              className="mt-0.5"
            />
            <label htmlFor="accept-tos" className="text-sm leading-normal">
              I have read and agree to the{" "}
              {Object.entries(userTerms).map(([type, { url }], idx, arr) => (
                <Fragment key={type}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                    {userTerms[type as UserTermsTypeFromApi].title}
                  </a>
                  {idx < arr.length - 1 ? ", " : ""}
                </Fragment>
              ))}
            </label>
          </div>

          <Button type="submit" loading={isLoading} disabled={isLoading || !email || !isAcceptedTos}>
            Next
          </Button>
          {error && <StandardAlert variant="destructive" title="Error" description={error} />}
        </form>
      </div>
    </div>
  );
};
