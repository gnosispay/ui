import type { ReactNode, FC } from "react";

interface CardActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export const CardActionButton: FC<CardActionButtonProps> = ({ icon, label, onClick }) => (
  <div className="flex flex-col items-center w-18 gap-2">
    <button
      type="button"
      className="w-12 h-12 rounded-xl bg-button-bg flex items-center justify-center mb-1 hover:bg-button-bg-hover transition-colors cursor-pointer"
      onClick={onClick}
    >
      {icon}
    </button>
    <span className="text-xs text-foreground">{label}</span>
  </div>
);
