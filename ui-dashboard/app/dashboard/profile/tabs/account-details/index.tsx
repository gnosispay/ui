import { CopyLinkAddress } from "@/components/copy-link-data";
import { getGnosisAddressUrl } from "@/lib/constants";
import SafeSignersList from "../../components/safe-signers-list";
import ProfileSection from "../../components/profile-section";
import { NoSafeWarning } from "../../components/no-safe-warning";
import { SafeIban } from "./safe-iban";

interface AccountDetailsProps {
  safeAddress?: `0x${string}`;
  name?: string | undefined;
  ibanAvailable: boolean;
}
const AccountDetails = ({
  safeAddress,
  name,
  ibanAvailable,
}: AccountDetailsProps) => {
  return (
    <>
      {safeAddress ? (
        <div className="flex flex-col gap-8">
          <SafeSignersList label="Account Owners" safeAddress={safeAddress} />

          <ProfileSection title="Gnosis Pay Safe">
            <CopyLinkAddress
              address={safeAddress}
              link={getGnosisAddressUrl(safeAddress)}
            />
          </ProfileSection>

          {ibanAvailable && <SafeIban safeAddress={safeAddress} name={name} />}
        </div>
      ) : (
        <NoSafeWarning />
      )}
    </>
  );
};

export default AccountDetails;
