import { useTheme } from "@/context/ThemeContext";
import { useMemo } from "react";
import darkOwl from "@/assets/Gnosis-owl-white.svg";
import lightOwl from "@/assets/Gnosis-owl-black.svg";

export const AppLoader = () => {
  const { effectiveTheme } = useTheme();

  const logoSrc = useMemo(() => (effectiveTheme === "dark" ? darkOwl : lightOwl), [effectiveTheme]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6 max-w-md w-full p-4">
        <div className="relative">
          <img src={logoSrc} alt="Gnosis Pay" className="w-16 h-16 animate-breathing" />
        </div>
        <p className="text-muted-foreground text-center animate-pulse">Loading Gnosis Pay...</p>
      </div>
    </div>
  );
};
