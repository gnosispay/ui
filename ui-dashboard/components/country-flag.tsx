import { iso31661NumericToAlpha2 } from "iso-3166";
import "../node_modules/flag-icons/css/flag-icons.min.css";
import { twMerge } from "tailwind-merge";

interface Props {
  countryNumericCode: string; // ISO 3166-1 numeric code
  square?: boolean;
  className?: string;
}

const CountryFlag = ({ countryNumericCode, square, className }: Props) => {
  const alpha2 = iso31661NumericToAlpha2[countryNumericCode];

  return (
    <div
      className={twMerge(
        `h-fit fi fi-${alpha2?.toLowerCase() ?? "xx"}`,
        square && "fis",
        className,
      )}
    ></div>
  );
};

export default CountryFlag;
