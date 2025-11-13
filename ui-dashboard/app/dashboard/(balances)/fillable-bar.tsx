import { twMerge } from "tailwind-merge";

interface FillableBarProps {
  fillPercent: number;
  fillColor?: string;
  bgColor?: string;
  height?: number;
}

const FillableBar = ({
  fillPercent,
  fillColor,
  bgColor,
  height,
}: FillableBarProps) => {
  return (
    <div className="relative w-full" style={{ height: height ?? 4 }}>
      <div
        className={twMerge(
          "absolute top-0 left-0 w-full h-full bg-gray-300 rounded-lg",
          bgColor && `bg-[${bgColor}]`,
        )}
        style={{ height: height ?? 4 }}
      />
      <div
        className={twMerge(
          "absolute top-0 left-0 w-full h-full bg-gp-icon-active rounded-lg",
          fillColor && `bg-[${fillColor}]`,
        )}
        style={{ width: `${fillPercent}%`, height: height ?? 4 }}
      />
    </div>
  );
};

export default FillableBar;
