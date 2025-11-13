import type { Icon as IconType } from "@phosphor-icons/react";

interface BaseCardWarningProps {
  title: string;
  description: string;
  icon: IconType;
}

const BaseCardWarning = ({
  title,
  description,
  icon: Icon,
}: BaseCardWarningProps) => {
  return (
    <div className="bg-amber-100 relative p-4 rounded-md flex gap-3 ">
      <Icon className="h-7 w-7 text-yellow-600" />
      <div>
        <h2 className="flex items-center justify-start text-stone-800 font-semibold">
          {title}
        </h2>
        <p className="text-stone-800">{description}</p>
      </div>
    </div>
  );
};

export default BaseCardWarning;
