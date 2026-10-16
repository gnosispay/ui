import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopSupportButtonProps {
  onClick: () => void;
}

export const DesktopSupportButton = ({ onClick }: DesktopSupportButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 hidden size-12 rounded-full shadow-md lg:flex"
      data-testid="desktop-support-button"
      aria-label="Open support"
    >
      <MessageCircle className="size-5" />
    </Button>
  );
};
