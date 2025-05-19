import { ConnectButton } from "@rainbow-me/rainbowkit";
import darklogo from "../assets/GP-logo-white.png";
import lightLogo from "../assets/GP-logo.png";
import { ModeToggle } from "./theme-toggle";
import { useTheme } from "../context/ThemeContext";

export default function MainNav() {
  const { effectiveTheme } = useTheme();
  return (
    <div className="mr-4 hidden gap-2 md:flex w-full">
      <div className="grid grid-cols-6 w-full">
        <div className="flex items-center gap-2 col-start-2">
          <img className="" src={effectiveTheme === "light" ? lightLogo : darklogo} alt="Gnosis Pay logo" /> v2
        </div>

        <div className="col-start-4 col-span-2 flex gap-2 items-center justify-end">
          <ConnectButton />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
