import { SignOut } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import useAccountAndAvatar from "@/hooks/use-account-and-avatar";
import Dialog from "./dialog";
import Button from "./buttons/buttonv2";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const SignOutDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const { displayName, avatar } = useAccountAndAvatar();

  return (
    <Dialog isOpen={isOpen} handleClose={handleClose} containerClassName="p-0">
      <div className="border-b border-stone-200 p-6">
        <h3 className="text-lg">Signed in</h3>
      </div>
      <div className="p-6">
        <div className="rounded-lg bg-[#FAF8F3] flex justify-center">
          <div className="flex items-center gap-x-4 px-6 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt="User avatar"
              className="block w-10 h-10 rounded-lg"
            />
            {displayName}
          </div>
        </div>
        <p className="text-gp-text-lc mt-6">
          Signing out will require you to authenticate again in the future.
        </p>
        <Button onClick={() => signOut()} className="w-full py-4 mt-6">
          <SignOut className="text-stone-500 h-5" />
          <span className="text-stone-50">Sign out</span>
        </Button>
      </div>
    </Dialog>
  );
};

export default SignOutDialog;
