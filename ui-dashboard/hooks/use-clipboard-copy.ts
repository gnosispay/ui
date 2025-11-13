import { useState } from "react";
import toast from "react-hot-toast";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>; // Return success

interface UseClipboardCopyParams {
  showToast?: boolean;
}
export function useClipboardCopy({
  showToast = false,
}: UseClipboardCopyParams = {}): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      showToast && toast.success("Copied to clipboard");
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
}
