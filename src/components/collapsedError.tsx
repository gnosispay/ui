import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

interface Props {
  title: string;
  error: unknown;
}

function errorReplacer(_: unknown, value: unknown) {
  // The 'this' context refers to the current object being serialized
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      // Include any other fields, e.g., custom properties
    };
  }
  return value;
}

export const CollapsedError = ({ error, title }: Props) => {
  const [open, setOpen] = useState(false);

  const onSwitch = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <div className="flex flex-col">
      <div>{title}</div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div onClick={onSwitch} className="flex items-center cursor-pointer text-muted-foreground">
        Details <ChevronDown size={16} className={open ? "rotate-180" : ""} />
      </div>
      <div className={`text-sm text-muted-foreground ${open ? "block" : "hidden"}`}>
        {JSON.stringify(error, errorReplacer, 2)}
      </div>
    </div>
  );
};
