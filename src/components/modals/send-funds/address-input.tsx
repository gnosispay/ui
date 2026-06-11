import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { MousePointer2, ArrowRight } from "lucide-react";
import { useCallback } from "react";

interface AddressInputProps {
  toAddress: string;
  onChange: (value: string) => void;
  error?: string;
  connectedAddress?: string;
  newSafeAddress?: string;
}

export const AddressInput = ({ toAddress, onChange, error, connectedAddress, newSafeAddress }: AddressInputProps) => {
  const handleMeClick = useCallback(() => {
    if (connectedAddress) {
      onChange(connectedAddress);
    }
  }, [connectedAddress, onChange]);

  const handleNewSafeClick = useCallback(() => {
    if (newSafeAddress) {
      onChange(newSafeAddress);
    }
  }, [newSafeAddress, onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          className="pl-12"
          value={toAddress}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x..."
          spellCheck={false}
          data-testid="send-funds-address-input"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">gno:</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {!newSafeAddress && connectedAddress && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent"
            onClick={handleMeClick}
          >
            Use connected address
            <MousePointer2 className="ml-1 h-3 w-3" />
          </Button>
        )}

        {newSafeAddress && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent"
            onClick={handleNewSafeClick}
            data-testid="send-to-new-safe-button"
          >
            Send to my new Safe
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {error && <StandardAlert variant="warning" description={error} />}
    </div>
  );
};
