import { Swap } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import { SwapProvider } from "@/components/move-funds/swap-tokens/types";
import { AddFundsOption } from "@/components/move-funds/add-funds-dialog/add-funds-option";

export const SwapGNOModal = ({
  isOpen,
  onClose,
  onSwapOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSwapOpen: (provider: SwapProvider) => void;
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl bg-bg-secondary"
      absolutelyCentered
    >
      <div>
        <div className="border-b border-stone-200 p-6">
          <h3 className="text-lg text-center">Swap tokens</h3>
        </div>
        <div className="space-y-4 flex-col p-4">
          <AddFundsOption
            title="Swap via deBridge"
            description="Exchange your crypto for GNO"
            onClick={() => onSwapOpen(SwapProvider.deBridge)}
            icon={<Swap className="text-2xl" />}
          />
          <AddFundsOption
            title="Swap via LI.FI"
            description="Exchange your crypto for GNO"
            onClick={() => onSwapOpen(SwapProvider.LiFi)}
            icon={<Swap className="text-2xl" />}
          />
        </div>
      </div>
    </Dialog>
  );
};
