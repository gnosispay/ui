"use client";

import { Trash } from "@phosphor-icons/react";
import useHasMounted from "@/hooks/use-has-mounted";
import useMediaQuery from "@/hooks/use-media-query";
import { classNames, shortenAddress } from "../lib/utils";
import { getGnosisAddressUrl } from "../lib/constants";
import { CopyLinkAddress } from "./copy-link-data";

export interface EoaAccount {
  address: `0x${string}`;
  id?: string;
}

interface EditableAddressProps {
  account: EoaAccount;
  onAccountDelete?: (account: EoaAccount) => void;
  isEditing: boolean;
  isDeletable?: boolean;
}

const EditableAddress = ({
  account,
  onAccountDelete,
  isEditing,
  isDeletable,
}: EditableAddressProps) => {
  const { address } = account;

  const hasMounted = useHasMounted();

  const shortAddress = hasMounted
    ? shortenAddress(address as `0x${typeof address}`)
    : address;
  const smallScreen = useMediaQuery("(max-width: 640px)");

  return (
    <div>
      {isEditing ? (
        <div className="flex gap-2 items-center">
          <div className="flex-grow">
            <p className="leading-[24px] font-light">
              {smallScreen ? shortAddress : address}
            </p>
          </div>

          {onAccountDelete && (
            <button
              className={classNames(
                isDeletable
                  ? "hover:text-red-500"
                  : "cursor-not-allowed text-gray-300",
              )}
              onClick={() => onAccountDelete(account)}
              type="button"
              disabled={!isDeletable}
              title={
                isDeletable
                  ? "Remove address"
                  : "Cannot remove the address you are currently signed in with"
              }
            >
              <Trash size={20} className="text-red-700" />
            </button>
          )}
        </div>
      ) : (
        <CopyLinkAddress
          address={address}
          link={getGnosisAddressUrl(address)}
        />
      )}
    </div>
  );
};

export default EditableAddress;
