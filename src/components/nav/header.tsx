import { ConnectButton } from "@rainbow-me/rainbowkit";
import darklogo from "../../assets/GP-logo-white.png";
import lightLogo from "../../assets/GP-logo.png";
import { ModeToggle } from "../theme-toggle";
import { useTheme } from "../../context/ThemeContext";
import { NavLink } from "react-router";
import { routes } from "@/App";

export const HeaderNavBar = () => {
  const { effectiveTheme } = useTheme();
  return (
    <header className="w-full border-b hidden lg:block">
      <div className="h-14 flex items-center px-4">
        <div className="grid grid-cols-6 w-full items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 col-start-2">
            <img src={effectiveTheme === "light" ? lightLogo : darklogo} alt="Gnosis Pay logo" />
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-8">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-base font-medium transition-colors ${
                    isActive ? "text-link-active font-normal" : "text-muted-foreground"
                  }`
                }
              >
                <route.icon size={22} />
                {route.label}
              </NavLink>
            ))}
          </div>
          {/* Actions */}
          <div className="col-start-4 col-span-2 flex gap-2 items-center justify-end">
            <ConnectButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
