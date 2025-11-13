import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import Button from "../../../../../components/buttons/buttonv2";

export const SuccessModal = ({
  isOpen,
  onClose,
  userEmail,
  orderId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  orderId: string;
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl"
      absolutelyCentered
    >
      <div className="p-6 text-center space-y-8">
        <div className="bg-green-brand rounded-full w-16 h-16 flex items-center justify-center m-auto">
          <Check size={38} />
        </div>
        <h1 className="text-3xl mt-4 font-brand">Order successful!</h1>
        <p className="mt-4 text-gray-900">
          {`We've sent a confirmation to ${
            userEmail ?? "your email"
          } and your card is on its way!`}
        </p>
        <div className="mt-4 flex gap-3 flex-col flex-1">
          <Link href={`/order/status/${orderId}`} className="flex-1 flex">
            <Button className="py-3 flex-1">Go to order status</Button>
          </Link>
        </div>
      </div>
    </Dialog>
  );
};
