import { DelayedTransactionType } from "@gnosispay/account-kit";
import {
  Bank,
  Coins,
  CreditCard,
  LineSegments,
} from "@phosphor-icons/react/dist/ssr";
import type { Token } from "@lifi/sdk";

const DelayIcon = ({
  className,
  txType,
  token,
}: {
  token: Token | undefined;
  className: string;
  txType: DelayedTransactionType;
}) => {
  switch (txType) {
    case DelayedTransactionType.ERC20Transfer:
    case DelayedTransactionType.NativeTransfer:
      if (token) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt={token.symbol} className={className} />
        );
      }
      return <Coins className={className} />;
    case DelayedTransactionType.LimitChange:
      return <CreditCard className={className} />;
    case DelayedTransactionType.SignMessage:
      return <Bank className={className} />;
    default:
      return <LineSegments className={className} />;
  }
};

export default DelayIcon;
