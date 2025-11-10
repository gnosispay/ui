import { HELP_CENTER_URL } from "@/constants";
import { StandardAlert } from "./ui/standard-alert";
import { useUnspendableAmount } from "@/hooks/useUnspendableAmount";
import { useZendesk } from "react-use-zendesk";

export const UnspendableAmountAlert = () => {
  const { unspendableFormatted, hasUnspendableAmount } = useUnspendableAmount();
  const { open } = useZendesk();

  if (!hasUnspendableAmount) {
    return null;
  }
  return (
    <StandardAlert
      className="mb-4"
      variant="destructive"
      description={
        <span>
          A deposit into your account did not pass validation check and {unspendableFormatted} are unspendable. Please{" "}
          <button type="button" className="text-muted-foreground underline cursor-pointer" onClick={open}>
            contact support
          </button>{" "}
          or{" "}
          <a
            href={HELP_CENTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline cursor-pointer"
          >
            visit our help center
          </a>{" "}
          for more info.
        </span>
      }
    />
  );
};
