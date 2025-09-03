import { twMerge } from "tailwind-merge";

const MainContent = ({ children }: { children: React.ReactNode }) => (
  <div
    className={twMerge(
      "px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-0 md:mb-10",
    )}
  >
    <div>
      <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start">
        Your Balances
      </h1>
      <p className="text-gp-text-lc">
        Better understand your different balances
      </p>
    </div>
    {children}
  </div>
);

export default MainContent;
