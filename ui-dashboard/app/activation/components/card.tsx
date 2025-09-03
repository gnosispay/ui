// Card.tsx
import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

const Card = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={twMerge(
      " relative bg-white rounded-[20px] shadow border border-gray-200",
      className,
    )}
  >
    {children}
  </div>
);

export default Card;
