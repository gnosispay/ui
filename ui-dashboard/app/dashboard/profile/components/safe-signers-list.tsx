"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";

import classNames from "classnames";
import { useAccount } from "wagmi";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import { fetchApi } from "@/lib/api";
import ConfirmDialog from "../../../../components/confirm-dialog";
import EditableAddress from "../../../../components/editable-address";
import SimpleSpinner from "../../../../components/simple-spinner";
import useSafeSigners from "../../../../hooks/use-safe-signers";
import SuccessNotification from "../../../../components/success-notification";
import AddAddress from "./add-address";
import LinkWithTooltip from "./link-with-tooltip";
import ProfileSection from "./profile-section";
import type { EoaAccount } from "../../../../components/editable-address";

interface SafeSignersListProps {
  label: string;
  safeAddress: `0x${string}`;
}

const SafeSignersList = ({ label, safeAddress }: SafeSignersListProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSignatureInProgress, setIsSignatureInProgress] = useState(false);
  const [deletingAccountAddress, setDeletingAccountAddress] =
    useState<`0x${string}`>();

  const { address, isConnected } = useAccount();

  const {
    safeSigners,
    addSafeSigner,
    removeSafeSigner,
    isDataLoading: isLoading,
    error,
    showAsyncAddNotice,
  } = useSafeSigners({
    safeAddress,
    eoaAddress: address!,
  });

  const {
    data: eoaAccounts,
    isLoading: eoaAccountsLoading,
    isError: eoaAccountsError,
  } = useQuery<Array<EoaAccount>>({
    queryKey: ["eoaAccounts"],
    queryFn: async () => {
      const { data } = await fetchApi("/eoa-accounts");
      return data.data.eoaAccounts;
    },
  });

  const addMutationFn = async (newSafeSigner: `0x${string}`) => {
    /**
     * Add new Safe signer (triggers wallet signature request)
     */
    await addSafeSigner({ newSafeSigner });

    const eoaAddresses = eoaAccounts?.map(({ address }) => address);

    /**
     * Add a new Sign in wallet if the new Safe signer address is
     * not already a Sign in wallet for the user
     */
    if (!eoaAddresses?.includes(newSafeSigner)) {
      await fetchApi(`/eoa-accounts`, {
        method: "POST",
        body: { address: newSafeSigner },
      });
    }
  };

  const onOwnerDelete = (address: `0x${string}`) => {
    setIsSignatureInProgress(true);

    removeSafeSigner(address)
      .then(() => {
        toast.success("Address successfully submitted for removal");
        setDeletingAccountAddress(undefined);
        setIsSignatureInProgress(false);
      })
      .catch(() => {
        setDeletingAccountAddress(undefined);
        setIsSignatureInProgress(false);
      });
  };

  if (error || eoaAccountsError) {
    return null;
  }

  const heading = (
    <>
      <div className="flex gap-4 items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-medium mr-1.5">{label}</h2>

          <LinkWithTooltip link="https://help.gnosispay.com/en/articles/9204680-manage-gnosis-pay-safe-owners" />
        </div>

        {(isLoading || eoaAccountsLoading) && <SimpleSpinner />}
      </div>
    </>
  );

  const action = (
    <>
      {isEditing ? (
        <button
          className="flex gap-2 font-medium text-red-700"
          onClick={() => {
            setIsEditing(false);
          }}
        >
          Cancel
        </button>
      ) : isConnected ? (
        <button
          className="flex gap-2 text-gp-text-lc font-medium"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          Edit
        </button>
      ) : (
        <ConnectWalletButton className="flex gap-2 text-gp-text-lc font-medium bg-transparent p-0">
          Connect wallet to edit
        </ConnectWalletButton>
      )}
    </>
  );

  return (
    <ProfileSection heading={heading} action={action}>
      {!!error && (
        <div className="text-red-500 text-sm border py-1 px-2 rounded-md border-red-500">
          Error loading addresses
        </div>
      )}

      {safeSigners &&
        safeSigners.map((safeSigner, index) => (
          <div className={classNames(index === 0 && "mt-2")} key={safeSigner}>
            <EditableAddress
              isEditing={isEditing}
              account={{
                address: safeSigner,
              }}
              isDeletable={safeSigner !== address}
              onAccountDelete={({ address }) =>
                setDeletingAccountAddress(address)
              }
            />

            {index !== safeSigners.length - 1 && <hr className="my-5" />}
          </div>
        ))}

      {isEditing && (
        <AddAddress
          onAddSuccess={() => setIsEditing(false)}
          addMutationFn={addMutationFn}
          showConfirmationModal
          requiresOnchainSignature
        />
      )}

      {showAsyncAddNotice && (
        <SuccessNotification>
          <span>
            Address successfully added, but it may take a few minutes before it
            is confirmed
          </span>
        </SuccessNotification>
      )}

      {deletingAccountAddress && (
        <ConfirmDialog
          isOpen
          description="This will disable the address from being able to sign transactions in your account. Are you sure you want to remove this address?"
          onClose={() => setDeletingAccountAddress(undefined)}
          onConfirm={() => onOwnerDelete(deletingAccountAddress)}
          isSignatureInProgress={isSignatureInProgress}
        />
      )}
    </ProfileSection>
  );
};

export default SafeSignersList;
