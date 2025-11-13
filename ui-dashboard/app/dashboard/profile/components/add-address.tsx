"use client";

import { isAddress } from "viem";
import { Plus } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import ConfirmDialog from "@/components/confirm-dialog";
import Button from "@/components/buttons/button";
import AddressInput from "../../../../components/address-input";

interface AddAddressProps {
  addMutationFn: (address: `0x${string}`) => Promise<any>;
  onAddSuccess: () => void;
  showConfirmationModal: boolean;
  requiresOnchainSignature: boolean;
}

const AddAddress = ({
  onAddSuccess,
  addMutationFn,
  showConfirmationModal,
  requiresOnchainSignature,
}: AddAddressProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | "">("");
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isSignatureInProgress, setIsSignatureInProgress] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: addAccount } = useMutation({
    mutationFn: addMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eoaAccounts"] });
      setIsAdding(false);
      setAddress("");
      toast.success("Address successfully added");
      onAddSuccess();
      setModalVisible(false);
      setIsSignatureInProgress(false);
    },
    onError: (error: any) => {
      setError(error.cause?.address || error.message);
      setModalVisible(false);
      setIsSignatureInProgress(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAddress(address)) {
      setError("Specified address is not a valid Gnosis chain address");
      return;
    }

    if (showConfirmationModal) {
      setModalVisible(true);
      return;
    }

    handleAddressSave();
  };

  const handleAddressSave = () => {
    if (!address) {return;}
    addAccount(address);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={modalVisible}
        title="Add account owner"
        description={
          <>
            <span className="mb-2">
              Please confirm the address below is correct. Once added the new
              owner will have full control of the account.
            </span>
            <br /> <br />
            <span className="mb-2 break-all">{address}</span>
          </>
        }
        onClose={() => {
          setModalVisible(false);
          setIsSignatureInProgress(false);
        }}
        onConfirm={() => {
          setIsSignatureInProgress(true);
          handleAddressSave();
        }}
        closingLabel="Cancel"
        confirmationLabel="Confirm"
        isSignatureInProgress={
          requiresOnchainSignature ? isSignatureInProgress : false
        }
      />

      {isAdding ? (
        <form onSubmit={handleSubmit} action="">
          <div className="flex flex-col mt-4">
            <div className="flex-grow">
              <AddressInput
                value={address}
                onChange={setAddress}
                invalid={!!error}
              />
              {error && (
                <div className="bg-red-100 px-2 py-1 text-red-900 text-xs rounded-lg">
                  {error}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button className="py-1.5 px-8">Save</Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex justify-end mt-4">
          <Button className="py-1.5 px-5" onClick={() => setIsAdding(true)}>
            <Plus />
            Add address
          </Button>
        </div>
      )}
    </>
  );
};

export default AddAddress;
