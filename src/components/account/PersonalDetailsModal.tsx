import { useUser } from "@/context/UserContext";
import { useUserFullName } from "@/hooks/useUserFullName";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { useMemo } from "react";

interface PersonalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonalDetailsModal: React.FC<PersonalDetailsModalProps> = ({ open, onOpenChange }) => {
  const { user } = useUser();
  const fullName = useUserFullName();

  const formattedAddress = useMemo(() => {
    if (!user) return "";
    const parts = [user.address1, user.address2, user.city, user.postalCode, user.country].filter(Boolean);
    return parts.join("\n");
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personal details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <span className="text-sm text-muted-foreground">Name</span>
            <div>{fullName || "Not provided"}</div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <div>{user?.email || "Not provided"}</div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Phone</span>
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
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Address</span>
            <div className="whitespace-pre-line">{formattedAddress || "Not provided"}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
