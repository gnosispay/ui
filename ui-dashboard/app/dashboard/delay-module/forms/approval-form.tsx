"use client";

import { useForm } from "react-hook-form";
import { encodeFunctionData, getAddress, isAddress, erc20Abi } from "viem";
import Input from "@/components/inputs/input-base";
import useDelayRelay from "@/hooks/use-delay-relay";

type Inputs = {
  tokenAddress: string;
  spenderAddress: string;
  allowance: string;
};

const isValidBigInt = (data: string) => {
  try {
    BigInt(data);
  } catch {
    return false;
  }
  return true;
};

export default function ApprovalForm({ account }: { account: string }) {
  const { register, handleSubmit } = useForm<Inputs>();
  const { delayRelay } = useDelayRelay(account);

  const submit = (data: Inputs) => {
    const tokenAddress = getAddress(data.tokenAddress);
    const spenderAddress = getAddress(data.spenderAddress);
    const allowance = BigInt(data.allowance);

    try {
      delayRelay({
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          args: [spenderAddress, allowance],
          functionName: "approve",
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
          Spender Address
        </span>
      </label>
      <Input
        {...register("spenderAddress", {
          validate: (address) => isAddress(address),
        })}
      />
      <label className="flex-col justify-start items-start gap-1.5 inline-flex w-full">
        <span className="text-stone-800 text-sm font-medium font-['SF Pro Rounded'] leading-tight">
          Allowance
        </span>
      </label>
      <Input {...register("allowance", { validate: isValidBigInt })} />
      <Input
        type="submit"
        className="cursor-pointer mt-4 bg-stone-800 text-white"
      />
    </form>
  );
}
