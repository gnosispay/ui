import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import CountryFlag from "@/components/country-flag";
import { getMccCategory } from "@/lib/mcc-category";
import { shortenAddress } from "@/lib/utils";
import { TransactionStatusLabel } from "./transaction-status-label";
import type { Event } from "@gnosispay/types";

interface TransactionDetailsProps {
  transaction: Event;
  isDeclined: boolean;
  isRefundOrReversal: boolean;
}

export const TransactionDetails = ({
  transaction,
  isDeclined,
  isRefundOrReversal,
}: TransactionDetailsProps) => {
  const txHash = transaction.transactions?.[0]?.hash;
  const country = transaction?.merchant?.country;

  const detailsConfig = [
    {
      label: "Status",
      value: (
        <TransactionStatusLabel
          transaction={transaction}
          isDeclined={isDeclined}
          isRefundOrReversal={isRefundOrReversal}
        />
      ),
    },
    ...(txHash
      ? [
          {
            label: "TxHash",
            value: (
              <a
                className="block w-24 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://gnosisscan.io/tx/${txHash}`}
              >
                {shortenAddress(txHash as `0x${string}`)}
                <ArrowUpRight className="inline-block mb-1" />
              </a>
            ),
          },
        ]
      : []),
    {
      label: "Category",
      value: getMccCategory({ mcc: transaction.mcc }),
    },
    ...(country
      ? [
          {
            label: "Country",
            value: (
              <>
                <CountryFlag
                  countryNumericCode={country.numeric}
                  square
                  className="rounded-full text-lg mr-0.5"
                />
                {` ${country.name}`}
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex gap-8">
      <div className="flex flex-row gap-28">
        <div className="flex flex-col text-secondary gap-3">
          {detailsConfig.map(({ label }, index) => (
            <p key={index}>{label}</p>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {detailsConfig.map(({ value }, index) => (
            <p key={index} className="font-normal text-primary pr-4">
              {value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
