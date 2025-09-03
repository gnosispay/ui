import { useForm } from "react-hook-form";
import { useState } from "react";
import Dialog from "@/components/dialog";
import Button from "../../../../components/buttons/buttonv2";
import { joinWaitlist } from "../actions/join-waitlist";
import Spinner from "../../../../components/spinner";
import { WaitlistSuccess } from "./waitlist-success";
import type { WaitlistFormValues } from "../actions/join-waitlist";
import type { CountryOption } from "../../../../components/country-picker";

export const WaitlistModal = ({
  isOpen,
  onClose,
  selectedCountry,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: CountryOption;
  email: string;
}) => {
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<WaitlistFormValues>();

  const onWaitlistJoin = async (values: WaitlistFormValues) => {
    try {
      await joinWaitlist(values, selectedCountry.alpha2);
      setIsJoinSuccess(true);
    } catch (e) {
      console.log("Failed to join the waitlist", e);
    }
  };

  if (!selectedCountry) {
    return null;
  }

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl"
      absolutelyCentered
    >
      {isJoinSuccess ? (
        <WaitlistSuccess />
      ) : (
        <form onSubmit={handleSubmit(onWaitlistJoin)}>
          <div className="p-6 text-center space-y-8">
            <h1 className="text-3xl mt-4 font-brand">{`We'll be in ${selectedCountry.name} soon`}</h1>

            <p className="mt-4 text-gray-900">
              {`We're sorry but Gnosis Pay is not available in ${selectedCountry.name} yet. Join the
          waitlist and we'll let you know as soon as it becomes available in
          your area. Stay tuned!`}
            </p>

            <div className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-sm">First name</label>
                <input
                  type="text"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg"
                  placeholder="First name"
                  {...register("firstName")}
                />
              </div>

              <div className="text-left space-y-2">
                <label className="text-sm">Last name</label>
                <input
                  type="text"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg"
                  placeholder="Last name"
                  {...register("lastName")}
                />
              </div>

              <div className="text-left space-y-2">
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg"
                  placeholder="Email"
                  defaultValue={email}
                  required
                  {...register("email")}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3 flex-col flex-1">
              <Button className="py-3" disabled={isSubmitting}>
                {isSubmitting && (
                  <Spinner monochromatic className="w-4 h-4 mr-2" />
                )}
                Join waitlist
              </Button>
              <Button
                className="bg-white text-stone-900 border-stone-900 border focus:border-stone-900 py-3"
                onClick={onClose}
              >
                Select a different country
              </Button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
};
