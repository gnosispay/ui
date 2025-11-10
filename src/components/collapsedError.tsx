import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";

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
    <div className="flex flex-col" data-testid="collapsed-error">
      <div>{title}</div>
      <Button variant="ghost" onClick={onSwitch} className="text-muted-foreground p-0 justify-start w-fit">
        Details <ChevronDown size={16} className={open ? "rotate-180" : ""} />
      </Button>
      <div className={`text-sm text-muted-foreground ${open ? "block" : "hidden"}`}>
        {JSON.stringify(error, errorReplacer, 2)}
      </div>
    </div>
  );
};
