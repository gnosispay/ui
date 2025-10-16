import { useCallback } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebugInfo, formatDebugInfo } from "@/utils/debugInfo";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/utils/cn";

interface DebugButtonProps {
  className?: string;
}

export const DebugButton = ({ className }: DebugButtonProps) => {
  const debugInfo = useDebugInfo();
  const { copyToClipboard } = useCopyToClipboard();

  const handleDebugCopy = useCallback(() => {
    const formattedInfo = formatDebugInfo(debugInfo);
    copyToClipboard(formattedInfo, {
      successMessage: "Debug information copied",
      errorMessage: "Failed to copy debug information",
    });
  }, [debugInfo, copyToClipboard]);

  return (
    <Button
      onClick={handleDebugCopy}
      variant="ghost"
      size="icon"
      className={cn(
        "fixed bottom-4 left-4 z-50 size-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground backdrop-blur-sm border border-border/50 shadow-sm",
        className
      )}
      title="Copy debug information"
    >
      <Wrench className="size-4" />
    </Button>
  );
};
