import { Warning } from "@phosphor-icons/react/dist/ssr";
import BaseCardWarning from "./base-card-warning";

const BlockedCardWarning = () => (
  <BaseCardWarning
    title="Your card is currently blocked"
    description="Please contact support for more information."
    icon={Warning}
  />
);

export default BlockedCardWarning;
