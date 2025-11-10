import { AlertTriangle, Snowflake, Ban } from "lucide-react";

interface CardStatusOverlayProps {
  status: "frozen" | "stolen" | "lost" | "void" | "other";
  showText?: boolean;
  iconSize?: number;
}

export const CardStatusOverlay = ({ status, showText = true, iconSize = 40 }: CardStatusOverlayProps) => {
  const iconClassName = showText ? "text-white mb-2" : "text-white";

  const statusConfig: Record<CardStatusOverlayProps["status"], { icon: React.ReactNode; text: string }> = {
    frozen: {
      icon: <Snowflake size={iconSize} className={iconClassName} />,
      text: "FROZEN",
    },
    stolen: {
      icon: <AlertTriangle size={iconSize} className={iconClassName} />,
      text: "STOLEN",
    },
    lost: {
      icon: <AlertTriangle size={iconSize} className={iconClassName} />,
      text: "LOST",
    },
    void: {
      icon: <Ban size={iconSize} className={iconClassName} />,
      text: "VOID",
    },
    other: {
      icon: <AlertTriangle size={iconSize} className={iconClassName} />,
      text: "",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-1">
      {config.icon}
      {showText && <span className="text-white text-sm font-semibold tracking-widest">{config.text}</span>}
    </div>
  );
};
