import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import useCountdown from "@/hooks/use-countdown";
import Spinner from "../spinner";
import type { DelayTransactionStatus } from "@/lib/get-delay-transactions";

const MinuteCountdown = ({ targetDate }: { targetDate: Date }) => {
  // add 30 seconds to target date to be avoid sitting at 0:00
  const dateWithBuffer = new Date(targetDate);
  dateWithBuffer.setSeconds(dateWithBuffer.getSeconds() + 20);

  // Days and hours are discarded, because the countdown duration will always be between 20 seconds and 3 minutes
  const { minutes, seconds } = useCountdown(dateWithBuffer);
  if (minutes === 0 && seconds === 0) {
    return <Spinner className="w-2 h-2" />;
  }

  return (
    <span className="text-gp-text-hc font-medium inline-block min-w-[25px]">
      {minutes}:{seconds.toString().length === 1 ? `0${seconds}` : seconds}
    </span>
  );
};

const DelayStatus = ({
  status,
  readyDate,
}: {
  status: DelayTransactionStatus;
  readyDate?: string | null;
}) => {
  let statusText: string;
  switch (status) {
    case "QUEUING":
      statusText = "Queuing transaction...";
      break;
    case "WAITING":
      statusText = "Waiting in delay queue...";
      break;
    case "EXECUTING":
      statusText = "Executing transaction...";
      break;
    case "EXECUTED":
      statusText = "Transaction executed!";
      break;
    default:
      statusText = "Unknown";
      break;
  }
  return (
    <>
      {status === "WAITING" && readyDate && (
        <MinuteCountdown targetDate={new Date(readyDate)} />
      )}
      {status !== "WAITING" && status !== "EXECUTED" && (
        <Spinner className="w-2 h-2" />
      )}
      {status === "EXECUTED" && (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
      <div className="text-gray-500">{statusText}</div>
    </>
  );
};

export default DelayStatus;
