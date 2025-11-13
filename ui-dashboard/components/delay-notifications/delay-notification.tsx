import {
  DelayedTransactionType,
  profileDelayedTransaction,
} from "@gnosispay/account-kit";
import { decodeErc20Transfer } from "@/lib/erc-20";
import useTokenList from "@/hooks/use-token-list";
import DelayStatus from "./delay-status";
import DelayHeader from "./delay-header";
import DelayIcon from "./delay-icon";
import type { TransactionRequest } from "@gnosispay/account-kit";
import type { DelayTransactionStatus } from "@/lib/get-delay-transactions";
import type { Token } from "@lifi/sdk";

interface DelayNotificationProps {
  status: DelayTransactionStatus;
  transactionData: TransactionRequest;
  readyDate?: string | null;
  account: `0x${string}`;
}

const DelayNotification = ({
  status,
  transactionData,
  readyDate,
  account,
}: DelayNotificationProps) => {
  const { data: tokens, isPending: tokensLoading } = useTokenList(100);

  /**
   * We manually set the GBPe logo as it is not yet indexed by Li.Fi data providers.
   *
   * This is safe to remove after Li.Fi starts sending us `logoURI` for GBPe.
   */
  //tokens[SUPPORTED_TOKENS_DATA.GBPe.tokenAddress] = {
  //  ...tokens[SUPPORTED_TOKENS_DATA.GBPe.tokenAddress],
  //  logoURI: "https://monerium.app/tokens/gbp/gbp.png",
  //};

  let txType: DelayedTransactionType;
  try {
    txType = profileDelayedTransaction(account, transactionData);
  } catch (error) {
    console.log("Error profiling transaction", error);
    txType = DelayedTransactionType.Other;
  }

  let token: Token | undefined;
  let receiver: `0x${string}` | null;

  if (txType === DelayedTransactionType.NativeTransfer) {
    token = tokens["0x0000000000000000000000000000000000000000"];
    receiver = transactionData.to as `0x${string}`;
  } else {
    token = tokens[transactionData.to];

    try {
      receiver = decodeErc20Transfer(transactionData.data as `0x${string}`)
        .args?.[0] as `0x${string})`;
    } catch (error) {
      receiver = null;
    }
  }

  return (
    <div className="flex bg-stone-100 p-4 shadow gap-3 rounded-lg">
      {!tokensLoading && (
        <DelayIcon
          className="w-5 h-5 text-stone-600 mt-[2px]"
          txType={txType}
          token={token}
        />
      )}
      <div className="flex flex-col gap-2">
        <DelayHeader txType={txType} token={token} receiver={receiver} />
        <div className="text-xs text-gray-500 flex flex-col gap-2">
          <p>Your card will be frozen while this transaction executes</p>
          <div className="flex gap-1 items-center">
            <DelayStatus status={status} readyDate={readyDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayNotification;
