import MainNav from "./main-nav";
import MobileNav from "./mobile-nav";

export const SiteHeader = () => {
  return (
    <header className="w-full border-b">
      <div className="flex h-14 items-center px-4">
        <MainNav />
        <MobileNav />
      </div>
    </header>
  );
};
