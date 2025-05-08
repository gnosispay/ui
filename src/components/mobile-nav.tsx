import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import darklogo from "../assets/GP-logo-white.png";
import lightLogo from "../assets/GP-logo.png";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "./theme-provider";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { effectiveTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="md:hidden flex w-full">
          <Button variant="ghost" size="icon">
            <MenuIcon />
          </Button>
          <div className="ml-auto">
            <ConnectButton />
          </div>
        </div>
      </SheetTrigger>

      <SheetContent side="left">
        <div className="flex flex-col gap-4">
          <div className="flex mt-4 ml-4">
            <img className="" src={effectiveTheme === "light" ? lightLogo : darklogo} alt="Gnosis Pay logo" /> v2
          </div>

          <div className="ml-4">
            <ModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
