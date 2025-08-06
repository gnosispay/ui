import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { type CurrencyInfo, MAX_DAILY_LIMIT } from "@/constants";
import { getApiV1AccountsOnchainDailyLimitTransactionData, putApiV1AccountsOnchainDailyLimit } from "@/client";
import { useUser } from "@/context/UserContext";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { populateExecuteEnqueue } from "@gnosispay/account-kit";
import { gnosis } from "viem/chains";
import { useSignTypedData } from "wagmi";

interface DailyLimitEditProps {
  initialLimit: number | null;
  currency: CurrencyInfo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DailyLimitEdit: React.FC<DailyLimitEditProps> = ({ initialLimit, currency, onCancel, onSuccess }) => {
  const { safeConfig } = useUser();
  const [newLimit, setNewLimit] = useState<string>(initialLimit?.toString() || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  const handleLimitChange = useCallback((value: string) => {
    setError(null);
    const numValue = Math.round(Number(value));

    if (numValue === 0) {
      setNewLimit("");
    } else {
      setNewLimit(numValue.toString());
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!safeConfig?.address || !currency) {
      return;
    }

    const limitNumber = Math.round(Number(newLimit));

    if (Number.isNaN(limitNumber) || limitNumber < 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (limitNumber > MAX_DAILY_LIMIT) {
      setError(`Daily limit cannot exceed ${formatDisplayAmount(MAX_DAILY_LIMIT, currency)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error, data } = await getApiV1AccountsOnchainDailyLimitTransactionData({
        query: {
          onchainDailyLimit: limitNumber.toString(),
        },
      });

      if (error) {
        setError("Failed to create transaction");
        return;
      }

      const { data: signature } = await populateExecuteEnqueue(
        { account: safeConfig.address, chainId: gnosis.id },
        data?.data?.transaction,
        signTypedDataAsync,
      );

      if (!signature) {
        setError("Failed to sign transaction");
        return;
      }

      const { error: putError } = await putApiV1AccountsOnchainDailyLimit({
        body: {
          onchainDailyLimit: limitNumber,
          signature,
        },
      });

      if (putError) {
        setError("Failed to update daily limit");
        return;
      }

      onSuccess();
    } catch (err) {
      setError("Failed to create transaction");
      console.error("Error creating transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [newLimit, currency, safeConfig?.address, signTypedDataAsync, onSuccess]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleLimitChange(e.target.value);
    },
    [handleLimitChange],
  );

  const onSetMax = useCallback(() => {
    handleLimitChange(MAX_DAILY_LIMIT.toString());
  }, [handleLimitChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="daily-limit" className="text-sm text-muted-foreground">
          Daily limit
        </label>
        <div className="relative">
          <Input
            id="daily-limit"
            type="number"
            value={newLimit}
            onChange={onChange}
            placeholder="350"
            className="text-2xl font-semibold h-16 pr-16"
            min="0"
            max={MAX_DAILY_LIMIT}
          />
          <Button
            variant="ghost"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium"
            onClick={onSetMax}
          >
            Max
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Max limit: {currency?.symbol}
        {MAX_DAILY_LIMIT.toLocaleString()}
      </div>

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
          onClick={handleSave}
          disabled={isSubmitting || !!error}
          loading={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
