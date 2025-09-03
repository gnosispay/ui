import { Warning } from "@phosphor-icons/react";
import { X } from "@phosphor-icons/react/dist/ssr";

export const ImportantNotification = ({
  title,
  text,
  onClose,
}: {
  title: string;
  text?: string;
  onClose?: () => void;
}) => {
  return (
    <div className="flex bg-stone-100 p-4 shadow gap-3 rounded-lg">
      <Warning className="w-5 h-5 text-stone-600 mt-[2px] text-danger" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p>{title}</p>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 flex flex-col gap-2">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
};
