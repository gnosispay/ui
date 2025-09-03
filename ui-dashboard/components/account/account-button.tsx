"use client";

import classNames from "classnames";
import { useState } from "react";
import useAccountAndAvatar from "@/hooks/use-account-and-avatar";
import SignOutDialog from "../sign-out";
import SkeletonLoader from "../skeleton-loader";

const AccountButton = ({ compact }: { compact?: boolean }) => {
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const { displayName, avatar, isLoading } = useAccountAndAvatar();

  return (
    <>
      <button
        className={classNames(
          "flex items-center gap-x-4 w-full text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50",
          !compact && "px-6 py-3 h-20",
        )}
        onClick={() => setSignOutDialogOpen(true)}
      >
        {!isLoading ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt="User avatar"
              className="block w-10 h-10 rounded-lg"
            />
            <div className="text-ellipsis overflow-hidden">
              {!compact && displayName}
            </div>
          </>
        ) : (
          <>
            <SkeletonLoader className="w-10 h-10 rounded-lg" />
            {!compact && <SkeletonLoader className="w-24 h-4" />}
          </>
        )}
      </button>
      <SignOutDialog
        isOpen={signOutDialogOpen}
        handleClose={() => setSignOutDialogOpen(false)}
      />
    </>
  );
};

export default AccountButton;
