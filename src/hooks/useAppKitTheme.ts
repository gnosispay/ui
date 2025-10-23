import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { appKit } from "@/wagmi";

/**
 * Hook to synchronize AppKit theme with your application's theme context
 *
 * Uses AppKit's setThemeMode method to properly update the theme.
 */
export function useAppKitTheme() {
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    // Convert "system" to actual theme for AppKit
    const themeMode =
      effectiveTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : effectiveTheme;

    // Use AppKit's official setThemeMode method
    try {
      if (appKit && typeof appKit.setThemeMode === "function") {
        appKit.setThemeMode(themeMode);
      }
    } catch (error) {
      console.warn("Failed to update AppKit theme mode:", error);
    }
  }, [effectiveTheme]);

  return effectiveTheme;
}
