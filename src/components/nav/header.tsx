import { ConnectButton } from "@rainbow-me/rainbowkit";
import darklogo from "../../assets/GP-logo-white.svg";
import lightLogo from "../../assets/GP-logo-black.svg";
import { ModeToggle } from "../theme-toggle";
import { useTheme } from "../../context/ThemeContext";
import { NavLink } from "react-router";
import { routes } from "@/App";

export const HeaderNavBar = () => {
  const { effectiveTheme } = useTheme();
  return (
    <header className="w-full border-b hidden lg:block">
      <div className="py-4 flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <a href="/">
                <img src={effectiveTheme === "light" ? lightLogo : darklogo} alt="Gnosis Pay logo" />
              </a>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-8">
              {routes.map((route) => {
                if (!route.inNavBar || !route.icon || !route.label) {
                  return;
                }

                return (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-sm font-semibold transition-colors ${
                        isActive ? "text-link-active" : "text-link-secondary"
                      }`
                    }
                  >
                    <route.icon size={16} />
                    {route.label}
                  </NavLink>
                );
              })}
            </div>
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
