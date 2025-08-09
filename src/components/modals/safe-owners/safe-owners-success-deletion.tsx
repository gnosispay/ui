import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SafeOwnersSuccessDeletionProps {
  onBack: () => void;
}

export const SafeOwnersSuccessDeletion = ({ onBack }: SafeOwnersSuccessDeletionProps) => {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-success" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Owner removed</h3>
        <p className="text-sm text-muted-foreground">
          The transaction has been queued successfully. The owner will be removed in 3 minutes.
        </p>
      </div>

      <Button className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium" onClick={onBack}>
        Back to owners
      </Button>
    </div>
  );
};
