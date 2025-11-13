"use client";

import { RadioGroup } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAccount } from "wagmi";
import useSafeSigners from "@/hooks/use-safe-signers";

import Button from "@/components/buttons/button";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import Dialog from "@/components/dialog";
import Input from "@/components/inputs/input-base";
import SafeSignerWarning from "@/components/warnings/safe-signer-warning";
import ContinueOnWalletWarning from "@/components/continue-on-wallet-warning";
import type { SubmitHandler } from "react-hook-form";
import type { FiatCurrencySymbol } from "@gnosispay/tokens";

const PREDEFINED_LIMIT_VALUES = [0, 100, 250, 500, 1000];

interface LimitDialogProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: FiatCurrencySymbol;
  safeAddress: `0x${string}`;
  isSignatureInProgress: boolean;
}

const LimitDialog = ({
  value,
  onChange,
  isOpen,
  onClose,
  currencySymbol,
  safeAddress,
  isSignatureInProgress,
}: LimitDialogProps) => {
  const { isConnected, address: eoaAddress } = useAccount();

  const [isSigner, setIsSigner] = useState<boolean | undefined>();

  const { isSafeSigner } = useSafeSigners({
    safeAddress,
    eoaAddress: (eoaAddress || "") as `0x${string}`,
  });

  useEffect(() => {
    const checkIsSafeSigner = async () => {
      const canSign = await isSafeSigner({
        address: eoaAddress as `0x${string}`,
      });
      setIsSigner(canSign);
    };

    if (typeof isSigner === "undefined") {
      checkIsSafeSigner();
    }
  }, [eoaAddress, isSigner, isSafeSigner]);

  const hasCustomValueSpecified = useMemo(
    () => !PREDEFINED_LIMIT_VALUES.includes(value),
    [value],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    resetField,
  } = useForm({
    defaultValues: {
      customAmount: hasCustomValueSpecified ? value : "",
      selectedValue: value || "",
    },
  });

  useEffect(() => {
    if (hasCustomValueSpecified) {
      setValue("customAmount", value);
      setValue("selectedValue", "custom");
    } else {
      setValue("selectedValue", value);
    }
  }, [value, hasCustomValueSpecified, setValue]);

  const selected = watch("selectedValue", value);
  const submitDisabled =
    !!errors.customAmount ||
    !!errors.selectedValue ||
    !isSigner ||
    isSignatureInProgress;

  interface DailyLimitOption {
    label: string;
    value: number | string;
  }

  const dailyLimitOptions = useMemo(() => {
    // Start with the 'None' option (having value 0)
    const options: Array<DailyLimitOption> = [
      { label: "Disable payments", value: 0 },
    ];

    /**
     * Generate options based on predefined values, excluding
     * the first one (0) since it's already covered by 'None'
     */
    const predefinedOptions = PREDEFINED_LIMIT_VALUES.slice(1).map((value) => ({
      label: `${currencySymbol}${value}`,
      value,
    }));

    // Append the predefined options
    options.push(...predefinedOptions);

    // Add a 'Custom' option to allow user-defined limits
    options.push({ label: "Custom", value: "custom" });

    return options;
  }, [currencySymbol]);

  interface SetDailyLimitParams {
    customAmount: number | string;
    selectedValue: number | string;
  }

  const setDailyLimit: SubmitHandler<SetDailyLimitParams> = ({
    customAmount,
    selectedValue,
  }) => {
    if (!isSigner) {
      toast.error("You don't have permissions to perform this action");
      return;
    }

    const dailyLimit = selected === "custom" ? customAmount : selectedValue;
    onChange(dailyLimit as number);
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-2xl"
    >
      <form onSubmit={handleSubmit(setDailyLimit)}>
        <div className="border-b border-stone-200 p-6">
          <h3 className="text-lg">Daily spending limit</h3>
          <p className="text-gp-text-lc">
            Protect yourself and set a daily spending limit.
          </p>

          {!isSigner && <SafeSignerWarning />}
        </div>

        <div
          className={twMerge(
            "p-6",
            !isSigner && "opacity-50 pointer-events-none",
          )}
        >
          <RadioGroup
            value={selected}
            onChange={(value) => {
              setValue("selectedValue", value);
              resetField("customAmount");
            }}
            className="flex border rounded-lg border-stone-400 overflow-hidden justify-between"
          >
            {dailyLimitOptions.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option.value}
                className={({ checked }) =>
                  `${
                    checked ? "bg-gp-text-hc text-white border-r-0" : "bg-white"
                  } cursor-pointer px-4 py-2 focus:outline-none grow border-r border-stone-400 last:border-r-0 text-center`
                }
              >
                {option.label}
              </RadioGroup.Option>
            ))}
          </RadioGroup>

          {selected === "custom" && (
            <>
              <div className="mt-6 flex items-center border w-fit bg-white border-stone-300 rounded-md">
                <span className="pl-4 text-sm">{currencySymbol}</span>
                <Input
                  type="number"
                  {...register("customAmount", {
                    valueAsNumber: true,
                    required: "Enter a valid amount",
                    validate: {
                      positive: (value) =>
                        parseFloat(value.toString()) >= 0 ||
                        "Enter a positive amount",
                    },
                  })}
                  placeholder="Enter amount"
                  className="text-sm w-32 p-2 border-none bg-white !ring-transparent rounded-md text-stone-600"
                />
              </div>

              {errors.customAmount && (
                <p className="text-red-600 text-xs">
                  {errors.customAmount.message}
                </p>
              )}
            </>
          )}

          {isSignatureInProgress && (
            <ContinueOnWalletWarning containerClassNames="mt-6" />
          )}
        </div>

        <div className="border-t border-stone-200 p-6">
          {isConnected ? (
            <Button type="submit" disabled={submitDisabled}>
              Save and close
            </Button>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default LimitDialog;
