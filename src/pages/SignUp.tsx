import { useEffect, useState, useCallback } from "react";
import { getApiV1UserTerms, postApiV1UserTerms } from "@/client";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "@/utils/errorHelpers";
import EmailVerificationStep from "@/components/safe-deployment/EmailVerificationStep";

export const SignUpRoute = () => {
  const { updateJwt, updateClient } = useAuth();
  const { isUserSignedUp } = useUser();
  const [error, setError] = useState("");
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

  const handleEmailVerificationComplete = useCallback(
    async (token?: string) => {
      if (!token) return;

      try {
        // unless we update the client with the new JWT, it will not be used for subsequent requests
        // and we will not be able to accept user terms
        updateJwt(token);
        updateClient(token);

        await acceptAllUserTerms();
        navigate("/kyc");
      } catch (err) {
        const message = extractErrorMessage(err, "unknown");
        setError(`Error while completing signup: ${message}`);
        console.error("Error while completing signup", err);
      }
    },
    [updateJwt, updateClient, acceptAllUserTerms, navigate],
  );

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      {error && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <StandardAlert variant="destructive" title="Error" description={error} />
        </div>
      )}
      <EmailVerificationStep
        onComplete={handleEmailVerificationComplete}
        setError={setError}
        requireToS={true}
        submitButtonText="Get code"
        title="Sign up to Gnosis Pay"
        description="Type your email to receive a one time code."
      />
    </div>
  );
};
