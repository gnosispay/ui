"use client";

import { useForm } from "react-hook-form";
import { encodeFunctionData, getAddress, isAddress, erc20Abi } from "viem";
import Input from "@/components/inputs/input-base";
import useDelayRelay from "@/hooks/use-delay-relay";

type Inputs = {
  tokenAddress: string;
  toAddress: string;
  amount: string;
};

const isValidBigInt = (data: string) => {
  try {
    BigInt(data);
  } catch {
    return false;
  }
  return true;
};

export default function TransferForm({ account }: { account: string }) {
  const { register, handleSubmit } = useForm<Inputs>();
  const { delayRelay } = useDelayRelay(account);

  const submit = (data: Inputs) => {
    const tokenAddress = getAddress(data.tokenAddress);
    const toAddress = getAddress(data.toAddress);
    const amount = BigInt(data.amount);

    try {
      delayRelay({
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          args: [toAddress, amount],
          functionName: "transfer",
        }),
        value: 0,
      });
    } catch (e) {}
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <label className="flex-col justify-start items-start gap-1.5 inline-flex w-full">
        <span className="text-stone-800 text-sm font-medium font-['SF Pro Rounded'] leading-tight">
          Token Address
        </span>
      </label>
      <Input
        {...register("tokenAddress", {
          validate: (address) => isAddress(address),
        })}
      />
      <label className="flex-col justify-start items-start gap-1.5 inline-flex w-full">
        <span className="text-stone-800 text-sm font-medium font-['SF Pro Rounded'] leading-tight">
          To Address
        </span>
      </label>
      <Input
        {...register("toAddress", {
          validate: (address) => isAddress(address),
        })}
      />
      <label className="flex-col justify-start items-start gap-1.5 inline-flex w-full">
        <span className="text-stone-800 text-sm font-medium font-['SF Pro Rounded'] leading-tight">
          Amount
        </span>
      </label>
      <Input {...register("amount", { validate: isValidBigInt })} />
      <Input
        type="submit"
        className="cursor-pointer mt-4 bg-stone-800 text-white"
      />
    </form>
  );
}
