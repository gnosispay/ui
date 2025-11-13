import type { Icon as IconType } from "@phosphor-icons/react";

interface IbanFeatureItemProps {
  Icon: IconType;
  title: string;
  description: string | React.ReactNode;
}
export const IbanFeatureItem = ({
  Icon,
  title,
  description,
}: IbanFeatureItemProps) => (
  <div className="flex flex-row gap-3">
    <Icon className="text-yellow-500 text-2xl flex-shrink-0 mt-0.5" />

    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gp-text-lc">{description}</p>
    </div>
  </div>
);
