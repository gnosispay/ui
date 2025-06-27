import { useRef, useId } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const removeSpaces = (str: string) => str.replace(/\D/g, "");

export const OtpInput = ({ value, onChange, isLoading, disabled }: Props) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const length = 6;
  const baseId = useId();

  const focusInput = (idx: number) => setTimeout(() => inputsRef.current[idx]?.focus(), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = removeSpaces(e.target.value);

    const newValue = `${value.slice(0, idx)}${val}${value.slice(idx + 1)}`;
    onChange(newValue);
    if (val && idx < length - 1) {
      focusInput(idx + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      onChange(`${value.slice(0, idx - 1)}${value.slice(idx)}`);
      focusInput(idx - 1);
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      focusInput(idx - 1);
      e.preventDefault();
    }

    if (e.key === "ArrowRight" && idx < length - 1) {
      focusInput(idx + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => {
    const paste = removeSpaces(e.clipboardData.getData("text"));

    if (!paste) return;

    // truncate pasting to the remaining amount of chars
    const chars = paste.split("").slice(0, length - idx);
    // keep the previous chars and override with the pasted value
    const newValue = `${value.slice(0, idx)}${chars.join("")}${value.slice(idx + chars.length)}`;
    onChange(newValue);

    const nextIdx = Math.min(idx + chars.length, length - 1);
    focusInput(nextIdx);

    e.preventDefault();
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, idx) => (
        <Input
          key={`${baseId}-otp-input-${idx + 1}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl font-mono border-2 border-secondary rounded focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={(e) => handlePaste(e, idx)}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          disabled={isLoading || disabled}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};
