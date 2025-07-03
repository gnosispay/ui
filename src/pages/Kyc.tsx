import { getApiV1KycIntegration } from "@/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { extractErrorMessage } from "@/utils/errorHelpers";

export const KycRoute = () => {
  const { isAuthenticated } = useAuth();
  const { isUserSignedUp, user, refreshUser: refetchUser } = useUser();
  const [error, setError] = useState("");
  const [kycUrl, setKycUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.kycStatus) return;

    // regularly check the kyc status as sumsub has hooks integration
    // with gnosispay api
    if (["documentsRequested", "pending", "processing"].includes(user.kycStatus)) {
      const timeout = setTimeout(() => {
        refetchUser();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [refetchUser, user]);

  useEffect(() => {
    if (isAuthenticated && isUserSignedUp) {
      getApiV1KycIntegration()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching KYC integration:", error);
            const errorMessage = extractErrorMessage(error, "Unknown error");
            setError(`Error fetching KYC integration: ${errorMessage}`);
            return;
          }

          setKycUrl(data.url);
        })
        .catch((err) => {
          console.error("Error fetching KYC integration url:", err);
          setError("Error fetching KYC integration url");
        });
    }
  }, [isAuthenticated, isUserSignedUp]);

  useEffect(() => {
    if (!user || !user.safeWallets) return;

    // an issue happened during the KYC process, sumsub rejected the application
    // they need to contact your support
    if (user.kycStatus === "rejected") {
      setError("Your KYC application was rejected. Please contact support at help@gnosispay.com");
      return;
    }

    // the user has nothing to do here any more, they're all set up
    if (user.kycStatus === "approved") {
      navigate("/safe-deployment");
    }
  }, [navigate, user]);

  // users will see the sumsub iframe in case their kyc status
  // is one of the following:
  // - notStarted
  // - documentsRequested
  // - pending
  // - processing
  // - resubmissionRequested
  // - requiresAction

  if (!isAuthenticated || !isUserSignedUp) {
    return <div>Error, not authenticated...</div>;
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-full">
      {error && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="col-span-6">
        {kycUrl && <iframe src={kycUrl} className="w-full h-[calc(100vh-73px)]" title="KYC Integration" />}
      </div>
    </div>
  );
};
