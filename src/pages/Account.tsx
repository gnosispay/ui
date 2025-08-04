import { useState } from "react";
import { SquareUser as UserIcon, Landmark, Gauge, Wallet, UserCog } from "lucide-react";
import {
  AccountSection,
  PersonalDetailsModal,
  UserProfileHeader,
  AccountDetailsModal,
  DailyLimitModal,
} from "@/components/account";

enum ModalType {
  NONE = "none",
  PERSONAL_DETAILS = "personalDetails",
  ACCOUNT_DETAILS = "accountDetails",
  LIMITS = "limits",
  SAFE_OWNERS = "safeOwners",
  SIGN_IN_WALLETS = "signInWallets",
}

export const AccountRoute = () => {
  const [openModal, setOpenModal] = useState<ModalType>(ModalType.NONE);
  const closeModal = () => setOpenModal(ModalType.NONE);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-8">
      <UserProfileHeader />
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Account</h2>
        <div className="space-y-3">
          <AccountSection
            icon={<UserIcon className="w-6 h-6" />}
            title="Personal details"
            onClick={() => setOpenModal(ModalType.PERSONAL_DETAILS)}
          />
          <AccountSection
            icon={<Landmark className="w-6 h-6" />}
            title="Account details"
            onClick={() => setOpenModal(ModalType.ACCOUNT_DETAILS)}
          />
          <AccountSection
            icon={<Gauge className="w-6 h-6" />}
            title="Limits"
            onClick={() => setOpenModal(ModalType.LIMITS)}
          />
        </div>
      </div>

      {/* TODO: as part of 
      - https://linear.app/gnosis-pay/issue/ENG-2930/support-showing-and-updating-the-account-owning-the-delay-relay-module
      - https://linear.app/gnosis-pay/issue/ENG-2929/support-showing-and-updating-the-siwe-accounts
      */}
      {/* Security Section */}
      {/* <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Security</h2>
        <div className="space-y-3">
          <AccountSection
            icon={<UserCog className="w-6 h-6" />}
            title="Safe owners"
            onClick={() => setOpenModal(ModalType.SAFE_OWNERS)}
          />
          <AccountSection
            icon={<Wallet className="w-6 h-6" />}
            title="Sign-in wallets"
            onClick={() => setOpenModal(ModalType.SIGN_IN_WALLETS)}
          />
        </div>
      </div> */}

      <PersonalDetailsModal
        open={openModal === ModalType.PERSONAL_DETAILS}
        onOpenChange={(open) => (open ? setOpenModal(ModalType.PERSONAL_DETAILS) : closeModal())}
      />

      <AccountDetailsModal
        open={openModal === ModalType.ACCOUNT_DETAILS}
        onOpenChange={(open) => (open ? setOpenModal(ModalType.ACCOUNT_DETAILS) : closeModal())}
      />

      <DailyLimitModal
        open={openModal === ModalType.LIMITS}
        onOpenChange={(open) => (open ? setOpenModal(ModalType.LIMITS) : closeModal())}
      />
    </div>
  );
};
