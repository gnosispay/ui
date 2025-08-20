import { useUser } from "@/context/UserContext";
import { useUserFullName } from "@/hooks/useUserFullName";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import PhoneVerificationStep from "@/components/safe-deployment/PhoneVerificationStep";
import EmailVerificationStep from "@/components/safe-deployment/EmailVerificationStep";
import { StandardAlert } from "../ui/standard-alert";

interface PersonalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonalDetailsModal: React.FC<PersonalDetailsModalProps> = ({ open, onOpenChange }) => {
  const { user, refreshUser } = useUser();
  const fullName = useUserFullName();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [error, setError] = useState("");

  const formattedAddress = useMemo(() => {
    if (!user) return "";
    const parts = [user.address1, user.address2, user.city, user.postalCode, user.country].filter(Boolean);
    return parts.join("\n");
  }, [user]);

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      setIsEditingPhone(false);
      setIsEditingEmail(false);
      refreshUser();
      onOpenChange(open);
    },
    [onOpenChange, refreshUser],
  );

  const handleEditPhoneClick = useCallback(() => {
    setIsEditingPhone(true);
    setError("");
  }, []);

  const handleEditEmailClick = useCallback(() => {
    setIsEditingEmail(true);
    setError("");
  }, []);

  const handlePhoneVerificationComplete = useCallback(() => {
    setIsEditingPhone(false);
    setError("");
    refreshUser();
  }, [refreshUser]);

  const handleEmailVerificationComplete = useCallback(() => {
    setIsEditingEmail(false);
    setError("");
    refreshUser();
  }, [refreshUser]);

  const handleSetError = useCallback((err: string) => {
    setError(err);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditingEmail ? "Change email address" : isEditingPhone ? "Change phone number" : "Personal details"}
          </DialogTitle>
        </DialogHeader>

        {isEditingPhone ? (
          <div className="space-y-4">
            {error && <StandardAlert description={error} variant="destructive" />}
            <PhoneVerificationStep
              onComplete={handlePhoneVerificationComplete}
              setError={handleSetError}
              onCancel={() => setIsEditingPhone(false)}
              title=""
            />
          </div>
        ) : isEditingEmail ? (
          <div className="space-y-4">
            {error && <StandardAlert description={error} variant="destructive" />}
            <EmailVerificationStep
              onComplete={handleEmailVerificationComplete}
              setError={handleSetError}
              onCancel={() => setIsEditingEmail(false)}
              submitButtonText="Verify new email"
              title=""
              description="Enter your new email address. A verification code will be sent to verify the change."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <div>{fullName || "Not provided"}</div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <div className="space-y-2">
                <div>{user?.email || "Not provided"}</div>
                <Button variant="outline" size="sm" onClick={handleEditEmailClick} className="w-fit">
                  Edit email address
                </Button>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {user?.phone || "Not provided"}
                  {user?.phone &&
                    (user?.isPhoneValidated ? (
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-muted-foreground">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Not verified</span>
                      </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleEditPhoneClick} className="w-fit">
                  Edit phone number
                </Button>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Address</span>
              <div className="whitespace-pre-line">{formattedAddress || "Not provided"}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
