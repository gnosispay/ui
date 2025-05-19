import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  error: unknown;
}

export const CollapsedError = ({ error, title }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div>{title}</div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div onClick={() => setOpen(!open)} className="flex items-center cursor-pointer text-muted-foreground">
        Details <ChevronDown size={16} className={open ? "rotate-180" : ""} />
      </div>
      <div className={`text-sm text-muted-foreground ${open ? "block" : "hidden"}`}>
        {JSON.stringify(error, null, 2)}
      </div>
    </div>
  );
};
