import { Erc20TokenEventDirection } from "@gnosispay/types";
import { ArrowSquareIn, ArrowSquareOut } from "@phosphor-icons/react";

const Erc20TransferIcon = ({
  direction,
  classNames,
}: {
  direction: Erc20TokenEventDirection;
  classNames: string;
}) => {
  return direction === Erc20TokenEventDirection.Incoming ? (
    <ArrowSquareIn className={classNames} />
  ) : (
    <ArrowSquareOut className={classNames} />
  );
};

export default Erc20TransferIcon;
