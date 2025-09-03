"use client";
import { RadioGroup } from "@headlessui/react";
import { createConfig, useAccount, useEnsName } from "wagmi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextAa } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { mainnet } from "viem/chains";
import { http } from "viem";
import Button from "@/components/buttons/buttonv2";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import { PERSONALIZATION_OPTIONS } from "../../../../lib/constants";
import { ENSIcon } from "../../../../components/icons/ens-icon";
import { truncateName } from "../shipping/[orderId]/lib";
import { CardPreview } from "./components/card-preview";
import { createOrder } from "./actions";

type CustomizeFormProps = {
  fullName: string | undefined;
};

const CustomizeForm = ({ fullName: name }: CustomizeFormProps) => {
  const { address, isConnected } = useAccount();
  const { push } = useRouter();

  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: mainnet.id,
    config: createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http("/api/v1/rpc/mainnet")
      }
    })
  });
  
  const [personalization, setPersonalization] =
    useState<PERSONALIZATION_OPTIONS>(PERSONALIZATION_OPTIONS.KYC);

  const personalizationOptions = {
    [PERSONALIZATION_OPTIONS.KYC]: {
      value: truncateName(name || ""),
      label: "Name",
      icon: <TextAa width="100%" height="100%" />,
      loading: false,
      emptyLabel: "No legal name set",
    },
    [PERSONALIZATION_OPTIONS.ENS]: {
      value: ensName,
      label: "ENS",
      icon: <ENSIcon />,
      loading: isLoading,
      emptyLabel: "No ENS Found",
    },
  };

  const [submitting, setSubmitting] = useState(false);

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const order = await createOrder({
        personalizationSource: personalization,
        ensName: personalizationOptions.ENS.value,
        coupon: false,
      });

      push(`/order/details/shipping/${order.id}`);
    } catch (e) {
      toast.error("Failed to submit your order, please try again");
      setSubmitting(false);
      console.log("Error creating order", e);
      return;
    }
  };

  const kycOption = personalizationOptions[PERSONALIZATION_OPTIONS.KYC];
  const ensOption = personalizationOptions[PERSONALIZATION_OPTIONS.ENS];

  return (
    <div className="flex w-full flex-col items-center gap-12 max-w-lg m-auto px-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl">Personalize your card</h1>
        <p>Select your name or personalise your card with an ENS address</p>
      </div>
      <RadioGroup
        value={personalization}
        onChange={setPersonalization}
        as="div"
        className="flex flex-wrap w-full gap-6"
      >
        <RadioGroup.Option
          key={PERSONALIZATION_OPTIONS.KYC}
          value={PERSONALIZATION_OPTIONS.KYC}
          as="div"
          disabled={!kycOption.value || kycOption.loading}
          className="flex flex-1 cursor-pointer items-center gap-4 ui-disabled:cursor-default ui-disabled:opacity-50"
        >
          <div className="relative w-full">
            <div className="flex gap-2 min-h-[48px] w-full whitespace-pre rounded-lg border-2 border-gray-300 bg-transparent px-2.5 py-3 text-base text-gray-900 ui-checked:border-gray-500">
              <div className="w-6 h-6">{kycOption.icon}</div>
              {kycOption.loading && "Loading..."}
              {!kycOption.loading &&
                (kycOption.value ? kycOption.value : kycOption.emptyLabel)}
            </div>
          </div>
        </RadioGroup.Option>
        {isConnected ? (
          <RadioGroup.Option
            key={PERSONALIZATION_OPTIONS.ENS}
            value={PERSONALIZATION_OPTIONS.ENS}
            as="div"
            disabled={!ensOption.value || ensOption.loading}
            className="flex flex-1 cursor-pointer items-center gap-4 ui-disabled:cursor-default ui-disabled:opacity-50"
          >
            <div className="relative w-full">
              <div className="flex gap-2 min-h-[48px] w-full whitespace-pre rounded-lg border-2 border-gray-300 bg-transparent px-2.5 py-3 text-base text-gray-900 ui-checked:border-gray-500">
                <div className="w-6 h-6">{ensOption.icon}</div>
                {ensOption.loading && "Loading..."}
                {!ensOption.loading &&
                  (ensOption.value ? ensOption.value : ensOption.emptyLabel)}
              </div>
            </div>
          </RadioGroup.Option>
        ) : (
          <ConnectWalletButton className="px-2.5 py-3 flex-1">
            Connect for ENS name
          </ConnectWalletButton>
        )}
      </RadioGroup>

      <CardPreview name={personalizationOptions[personalization].value} />

      <div className="flex flex-col gap-4 w-full">
        <Button
          onClick={handleCreateOrder}
          className="w-full py-4"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default CustomizeForm;
