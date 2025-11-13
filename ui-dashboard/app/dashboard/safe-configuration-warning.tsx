"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";

import useAccountQuery from "@/hooks/use-account-query";
import useAccountSetup from "@/hooks/use-account-setup";
import useHasMounted from "@/hooks/use-has-mounted";

import { useZendesk } from "@/hooks/use-zendesk";
import Button from "../../components/buttons/button";

const SafeConfigurationWarning: React.FC<{
  account: `0x${string}`;
  tokenAddress: `0x${string}`;
}> = ({ account, tokenAddress }) => {
  const { data } = useAccountQuery(account);
  const { error } = useAccountSetup(account, tokenAddress);
  const hasMounted = useHasMounted();

  const { openZendeskChat } = useZendesk();


  if (!hasMounted || !data) {
    return;
  }
  if (!hasMounted || data.status === 0) {
    return;
  }

  if (data.status === 7) {
    return;
  }

  return (
    <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
      <div className="flex">
        <div className="flex-shrink-0">
          <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-stone-900">
            Invalid Safe Configuration
          </h3>
          <div className="mt-2 text-sm text-stone-900">
            <p>
              Your Gnosis Pay Safe has a configuration that cannot be used with
              the VISA network.
            </p>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-900">
              <p>{error}</p>
            </div>
          )}

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
};

export default SafeConfigurationWarning;
