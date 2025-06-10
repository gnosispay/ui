import { CreditCard, Home } from "lucide-react";
import { ModeToggle } from "../theme-toggle";
import { NavLink } from "react-router";

export const FooterNavBar = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full border-t lg:hidden py-2 bg-background z-50">
      <div className="grid grid-cols-3 h-14 items-center px-4">
        {/* Empty left cell */}
        <div />
        {/* Center cell with nav links */}
        <div className="flex items-center justify-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-base font-medium transition-colors ${
                isActive ? "text-link-active font-normal" : "text-muted-foreground"
              }`
            }
            end
          >
            <Home size={28} />
            <span className="text-sm">Home</span>
          </NavLink>
          <NavLink
            to="/cards"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-base font-medium transition-colors ${
                isActive ? "text-link-active font-normal" : "text-muted-foreground"
              }`
            }
          >
            <CreditCard size={28} />
            <span className="text-sm">Cards</span>
          </NavLink>
        </div>
        {/* Right cell with ModeToggle */}
        <div className="flex justify-end">
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};
