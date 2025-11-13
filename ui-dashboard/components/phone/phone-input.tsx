import PhoneField from "react-phone-number-input/min";
import "react-phone-number-input/style.css";
import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";
import { CountrySelectWithIcon } from "./country-select";
import type { FocusEventHandler, Ref } from "react";

interface Props {
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur?: FocusEventHandler<Element> | undefined;
}

const PhoneInput: React.FC<Props> = ({ onChange, onBlur, value }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-sm text-secondary">Mobile number</label>

      <PhoneField
        international
        countrySelectComponent={CountrySelectWithIcon}
        inputComponent={PhoneInputComponent}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="+49 123 456 7890"
        className={twMerge(
          "block w-full appearance-none rounded-md text-gray-700 placeholder-gray-400",
          "focus:border-low-contrast focus:outline-0 focus:ring-stone-800/50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base",
        )}
      />
    </div>
  );
};

const PhoneInputComponent = forwardRef(function PhoneInputComponent(
  props,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      ref={ref}
      type="text"
      className={twMerge(
        "block w-full appearance-none rounded-md border border-low-contrast text-gray-700 placeholder-gray-400",
        "focus:outline-0 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base",
      )}
    />
  );
});

PhoneInputComponent.displayName = "PhoneInputComponent";

export default PhoneInput;
