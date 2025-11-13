"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSIWE } from "connectkit";
import Dialog from "./dialog";

export default function DeactivatedAccountDialog() {
  const router = useRouter();
  const { data: session } = useSession();
  const status = session?.user.status;
  const [isOpen, setIsOpen] = useState(false);
  const { signOut: siweSignOut, isSignedIn } = useSIWE();

  useEffect(() => {
    if (status === "DEACTIVATED") {
      setIsOpen(true);
    }
  }, [status]);

  const handleClose = async () => {
    if (isSignedIn) {
      await siweSignOut();
    }
    await signOut({ redirect: false });
    router.refresh();
    setIsOpen(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={handleClose}
      absolutelyCentered
      containerClassName="max-w-md"
      zIndex={50}
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-destructive">
          Account Deactivated
        </h2>
        <div className="space-y-2">
          <p>Your account has been deactivated.</p>
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake or would like to reactivate your
            account, please contact our support team.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
