import { friendlyFormatIBAN } from "ibantools";
import { IbanDetailsItem } from "@/components/safe-iban/components/iban-details/iban-details-item";
import ProfileSection from "../../../components/profile-section";
import LinkWithTooltip from "../../../components/link-with-tooltip";

interface IbanDetailsProps {
  name: string;
  iban: string;
  bic: string;
}
export const IbanDetails = ({ name, iban, bic }: IbanDetailsProps) => {
  return (
    <ProfileSection
      heading={
        <>
          <div className="flex gap-4 items-center">
            <div className="flex items-center">
              <h2 className="text-lg font-medium mr-1.5">IBAN</h2>

              <LinkWithTooltip
                title="The IBAN and related services are provided by Monerium EMI ehf., a third party electronic money institution authorised by the Financial Supervisory Authority of the Central Bank of Iceland."
                link="https://en.fme.is/supervision/supervised-entities/"
                classNames="w-64"
              />
            </div>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <IbanDetailsItem title="Beneficiary" value={name} />

        <IbanDetailsItem title="IBAN" value={friendlyFormatIBAN(iban)!} />

        <IbanDetailsItem title="BIC" value={bic!} dividerVisible={false} />
      </div>
    </ProfileSection>
  );
};
