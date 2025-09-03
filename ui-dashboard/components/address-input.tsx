import { classNames } from "../lib/utils";
import Input from "./inputs/input-base";

interface AddressInputProps {
  value: `0x${string}` | "";
  onChange?: (address: `0x${string}`) => void;
  disabled?: boolean;
  invalid?: boolean;
}

const AddressInput = ({
  value,
  onChange,
  disabled,
  invalid,
}: AddressInputProps) => {
  return (
    <Input
      className={classNames(
        "text-sm text-gray-700 py-2.5",
        invalid ? "border-red-500 focus:border-red-500" : "border-gp-border",
      )}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(e.target.value as `0x${string}`)
      }
      spellCheck={false}
      placeholder="Enter address here..."
      disabled={disabled}
      required="required"
    />
  );
};

export default AddressInput;
