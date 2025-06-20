import { getIconForMcc } from "@/utils/mccUtils";

interface MccIconProps {
  mcc?: string;
  size?: number;
  className?: string;
}

const MccIcon = ({ mcc, size = 24, className }: MccIconProps) => {
  const Icon = getIconForMcc(mcc);
  return <Icon size={size} className={className} />;
};

export default MccIcon;
