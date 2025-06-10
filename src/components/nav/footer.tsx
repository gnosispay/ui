import { ModeToggle } from "../theme-toggle";
import { NavLink } from "react-router";
import { routes } from "@/App";

export const FooterNavBar = () => {
  return (
    <>
      {/* Spacer for header height on mobile */}
      <div className="h-20 lg:hidden" />
      <footer className="fixed bottom-0 left-0 w-full border-t lg:hidden py-2 bg-background z-50">
        <div className="grid grid-cols-3 h-14 items-center px-4">
          {/* Empty left cell */}
          <div />
          {/* Center cell with nav links */}
          <div className="flex items-center justify-center gap-8">
            {routes.map((route) => (
              <NavLink
                to={route.path}
                key={route.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 text-base font-medium transition-colors ${
                    isActive ? "text-link-active font-normal" : "text-muted-foreground"
                  }`
                }
              >
                <route.icon size={28} />
                <span className="text-sm">{route.label}</span>
              </NavLink>
            ))}
          </div>
          {/* Right cell with ModeToggle */}
          <div className="flex justify-end">
            <ModeToggle />
          </div>
        </div>
      </footer>
    </>
  );
};
