import { useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { getCSSVariable } from "@/utils/getCSSVariable";

export const RainbowKitWrapper = ({ children }: { children: React.ReactNode }) => {
  const { effectiveTheme } = useTheme();

  // Memoize theme creation for performance
  const customThemes = useMemo(() => {
    // Base theme configuration using CSS variables
    const baseThemeConfig = {
      accentColor: getCSSVariable("--color-brand"),
      accentColorForeground: getCSSVariable("--color-button-black"),
      borderRadius: "medium" as const,
    };

    // Create base themes
    const customLightTheme = lightTheme(baseThemeConfig);
    const customDarkTheme = darkTheme(baseThemeConfig);

    // Common styling overrides for both themes using CSS variables
    const applyCommonStyles = (theme: typeof customLightTheme) => {
      // Font family from CSS variable or fallback
      theme.fonts.body = getCSSVariable("--font-family");

      // Border radius using CSS variables
      theme.radii.actionButton = getCSSVariable("--radius-sm");
      theme.radii.connectButton = getCSSVariable("--radius-sm");
      theme.radii.menuButton = getCSSVariable("--radius-sm");
      theme.radii.modal = getCSSVariable("--radius");
      theme.radii.modalMobile = getCSSVariable("--radius");

      // Shadows - using standard shadow-xs equivalent
      const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
      const shadowMd = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)";

      theme.shadows.connectButton = shadowXs;
      theme.shadows.dialog = shadowMd;
      theme.shadows.profileDetailsAction = shadowXs;
      theme.shadows.selectedOption = shadowXs;
      theme.shadows.selectedWallet = shadowXs;
      theme.shadows.walletLogo = shadowXs;
    };

    // Customize light theme colors using CSS variables
    customLightTheme.colors.connectButtonBackground = getCSSVariable("--color-card");
    customLightTheme.colors.connectButtonBackgroundError = getCSSVariable("--color-destructive");
    customLightTheme.colors.connectButtonInnerBackground = getCSSVariable("--color-background");

    // Apply common styles to both themes
    applyCommonStyles(customLightTheme);
    applyCommonStyles(customDarkTheme);

    return {
      light: customLightTheme,
      dark: customDarkTheme,
    };
  }, []); // CSS variables are read dynamically, so no dependencies needed

  return <RainbowKitProvider>{children}</RainbowKitProvider>;
};
