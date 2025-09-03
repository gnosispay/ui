import { Info } from "@phosphor-icons/react/dist/ssr";

interface IbanInfoItemProps {
  text: string | React.ReactNode;
}
export const IbanInfoItem = ({ text }: IbanInfoItemProps) => (
  <div className="flex flex-row items-start gap-2">
    <Info size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
    <div>
      <span className="text-gp-text-lc text-sm">{text}</span>
    </div>
  </div>
);
