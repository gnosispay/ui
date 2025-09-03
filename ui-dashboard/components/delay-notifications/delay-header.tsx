import { DelayedTransactionType } from "@gnosispay/account-kit";
import { shortenAddress } from "@/lib/utils";
import type { Token } from "@lifi/sdk";

const addressStyler = (address: `0x${string}`) => {
  return (
    <span className="px-2 py-1 font-mono bg-stone-200 rounded text-sm">
      {shortenAddress(address)}
    </span>
  );
};

const TokenTransferHeader = ({
  token,
  receiver,
}: {
  token: Token | undefined;
  receiver: `0x${string}` | null;
}) => {
  if (token) {
    return (
      <div>
        <span>{token.symbol} send</span>
        {receiver && <span> to {addressStyler(receiver)}</span>}
      </div>
    );
  }
  return (
    <div>
      Token send {receiver && <span> to {addressStyler(receiver)}</span>}
    </div>
  );
};

const DelayHeader = ({
  txType,
  token,
  receiver,
}: {
  txType: DelayedTransactionType;
  token: any;
  receiver: `0x${string}` | null;
}) => {
  switch (txType) {
    case DelayedTransactionType.ERC20Transfer:
    case DelayedTransactionType.NativeTransfer:
      return <TokenTransferHeader token={token} receiver={receiver} />;
    case DelayedTransactionType.AddOwner:
      return <div>Adding Account Owner</div>;
    case DelayedTransactionType.RemoveOwner:
      return <div>Removing Account Owner</div>;
    case DelayedTransactionType.LimitChange:
      return <div>Spending limit change</div>;
    case DelayedTransactionType.SignMessage:
      return <div>Generating IBAN</div>;
    default:
      return <div>Contract interaction</div>;
  }
};

export default DelayHeader;
