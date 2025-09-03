import { Wallet } from "@phosphor-icons/react/dist/ssr";

import { classNames } from "@/lib/utils";

interface ContinueOnWalletWarningProps {
  containerClassNames?: string;
}
const ContinueOnWalletWarning = ({
  containerClassNames,
}: ContinueOnWalletWarningProps) => (
  <div
    className={classNames(
      "flex items-center px-4 py-5 gap-3 bg-amber-50 p-4 mt-1 border border-amber-100",
      containerClassNames,
    )}
  >
    <div className="flex-shrink-0">
      <Wallet className="h-5 w-5 text-amber-600" aria-hidden="true" />
    </div>

    <div className="text-xs font-medium text-stone-900">
      Continue on your wallet to confirm and finalize this action.
    </div>
  </div>
);

export default ContinueOnWalletWarning;
