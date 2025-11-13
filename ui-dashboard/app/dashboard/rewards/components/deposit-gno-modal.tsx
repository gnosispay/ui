import {
  CaretRight,
  Swap,
  TrayArrowDown,
} from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";

export const DepositGNOModal = ({
  isOpen,
  onClose,
  onWalletTransferOpen,
  onSwapOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onWalletTransferOpen: () => void;
  onSwapOpen: () => void;
}) => {
  return (
    <>
      <Dialog
        isOpen={isOpen}
        handleClose={onClose}
        containerClassName="p-0 max-w-xl bg-bg-secondary"
        absolutelyCentered
      >
        <div>
          <div className="border-b border-stone-200 p-6">
            <h3 className="text-lg text-center">Top up GNO</h3>
          </div>
          <div className="space-y-4 flex-col p-4">
            <Option
              title="Wallet transfer"
              subtitle="Send GNO to your Gnosis Pay Safe"
              onClick={onWalletTransferOpen}
              icon={<TrayArrowDown />}
            />
            <Option
              title="Swap tokens"
              subtitle="Exchange your crypto for GNO"
              onClick={onSwapOpen}
              icon={<Swap />}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

const Option = ({
  title,
  subtitle,
  onClick,
  icon,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  icon: JSX.Element;
}) => (
  <a
    onClick={onClick}
    className="border border-stone-200 px-4 py-3 cursor-pointer flex justify-between items-center rounded-lg bg-white"
  >
    <div className="flex space-x-4 items-center">
      <div className="text-3xl">{icon}</div>
      <div className="space-y-1">
        <h3>{title}</h3>
        <p className="text-sm text-secondary">{subtitle}</p>
      </div>
    </div>
    <CaretRight className="text-3xl" />
  </a>
);
