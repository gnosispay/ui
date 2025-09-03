import { useIntercom } from "react-use-intercom";

interface SafeIntercom {
  show: () => void;
  hide: () => void;
  shutdown: () => void;
  update: (options?: any) => void;
}

export const useSafeIntercom = (): SafeIntercom => {
  try {
    return useIntercom();
  } catch (error) {
    const handleError = () => console.error("Intercom not available:", error);
    return {
      show: handleError,
      hide: handleError,
      shutdown: handleError,
      update: handleError,
    };
  }
};
