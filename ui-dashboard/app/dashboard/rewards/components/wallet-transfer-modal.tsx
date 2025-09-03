import { CaretLeft, CopySimple, Warning } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { useViewport } from "@/hooks/use-viewport";
import { shortenAddress } from "@/lib/utils";

export const WalletTransferModal = ({
  safeAddress,
  isOpen,
  onClose,
  onBack,
}: {
  safeAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}) => {
  const [, copy] = useClipboardCopy({ showToast: true });

  const { isMobile } = useViewport();

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl bg-bg-secondary"
      absolutelyCentered
    >
      <div>
        <div className="border-b border-stone-200 p-6">
          <CaretLeft
            onClick={onBack}
            className="cursor-pointer text-xl absolute top-7 left-6"
          />
          <h3 className="text-lg text-center">Wallet Transfer</h3>
        </div>
        <div className="space-y-4 flex-col p-6">
          <p>Use the address below to send GNO to your Gnosis Pay Safe</p>

          <div className="flex align-center justify-between">
            <div>
              <p className="text-sm text-secondary">Safe Address</p>
              <p>
                {isMobile
                  ? shortenAddress(safeAddress as `0x${string}`)
                  : safeAddress}
              </p>
            </div>
            <button onClick={() => copy(safeAddress)}>
              <CopySimple className="text-xl" />
            </button>
          </div>
          <hr />
          <div>
            <p className="text-sm text-secondary">Network</p>
            <p>Gnosis Chain</p>
          </div>
          <hr />
          <div className="bg-warning-yellow rounded-md border border-warning p-4 text-primary space-x-2 flex">
            <div className="text-warning">
              <Warning size={24} />
            </div>
            <p className="text-primary text-sm">
              Please only deposit GNO on Gnosis Chain. If you deposit on another
              network, your assets may be lost.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
