import { getApiV1KycIntegration, type KycStatus } from "@/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useState, useCallback, useEffect } from "react";

export const KycRoute = () => {
  const { isAuthenticated } = useAuth();
  const { isUserSignedUp, user } = useUser();
  const [error, setError] = useState("");
  const [kycUrl, setKycUrl] = useState("");

  useEffect(() => {
    if (isAuthenticated && isUserSignedUp) {
      getApiV1KycIntegration()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching KYC integration:", error);
            const errorMessage = "error" in error ? error.error : error.message;
            setError(`Error fetching KYC integration: ${errorMessage || "Unknown error"}`);
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
    const notStartedOrRequested: KycStatus[] = ["notStarted", "documentsRequested"];
    if (isUserSignedUp && user?.kycStatus && notStartedOrRequested.includes(user.kycStatus)) {
      console.log("lets go");
    }
  }, [isUserSignedUp, user?.kycStatus]);

  // todo make this better
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
