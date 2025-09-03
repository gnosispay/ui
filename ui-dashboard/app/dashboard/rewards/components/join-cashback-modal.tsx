import { useForm } from "react-hook-form";
import Link from "next/link";
import toast from "react-hot-toast";
import Dialog from "@/components/dialog";
import { GNOSIS_CASHBACK_TOS_URL } from "@/lib/constants";
import Button from "../../../../components/buttons/buttonv2";
import Spinner from "../../../../components/spinner";
import { joinCashback } from "../actions/join-cashback";

export const JoinCashbackModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<{ accepted: boolean }>();

  const onCashbackJoin = async () => {
    const joined = await joinCashback();

    if (joined === true) {
      onClose();
    } else {
      toast.error(
        joined.error ??
          "Something went wrong while opting in to Cashback program, please try again",
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl"
      absolutelyCentered
    >
      <form onSubmit={handleSubmit(onCashbackJoin)}>
        <div className="p-6 text-center space-y-8">
          <h1 className="text-xl mt-4 font-brand">Join cashback program</h1>

          <label className="flex w-full gap-4 rounded-xl bg-white-800 sm:flex-row text-left">
            <input
              type="checkbox"
              required
              {...register("accepted")}
              className="rounded-md border-low-contrast w-6 h-6"
            />
            <p>
              The cashback program is offered by an independent third party, the
              Gnosis DAO Operational Foundation. Click here to confirm you’ve
              read and accept the cashback program{" "}
              <Link
                href={GNOSIS_CASHBACK_TOS_URL}
                className="underline "
                target="_blank"
                referrerPolicy="no-referrer"
              >
                terms and conditions.
              </Link>
            </p>
          </label>

          <div className="flex flex-col flex-1">
            <Button className="py-3" disabled={isSubmitting}>
              {isSubmitting && (
                <Spinner monochromatic className="w-4 h-4 mr-2" />
              )}
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
