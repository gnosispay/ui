import { Warning } from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";

interface SafeSignerWarningProps {
  textSize?: string;
}
const SafeSignerWarning = ({
  textSize = "text-sm",
}: SafeSignerWarningProps) => (
  <div className="rounded-lg bg-amber-50 p-4 mt-4 border border-amber-100">
    <div className="flex">
      <div className="flex-shrink-0">
        <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <h3 className={twMerge(textSize, "font-medium text-stone-900")}>
          The wallet you&apos;re currently signed in with lacks the necessary
          permissions to perform actions on your Gnosis Pay Safe. Please switch
          to an account with the appropriate permissions to continue with this
          action.
        </h3>
      </div>
    </div>
  </div>
);

export default SafeSignerWarning;
