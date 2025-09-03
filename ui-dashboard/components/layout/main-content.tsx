import { twMerge } from "tailwind-merge";

const MainContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={twMerge(
      "px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-0 md:mb-10",
      className,
    )}
  >
    {children}
  </div>
);

export default MainContent;
