import Button from "./buttons/button";
import type { ReactNode } from "react";

interface DialogProps {
  user: any;
  pathname?: string;
}

const NoCard = ({ user, pathname = "" }: DialogProps) => {
  const isProfile = pathname.includes("profile");
  const noCards = !user?.cards || user?.cards.length === 0;
  const noOrder =
    user?.cardOrders.filter(
      (order: any) => order.status !== "FAILEDTRANSACTION",
    ).length === 0;

  // TODO: Handle scenario where user had a card, but it's been cancelled or expired
  // need api updates to ascertain this state

  let children: ReactNode;
  let open = false;
  switch (true) {
    case noCards && noOrder:
      open = true;
      children = (
        <>
          <div className="border-b border-stone-200 p-6">
            <h2 className="text-lg">You don&apos;t have a Gnosis Card yet.</h2>
          </div>
          <div className="p-6">
            <a
              href="https://gnosispay.com/app/signup"
              target="_blank"
              rel="noreferrer"
            >
              <Button className="w-full">Order a card</Button>
            </a>
          </div>
        </>
      );
      break;
    case noCards && !noOrder:
      // only show this state not on the profile page
      open = !isProfile;
      children = (
        <>
          <div className="border-b border-stone-200 p-6">
            <h2 className="text-lg">Your card is on the way!</h2>
          </div>
          <p className="text-gp-text-lc p-6">
            You&apos;ll get activation instructions once you&apos;ve received
            your card.
          </p>
        </>
      );
      break;
    default:
      children = (
        <>
          <div className="border-b border-stone-200 p-6">
            <h2 className="text-lg">Contact support to get a new card.</h2>
          </div>
        </>
      );
  }

  if (!open) {return null;}

  return (
    <div className="z-[15] fixed inset-0">
      <div className="fixed inset-0 bg-gp-text-hc bg-opacity-10 backdrop-blur-sm" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="w-full max-w-md  overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col justify-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoCard;
