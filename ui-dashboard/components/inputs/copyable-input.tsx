import { twMerge } from "tailwind-merge";
import { Copy } from "@phosphor-icons/react";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";

const CopyableInput = ({ label, text }: { label: string; text: string }) => {
  const [, copy] = useClipboardCopy({ showToast: true });

  return (
    <>
      <div>
        <label htmlFor="copyableInput" className="text-sm text-gray-500 w-fit">
          {label}
        </label>
        <div className="relative m-0">
          <input
            id="copyableInput"
            value={text}
            readOnly
            className={twMerge(
              "block w-full appearance-none rounded-md border border-low-contrast text-gray-700 placeholder-gray-400",
              "focus:outline-0 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base pr-10 mt-2",
            )}
          />
          <button
            type="button"
            onClick={() => copy(text)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Copy size={26} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CopyableInput;
