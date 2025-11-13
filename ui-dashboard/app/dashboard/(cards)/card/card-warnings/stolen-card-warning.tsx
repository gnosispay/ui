import { Warning } from "@phosphor-icons/react/dist/ssr";
import BaseCardWarning from "./base-card-warning";

const StolenCardWarning = () => (
  <BaseCardWarning
    title="Your card is marked as stolen"
    description="Your card is currently marked as stolen. Please contact us if this is incorrect."
    icon={Warning}
  />
);

export default StolenCardWarning;
