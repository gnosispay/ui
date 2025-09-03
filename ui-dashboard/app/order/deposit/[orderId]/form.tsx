"use client";
import { useAccount, useBalance, useBlockNumber, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { BaseError, UserRejectedRequestError, erc20Abi } from "viem";
import {
  waitForTransactionReceipt,
  writeContract,
  simulateContract,
} from "@wagmi/core";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { fetchApi, getAPISession } from "@/lib/api";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import { triggerEvent as triggerGTMEvent, GTM_EVENTS } from "@/lib/gtm";
import { PAYMENT_CHAIN_ID } from "@/app/activation/lib/constants";
import { TitleSubtitle } from "@/components/layout/title-subtitle";
import { OrderDetails } from "./components/order-details";
import { Summary } from "./components/summary";
import { WalletDetails } from "./components/wallet-details";
import { attachTransactionHash, confirmPayment } from "./api";
import { getTotalPriceEther, getTotalPriceEUR } from "./utils/price";
import type { Me } from "@/lib/get-user";
import type { CardOrder } from "../../types";

const PAYMENT_TOKEN_ADDRESS = "0xcB444e90D8198415266c6a2724b7900fb12FC56E"; // EURe on Gnosis Chain
const PAYMENT_RECIPIENT_ADDRESS = process.env
  .NEXT_PUBLIC_ORDER_DEPOSIT_ADDRESS as `0x${string}`;

const OrderDepositForm = ({
  orderId,
  user,
}: {
  orderId: string;
  user: Me | null;
}) => {
  const { address: account, chain } = useAccount();
  const { push } = useRouter();

  const [info, setInfo] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const { switchChain } = useSwitchChain();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const queryClient = useQueryClient();

  const isBrazilPilotEnabled = useFeatureFlagEnabled("brazil-cards-pilot");
  const posthogFeatureFlagsInitialized =
    typeof isBrazilPilotEnabled !== "undefined";

  const { data: order, isLoading } = useQuery<CardOrder>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await fetchApi(`/order/${orderId}`);
      return data;
    },
  });

  if (
    !isLoading &&
    ["READY", "CARDCREATED"].includes(order?.status as string)
  ) {
    push("/order/details/customize");
  }

  const {
    data: userEUReBalance,
    isFetched: isUserEUReBalanceFetched,
    queryKey: queryKeyEURE,
  } = useBalance({
    address: account,
    chainId: PAYMENT_CHAIN_ID,
    token: PAYMENT_TOKEN_ADDRESS,
  });

  const {
    data: userXDAIBalance,
    isFetched: isUserXDAIBalanceFetched,
    queryKey: queryKeyXDAI,
  } = useBalance({
    address: account,
    chainId: PAYMENT_CHAIN_ID,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeyEURE });
    queryClient.invalidateQueries({ queryKey: queryKeyXDAI });
  }, [blockNumber, queryClient, queryKeyEURE, queryKeyXDAI]);

  const onOrderSuccess = useCallback(() => {
    if (
      posthogFeatureFlagsInitialized &&
      isBrazilPilotEnabled &&
      user?.country === "BR"
    ) {
      push(`/order/status/${orderId}`);
    } else {
      push(`/order/pin/${orderId}`);
    }
  }, [
    push,
    orderId,
    user?.country,
    posthogFeatureFlagsInitialized,
    isBrazilPilotEnabled,
  ]);

  const checkTransaction = useCallback(
    async (retryCount = 0) => {
      setIsExecuting(true);
      if (retryCount > 0) {
        setInfo(
          "Waiting for confirmation, this may take a couple of seconds...",
        );
      } else {
        setInfo("Waiting for confirmation");
      }

      const hash = order?.transactionHash as `0x${string}`;

      try {
        await waitForTransactionReceipt(wagmiConfig, {
          hash,
          chainId: PAYMENT_CHAIN_ID,
          timeout: 5000,
        });

        await confirmPayment({
          orderId,
        });
      } catch (e) {
        console.log("Could not confirm the payment, retrying in 5s");
        setTimeout(() => checkTransaction(retryCount + 1), 5000);
        return;
      }

      setInfo("Transaction confirmed");

      setIsExecuting(false);

      /**
       * Trigger order complete GTM event
       */
      triggerGTMEvent(GTM_EVENTS.ACTIONS.ORDER_COMPLETE);

      onOrderSuccess();
    },
    [onOrderSuccess, order?.transactionHash, orderId],
  );

  useEffect(() => {
    if (order?.transactionHash) {
      checkTransaction();
    }
  }, [orderId, order?.transactionHash, checkTransaction]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const totalPriceEUR = getTotalPriceEUR(order);
  const totalPriceEther = getTotalPriceEther(totalPriceEUR.toString());

  const userHasEnoughFunds =
    userEUReBalance && userEUReBalance.value >= totalPriceEther;

  const cardIsFree = order.totalAmountEUR === order.totalDiscountEUR;
  const canClickOrder = (cardIsFree || userHasEnoughFunds) && !isExecuting;

  const onOrder = async () => {
    try {
      setIsExecuting(true);

      const session = await getAPISession();
      if (!session) {
        setInfo("You need to be signed in.");

        /**
         * We perform a full page reload so SIWE can pick up a new state correctly.
         * (e.g. whether to show sign in or connect wallet action, etc.)
         */
        window.location.reload();

        return;
      }

      if (cardIsFree) {
        await confirmPayment({
          orderId,
        });

        /**
         * Trigger order complete GTM event
         */
        triggerGTMEvent(GTM_EVENTS.ACTIONS.ORDER_COMPLETE);

        onOrderSuccess();

        return;
      }

      if (chain?.id !== PAYMENT_CHAIN_ID) {
        setInfo("Please switch to Gnosis Chain.");
        switchChain({ chainId: PAYMENT_CHAIN_ID });
      }

      setInfo("Please sign the transaction.");

      const { request } = await simulateContract(wagmiConfig, {
        chainId: PAYMENT_CHAIN_ID,
        address: PAYMENT_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [PAYMENT_RECIPIENT_ADDRESS, totalPriceEther],
      });

      const hash = await writeContract(wagmiConfig, request);

      await attachTransactionHash({
        orderId,
        transactionHash: hash,
      });

      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    } catch (err) {
      console.error(err);
      const isUserRejectionError =
        err instanceof BaseError &&
        err.walk((e) => e instanceof UserRejectedRequestError);
      if (isUserRejectionError) {
        setInfo(
          "Transaction was not sent. Your funds are still in your wallet.",
        );
        setIsExecuting(false);
        return;
      }
      setInfo(`${err}`);
      setIsExecuting(false);
      throw err;
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col justify-between gap-8 my-24">
      <TitleSubtitle title="Checkout" />
      <div className="flex-col md:flex-row space-y-6 flex md:space-x-6 px-4 lg:px-0">
        <div className="flex-1 space-y-6">
          <OrderDetails order={order} user={user} />
          {isUserEUReBalanceFetched && isUserXDAIBalanceFetched && (
            <WalletDetails
              userEUReBalance={userEUReBalance}
              userXDAIBalance={userXDAIBalance}
              userHasEnoughFunds={userHasEnoughFunds}
              user={user}
            />
          )}
        </div>
        <div className="md:w-[20rem] w-full">
          <Summary
            paymentStatus={info}
            canClickOrder={canClickOrder}
            onOrder={onOrder}
            isExecuting={isExecuting}
            cardOrder={order}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDepositForm;
