import makeBlockie from "ethereum-blockies-base64";
import type { Types } from "connectkit";

const AccountAvatar = ({
  address,
  ensImage,
  ensName,
}: Types.CustomAvatarProps) => {
  const blockie = address && makeBlockie(address);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ensImage || blockie}
        alt={ensName ?? address}
        width="100%"
        height="100%"
      />
    </>
  );
};

export default AccountAvatar;
