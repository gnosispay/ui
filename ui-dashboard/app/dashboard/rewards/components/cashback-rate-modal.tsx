import { MoneyWavy } from "@phosphor-icons/react/dist/ssr";
import { useBalance } from "wagmi";
import Image from "next/image";
import { formatUnits, type Address } from "viem";
import { PAYMENT_CHAIN_ID } from "@/app/activation/lib/constants";
import Dialog from "@/components/dialog";
import { GNO_TOKEN_ADDRESS, GNOSIS_CASHBACK_FAQ_URL } from "@/lib/constants";
import { calculateCashbackRate } from "../utils/rate";
import { CashbackRateProgressBar } from "./cashback-rate-progress-bar";
import { OgTokenTag } from "./og-token-tag";

export const CashbackRateModal = ({
  isOpen,
  onClose,
  safeAddress,
  isOgTokenHolder,
}: {
  isOpen: boolean;
  onClose: () => void;
  safeAddress: Address;
  isOgTokenHolder: boolean;
}) => {
  const { data: gnoBalance } = useBalance({
    address: safeAddress,
    chainId: PAYMENT_CHAIN_ID,
    token: GNO_TOKEN_ADDRESS,
  });

  const gnoNumberValue = gnoBalance?.value
    ? Number(formatUnits(gnoBalance.value, 18))
    : 0;

  const calculatedRate = calculateCashbackRate(gnoNumberValue);

  return (
    <>
      <Dialog
        isOpen={isOpen}
        handleClose={onClose}
        containerClassName="max-w-xl bg-bg-secondary flex flex-col space-y-8"
        absolutelyCentered
      >
        <div className="flex flex-col items-center justify-center mt-16 space-y-4">
          <MoneyWavy className="text-6xl text-green-brand" />
          <h3 className="text-2xl text-center font-brand">Cashback rate</h3>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 items-center">
                  <Image
                    src="/static/logo-simple-black.svg"
                    alt="Gnosis Pay"
                    width={16}
                    height={16}
                  />
                  <span>GNO balance</span>
                </div>
                <span>{gnoBalance?.value ? gnoBalance.formatted : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cashback rate</span>
                <div className="flex space-x-2 items-center">
                  <span>{calculatedRate.toFixed(2)}%</span>
                  {isOgTokenHolder && <OgTokenTag />}
                </div>
              </div>
            </div>
            <CashbackRateProgressBar rate={calculatedRate} />
          </div>
          <p className="text-center">
            Your cashback rate is determined by the amount of GNO you hold in
            your Gnosis Pay Safe. The more you have the higher your rate, up to
            a maximum of 4%. Cashback rewards are airdropped on a weekly basis.
          </p>
          <p className="text-green-brand-dark text-center">
            OG NFT holders enjoy an extra 1%. To claim this reward you need to
            have at least 0.1 GNO into your Gnosis Pay Safe.
          </p>
          <p className="text-center">
            For more details read our{" "}
            <a
              className="underline"
              href={GNOSIS_CASHBACK_FAQ_URL}
              target="_blank"
            >
              Cashback FAQ
            </a>
          </p>
        </div>
      </Dialog>
    </>
  );
};
