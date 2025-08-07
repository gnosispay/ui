import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SignInWalletsSuccessDeletionProps {
  onBack: () => void;
}

export const SignInWalletsSuccessDeletion = ({ onBack }: SignInWalletsSuccessDeletionProps) => {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-success" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Wallet deleted</h3>
        <p className="text-sm text-muted-foreground">
          The wallet address has been successfully removed from your account.
        </p>
      </div>

      <Button className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium" onClick={onBack}>
        Back to account
      </Button>
    </div>
  );
};
