import VerificationInput from "react-verification-input";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
}
const PinInput = ({ value, onChange }: PinInputProps) => (
  <VerificationInput
    value={value}
    autoFocus
    passwordMode
    inputProps={{
      inputMode: "numeric",
      style: { outline: "none", boxShadow: "none" },
    }}
    validChars="0-9"
    length={4}
    placeholder=""
    onChange={(value) => onChange(value)}
    classNames={{
      container: "flex gap-2 outline-0 focus:outline-0 w-[14rem]",
      character: "rounded-md p-4 text-center text-xl focus:outline-0",
      characterSelected: "border-0 outline-high-contrast",
      characterInactive: "border border-low-contrast bg-gp-bg-subtle",
      characterFilled: "border-low-contrast text-black",
    }}
  />
);

export default PinInput;
