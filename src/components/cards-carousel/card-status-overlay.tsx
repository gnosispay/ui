import { AlertTriangle, Snowflake, Ban } from "lucide-react";

interface CardStatusOverlayProps {
  status: "frozen" | "stolen" | "lost" | "void";
}

export const CardStatusOverlay = ({ status }: CardStatusOverlayProps) => {
  const statusConfig: Record<CardStatusOverlayProps["status"], { icon: React.ReactNode; text: string }> = {
    frozen: {
      icon: <Snowflake size={40} className="text-white mb-2" />,
      text: "FROZEN",
    },
    stolen: {
      icon: <AlertTriangle size={40} className="text-white mb-2" />,
      text: "STOLEN",
    },
    lost: {
      icon: <AlertTriangle size={40} className="text-white mb-2" />,
      text: "LOST",
    },
    void: {
      icon: <Ban size={40} className="text-white mb-2" />,
      text: "VOID",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-1">
      {config.icon}
      <span className="text-white text-sm font-semibold tracking-widest">{config.text}</span>
    </div>
  );
};
