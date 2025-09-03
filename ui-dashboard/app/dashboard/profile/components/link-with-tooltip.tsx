import { Question } from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import type { Icon as IconType } from "@phosphor-icons/react";

interface LinkWithTooltipProps {
  link?: string;
  Icon?: IconType;
  title?: string;
  classNames?: string;
}

const LinkWithTooltip = ({
  link,
  Icon,
  title,
  classNames,
}: LinkWithTooltipProps) => (
  <div className="rounded-md text-stone-900 relative inline-block mt-1">
    <div className="relative inline-block group">
      <span
        className={twMerge(
          "w-20 text-center absolute bottom-full mb-0 transform right-1/2 -translate-y-1 md:left-1/2 md:-translate-x-1/2 bg-black text-white text-xs rounded py-1 px-1 shadow-lg hidden group-hover:block z-50",
          classNames,
        )}
      >
        {title || "Learn more"}
      </span>

      <a href={link} target="_blank" rel="noopener noreferrer">
        {Icon ? <Icon /> : <Question />}
      </a>
    </div>
  </div>
);

export default LinkWithTooltip;
