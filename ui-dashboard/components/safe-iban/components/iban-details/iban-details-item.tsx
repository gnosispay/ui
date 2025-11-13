"use client";

import { Copy } from "@phosphor-icons/react/dist/ssr";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";

interface IbanDetailsItemProps {
  title: string;
  value: string;
  dividerVisible?: boolean;
}
export const IbanDetailsItem = ({
  title,
  value,
  dividerVisible = true,
}: IbanDetailsItemProps) => {
  const [, copy] = useClipboardCopy({ showToast: true });

  return (
    <div className={dividerVisible ? "border-b border-low-contrast pb-3" : ""}>
      <p className="text-sm text-gp-text-lc mb-1">{title}</p>
      <div className="flex flex-row justify-between">
        <p>{value}</p>

        <button onClick={() => copy(value as string)} type="button">
          <Copy size={20} />
        </button>
      </div>
    </div>
  );
};
