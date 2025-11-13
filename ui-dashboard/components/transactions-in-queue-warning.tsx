"use client";

import { AccountIntegrityStatus } from "@gnosispay/account-kit";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import Button from "@/components/buttons/buttonv2";
import useAccountQuery from "@/hooks/use-account-query";
import useDelayRelay from "@/hooks/use-delay-relay";
import { useZendesk } from "@/hooks/use-zendesk";

interface TransactionsInQueueWarningProps {
  account: `0x${string}`;
}

export const TransactionsInQueueWarning = ({
  account,
}: TransactionsInQueueWarningProps) => {
  const { data: accountData, isLoading: accountLoading } =
    useAccountQuery(account);
  const { queue, isLoading: delayRelayLoading } = useDelayRelay(account);

  const { openZendeskChat } = useZendesk();


  const dataLoaded = !accountLoading && !delayRelayLoading;

  const warningVisible =
    dataLoaded &&
    accountData?.status === AccountIntegrityStatus.DelayQueueNotEmpty &&
    queue.length === 0;

  if (warningVisible) {
    return (
      <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-stone-900">
              Card Temporarily Locked
            </h3>
            <div className="mt-2 text-sm text-stone-900">
              <p>
                Your card is currently locked while pending transactions are
                being processed. You can skip these transactions to instantly
                continue normal card usage.
              </p>
            </div>

            <Button
              className="mt-2"
              onClick={() => {
                openZendeskChat();
              }}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
