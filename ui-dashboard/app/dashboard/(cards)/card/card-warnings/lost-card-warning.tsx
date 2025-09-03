import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import BaseCardWarning from "./base-card-warning";

const LostCardWarning = () => (
  <BaseCardWarning
    title="Your card is marked as lost"
    description="Your card is currently marked as lost. Please contact us if this is incorrect."
    icon={WarningCircle}
  />
);

export default LostCardWarning;
