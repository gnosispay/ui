"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import LabeledData from "../../components/labeled-data";
import ProfileSection from "../../components/profile-section";
import EditPhoneDialog from "../../components/edit-phone-dialog";
import EditEmailDialog from "../../components/edit-email-dialog";
import EditProfileDialog from "../../components/edit-profile-dialog";
import SuccessNotification from "../../../../../components/success-notification";
import type { UserData } from "@/lib/get-user";

interface ProfileProps {
  userAddress: string | null;
  user: UserData | null;
}

const Profile = ({ userAddress, user }: ProfileProps) => {
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [phoneDialogVisible, setPhoneDialogVisible] = useState<boolean>(false);
  const [phoneNumberUpdatedBannerVisible, setPhoneNumberUpdatedBannerVisible] =
    useState<boolean>(false);
  const [editEmailDialogVisible, setEditEmailDialogVisible] =
    useState<boolean>(false);
  const [emailUpdatedBannerVisible, setEmailUpdatedBannerVisible] =
    useState<boolean>(false);

  const { refresh } = useRouter();

  const onPhoneNumberEdited = async () => {
    setPhoneDialogVisible(false);
    setPhoneNumberUpdatedBannerVisible(true);
    refresh();
  };

  const onEmailEdited = async () => {
    setEditEmailDialogVisible(false);
    setEmailUpdatedBannerVisible(true);
    refresh();
  };

  const phoneValue = () => {
    if (!user?.phone) {
      return "-";
    }

    return formatPhoneNumberIntl(user?.phone as string);
  };

  const residentialAddress =
    userAddress || "Unknown address -  please contact help@gnosispay.com";

  return (
    <ProfileSection
      title="Personal Information"
      action={
        <span
          className="cursor-pointer flex gap-2 text-gp-text-lc font-medium"
          onClick={() => setEditDialogVisible(true)}
        >
          Edit
        </span>
      }
    >
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <LabeledData title="Name" value={user?.name || "-"} />
          <div>
            <LabeledData
              title="Email"
              value={user?.email ?? user?.email ?? "-"}
            />
            {emailUpdatedBannerVisible && (
              <SuccessNotification>
                <span>Email updated successfully</span>
              </SuccessNotification>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <LabeledData
            classNames="whitespace-pre-line break-words"
            title="Address"
            value={residentialAddress}
          />
          <div>
            <LabeledData
              title={
                user?.phone && !user?.phoneVerified
                  ? "Phone (Unverified)"
                  : "Phone"
              }
              value={phoneValue()}
            />
            {phoneNumberUpdatedBannerVisible && (
              <SuccessNotification>
                <span>Phone number updated successfully</span>
              </SuccessNotification>
            )}
          </div>
        </div>
      </>

      <EditProfileDialog
        isOpen={editDialogVisible}
        onClose={() => {
          setEditDialogVisible(false);
        }}
        openPhoneNumberDialog={() => {
          setPhoneDialogVisible(true);
          setEditDialogVisible(false);
        }}
        openEditEmailDialog={() => {
          setPhoneDialogVisible(false);
          setEditDialogVisible(false);
          setEditEmailDialogVisible(true);
        }}
      />

      <EditPhoneDialog
        isOpen={phoneDialogVisible}
        onClose={() => {
          refresh();
          setPhoneDialogVisible(false);
        }}
        onSuccess={onPhoneNumberEdited}
        phoneNumber={phoneValue()}
      />

      <EditEmailDialog
        isOpen={editEmailDialogVisible}
        onClose={() => {
          refresh();
          setEditEmailDialogVisible(false);
        }}
        onSuccess={onEmailEdited}
      />
    </ProfileSection>
  );
};

export default Profile;
