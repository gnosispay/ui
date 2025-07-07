import { getApiV1KycIntegration, type KycStatus } from "@/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "@/utils/errorHelpers";

export const KycRoute = () => {
  const { user, refreshUser, isUserSignedUp } = useUser();
  const [error, setError] = useState("");
  const [kycUrl, setKycUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.kycStatus) return;

    // an issue happened during the KYC process, sumsub rejected the application
    // or an action is required, they need to contact your support
    const kycStatusesRequiringContact: KycStatus[] = ["rejected", "requiresAction"];
    if (kycStatusesRequiringContact.includes(user.kycStatus)) {
      setError("Your KYC application has encountered an issue. Please contact support at help@gnosispay.com");
      return;
    }

    // the user is not signed up, they need to sign up first
    if (!isUserSignedUp) {
      navigate("/register");
    }

    // the user is all set up, they can go to the safe deployment page
    if (user.kycStatus === "approved") {
      navigate("/safe-deployment");
    }
  }, [navigate, user, isUserSignedUp]);

  useEffect(() => {
    if (!user?.kycStatus) return;

    // regularly check the kyc status as sumsub has hooks integration
    // with gnosispay api
    const refreshStatuses: KycStatus[] = ["documentsRequested", "pending", "processing"];
    if (refreshStatuses.includes(user.kycStatus)) {
      const timeout = setTimeout(() => {
        refreshUser();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [refreshUser, user]);

  useEffect(() => {
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
  }, []);

  // users will see the sumsub iframe in case their kyc status
  // is one of the following:
  // - notStarted
  // - documentsRequested
  // - pending
  // - processing
  // - resubmissionRequested
  // - requiresAction

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
