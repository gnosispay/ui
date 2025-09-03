"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import classNames from "classnames";
import { useAccount } from "wagmi";
import { fetchApi } from "@/lib/api";
import SimpleSpinner from "../../../../components/simple-spinner";
import ConfirmDialog from "../../../../components/confirm-dialog";
import EditableAddress from "../../../../components/editable-address";
import AddAddress from "./add-address";
import LinkWithTooltip from "./link-with-tooltip";
import ProfileSection from "./profile-section";
import type { EoaAccount } from "@/components/editable-address";

interface AddressListProps {
  label: string;
}

const AddressList = ({ label }: AddressListProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string>();

  const { address } = useAccount();
  const queryClient = useQueryClient();

  const {
    data: accounts,
    isLoading,
    isError,
  } = useQuery<Array<EoaAccount>>({
    queryKey: ["eoaAccounts"],
    queryFn: async () => {
      const { data } = await fetchApi("/eoa-accounts");
      return data?.data.eoaAccounts;
    },
  });

  const { mutate: removeAccount } = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/eoa-accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eoaAccounts"] });
      toast.success("Address successfully removed");
      setIsEditing(false);
      setDeletingAccountId(undefined);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const addMutationFn = async (address: `0x${string}`) =>
    fetchApi(`/eoa-accounts`, {
      method: "POST",
      body: { address },
    });

  const onAccountDelete = ({ id }: { id?: string }) => {
    setDeletingAccountId(id);
  };

  const onAccountDeleteConfirm = async (id: string) => {
    removeAccount(id);
  };

  const heading = (
    <div className="flex gap-4 items-center">
      <div className="flex items-center">
        <h2 className="text-lg font-medium mr-1.5">{label}</h2>

        <LinkWithTooltip link="https://help.gnosispay.com/en/articles/9204686-manage-gnosis-pay-sign-in-wallets" />
      </div>

      {isLoading && <SimpleSpinner />}
    </div>
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
      ) : (
        <button
          className="flex gap-2 text-gp-text-lc font-medium"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          Edit
        </button>
      )}
    </>
  );

  return (
    <ProfileSection heading={heading} action={action}>
      {isError && (
        <div className="text-red-500 text-sm border py-1 px-2 rounded-md border-red-500">
          Error loading addresses
        </div>
      )}

      {accounts?.length === 0 && !isLoading && (
        <div className="text-sm text-gp-text-lc">
          You currently do not have any addresses added.
        </div>
      )}

      {accounts &&
        accounts.map((account, index) => (
          <div className={classNames(index === 0 && "mt-2")} key={account.id}>
            <EditableAddress
              isEditing={isEditing}
              account={account}
              onAccountDelete={onAccountDelete}
              isDeletable={account.address !== address}
            />

            {index !== accounts.length - 1 && <hr className="my-5" />}
          </div>
        ))}

      {(isEditing || accounts?.length === 0) && (
        <AddAddress
          onAddSuccess={() => setIsEditing(false)}
          addMutationFn={addMutationFn}
          showConfirmationModal={false}
          requiresOnchainSignature={false}
        />
      )}

      {deletingAccountId && (
        <ConfirmDialog
          isOpen
          description="This will disable the address from being used as your login address. Are you sure you want to remove this address?"
          onClose={() => setDeletingAccountId(undefined)}
          onConfirm={() => onAccountDeleteConfirm(deletingAccountId)}
        />
      )}
    </ProfileSection>
  );
};

export default AddressList;
