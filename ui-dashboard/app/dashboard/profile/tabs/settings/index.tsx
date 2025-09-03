import AddressList from "../../components/address-list";
import LabeledData from "../../components/labeled-data";
import ProfileSection from "../../components/profile-section";
import type { Me } from "@/lib/get-user";

interface SettingsProps {
  user: Me | null;
}

const Settings = ({ user }: SettingsProps) => (
  <div className="flex flex-col gap-8">
    <AddressList label="Sign-in Wallets" />

    {user?.email && (
      <ProfileSection title="Contact Details">
        <LabeledData title="Email" value={user.email} />
      </ProfileSection>
    )}
  </div>
);

export default Settings;
