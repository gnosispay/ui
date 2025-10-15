import { ModeToggle } from "../theme-toggle";
import { NavLink } from "react-router-dom";
import { menuRoutes } from "@/App";
import { MessageCircle } from "lucide-react";
import { useZendesk } from "react-use-zendesk";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export const FooterNavBar = () => {
  const { open, show } = useZendesk();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSupportClick = useCallback(() => {
    open();
    show();
    setIsAnimating(true);

    // Stop animation after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [open, show]);

  return (
    <>
      {/* Spacer for header height on mobile */}
      <div className="h-20 lg:hidden" />
      <footer className="fixed bottom-0 left-0 w-full border-t lg:hidden py-2 bg-background z-50">
        <div className="relative flex h-10 items-center px-4">
          {/* Centered menu items */}
          <div className="flex-1 flex items-center justify-center gap-6">
            {menuRoutes.map((route) => (
              <NavLink
                to={route.path}
                key={route.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 text-base font-medium transition-colors ${
                    isActive ? "text-link-active font-normal" : "text-muted-foreground"
                  }`
                }
              >
                <route.icon size={18} />
                <span className="text-xs">{route.label}</span>
              </NavLink>
            ))}
          </div>
          {/* Absolute positioned buttons on the right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <Button variant="outline" size="icon" onClick={handleSupportClick}>
              <MessageCircle className={cn("h-[1.2rem] w-[1.2rem]", isAnimating && "animate-ping")} />
              <span className="sr-only">Open support</span>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </footer>
    </>
  );
};
