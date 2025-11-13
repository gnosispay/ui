import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import BaseCardWarning from "../../dashboard/(cards)/card/card-warnings/base-card-warning";

const MissingAddressFieldWarning = ({
  missingFields,
}: {
  missingFields: string[];
}) => {
  const missingFieldsString = missingFields.join(", ");
  return (
    <BaseCardWarning
      title="Missing address details"
      description={`Please fill in the following address fields to continue: ${missingFieldsString}`}
      icon={WarningCircle}
    />
  );
};

export default MissingAddressFieldWarning;
