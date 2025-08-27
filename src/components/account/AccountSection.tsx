import { ChevronRight } from "lucide-react";

interface AccountSectionProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ icon, title, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center text-foreground">{icon}</div>
        <span className="text-foreground font-medium">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
};
