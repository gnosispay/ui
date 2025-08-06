import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { MousePointer2 } from "lucide-react";

interface AddressInputProps {
  toAddress: string;
  onChange: (value: string) => void;
  error?: string;
  connectedAddress?: string;
}

export const AddressInput = ({ toAddress, onChange, error, connectedAddress }: AddressInputProps) => {
  const handleMeClick = () => {
    if (connectedAddress) {
      onChange(connectedAddress);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          className="pl-12"
          value={toAddress}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x..."
          spellCheck={false}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">gno:</span>
      </div>

      {connectedAddress && (
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

      {error && <StandardAlert variant="warning" description={error} />}
    </div>
  );
};
