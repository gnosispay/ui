import { createPublicClient, http, isAddress } from "viem";
import { gnosis } from "viem/chains";
import {
  predictAddresses,
  createInnerAddOwnerTransaction,
  getAccountOwners,
  createInnerRemoveOwnerTransaction,
} from "@gnosispay/account-kit";
import { useEffect, useState } from "react";

import { SENTINEL_ADDRESS } from "../lib/constants";
import useDelayRelay from "./use-delay-relay";

interface UseSafeSignersParams {
  safeAddress: `0x${string}`;
  eoaAddress: `0x${string}`;
}
const useSafeSigners = ({ safeAddress, eoaAddress }: UseSafeSignersParams) => {
  const { delayRelay } = useDelayRelay(safeAddress);
  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http("/api/v1/rpc/gnosis"),
  });

  const [safeSigners, setSafeSigners] = useState<
    readonly `0x${string}`[] | null
  >(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [showAsyncAddNotice, setShowAsyncAddNotice] = useState<boolean>(false);

  const getSafeSigners = async (): Promise<readonly `0x${string}`[] | null> => {
    // Clean up any previous errors
    setError(null);

    setIsDataLoading(true);

    try {
      const { delay: delayModuleAddress } = predictAddresses(safeAddress);

      const data = await getAccountOwners((data) =>
        publicClient.call({
          to: delayModuleAddress as `0x${string}`,
          data,
        }),
      );

      setIsDataLoading(false);
      setSafeSigners(data);

      return data;
    } catch (error) {
      console.log(error);

      setError(error);
      setIsDataLoading(false);

      return null;
    }
  };

  useEffect(() => {
    getSafeSigners();
  }, []);

  interface AddSafeSignerParams {
    newSafeSigner: `0x${string}`;
  }

  const addSafeSigner = async ({
    newSafeSigner,
  }: AddSafeSignerParams): Promise<boolean> => {
    if (!isAddress(newSafeSigner)) {
      throw new Error("Specified address is not a valid Gnosis chain address");
    }

    const safeSigners = await getSafeSigners();

    const canEOASign = safeSigners?.includes(eoaAddress);
    if (!canEOASign) {
      throw new Error(
        "You need to be one of the Safe signers to execute this method",
      );
    }

    const isAlreadySigner = safeSigners?.includes(newSafeSigner);
    if (isAlreadySigner) {
      throw new Error("Specified address is already a Safe signer");
    }

    setIsSubmitting(true);

    try {
      await delayRelay(
        createInnerAddOwnerTransaction(safeAddress, newSafeSigner),
      );

      setIsSubmitting(false);
      setShowAsyncAddNotice(true);
      return true;
    } catch (error) {
      console.log(error);

      setIsSubmitting(false);

      throw error;
    }
  };

  const removeSafeSigner = async (
    accountToRemove: `0x${string}`,
  ): Promise<boolean> => {
    if (!isAddress(accountToRemove)) {
      throw new Error("Specified address is not a valid Gnosis chain address");
    }

    const safeSigners = await getSafeSigners();

    if (!safeSigners) {
      throw new Error("Could not fetch Safe signers");
    }

    if (accountToRemove === eoaAddress) {
      throw new Error("You cannot remove yourself from the Safe signers");
    }

    const canEOASign = safeSigners?.includes(eoaAddress);
    if (!canEOASign) {
      throw new Error(
        "You need to be one of the Safe signers to execute this method",
      );
    }

    const isAlreadySigner = safeSigners?.includes(accountToRemove);
    if (!isAlreadySigner) {
      throw new Error("Specified address is not a Safe signer");
    }

    const prevOwner =
      safeSigners[safeSigners.indexOf(accountToRemove) - 1] ?? SENTINEL_ADDRESS;

    setIsSubmitting(true);

    try {
      await delayRelay(
        createInnerRemoveOwnerTransaction(safeAddress, {
          prevOwner,
          ownerToRemove: accountToRemove,
        }),
      );

      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.log(error);

      setIsSubmitting(false);

      throw error;
    }
  };

  interface IsSafeSignerParams {
    address: `0x${string}`;
  }
  const isSafeSigner = async ({
    address,
  }: IsSafeSignerParams): Promise<boolean> => {
    const safeSigners = await getSafeSigners();
    return !!safeSigners?.includes(address);
  };

  return {
    safeSigners,
    refetchSafeSigners: getSafeSigners,
    addSafeSigner,
    removeSafeSigner,
    isSafeSigner,
    isDataLoading,
    isSubmitting,
    error,
    showAsyncAddNotice,
  };
};

export default useSafeSigners;
