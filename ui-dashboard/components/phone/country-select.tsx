import { useCallback, useMemo } from "react";
import classNames from "classnames";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import type { ChangeEvent } from "react";

export default function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  ...rest
}: {
  value: string;
  onChange?: (value: string | undefined) => void;
  options: Array<{
    value: string;
    label: string;
    divider?: boolean;
  }>;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  const onChange_ = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      onChange?.(value === "ZZ" ? undefined : value);
    },
    [onChange],
  );

  // "ZZ" means "International".
  // (HTML requires each `<option/>` have some string `value`).
  return (
    <select
      {...rest}
      disabled={disabled || readOnly}
      aria-readonly={readOnly}
      value={value || "ZZ"}
      onChange={onChange_}
    >
      {options.map(({ value, label, divider }) => (
        <option
          key={divider ? "|" : value || "ZZ"}
          value={divider ? "|" : value || "ZZ"}
          disabled={divider ? true : false}
          style={divider ? DIVIDER_STYLE : undefined}
        >
          {label}
        </option>
      ))}
    </select>
  );
}

const DIVIDER_STYLE = {
  fontSize: "1px",
  backgroundColor: "currentColor",
  color: "inherit",
};

export function CountrySelectWithIcon({
  value,
  options,
  className,
  iconComponent: Icon,
  unicodeFlags,
  ...rest
}: {
  value: string;
  options: Array<{
    value: string;
    label: string;
    divider: boolean;
  }>;
  className: string;
  iconComponent: React.ComponentType<any>;
  unicodeFlags: boolean;
}) {
  const selectedOption = useMemo(() => {
    return getSelectedOption(options, value);
  }, [options, value]);

  return (
    <div className="PhoneInputCountry border border-low-contrast rounded-md px-4">
      <CountrySelect
        {...rest}
        value={value}
        options={options}
        className={classNames("PhoneInputCountrySelect", className)}
      />

      {/* Either a Unicode flag icon. */}
      {unicodeFlags && value && (
        <div className="PhoneInputCountryIconUnicode text-4xl">
          {getUnicodeFlagIcon(value)}
        </div>
      )}

      {/* Or an SVG flag icon. */}
      {!(unicodeFlags && value) && (
        <div className="rounded-full overflow-hidden">
          <Icon
            aria-hidden
            country={value}
            label={selectedOption && selectedOption.label}
            aspectRatio={unicodeFlags ? 1 : undefined}
            className="w-6 h-6"
          />
        </div>
      )}

      <div className="ml-2">
        <CaretDown />
      </div>
    </div>
  );
}

function getSelectedOption(options: Array<any>, value: string) {
  for (const option of options) {
    if (!option.divider && option.value === value) {
      return option;
    }
  }
}
