import { toast } from "sonner";

interface UseCopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
}

export const useCopyToClipboard = () => {
  const copyToClipboard = async (text: string, options: UseCopyToClipboardOptions = {}) => {
    const { successMessage = "Copied to clipboard", errorMessage = "Failed to copy to clipboard" } = options;

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error(errorMessage);
    }
  };

  return { copyToClipboard };
};
