import { X } from "@phosphor-icons/react/dist/ssr";
import { Fragment } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { classNames } from "../lib/utils";

interface DialogProps {
  isOpen: boolean;
  handleClose?: () => void;
  children: React.ReactNode;
  closeable?: boolean;
  backgroundColor?: string;
  zIndex?: number;
  containerClassName?: string;
  absolutelyCentered?: boolean;
}

const Dialog = ({
  isOpen,
  handleClose = () => {},
  closeable = true,
  children,
  containerClassName,
  backgroundColor = "white",
  zIndex = 20,
  absolutelyCentered,
}: DialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <HeadlessDialog
        onClose={handleClose}
        as="div"
        className={`relative`}
        style={{ zIndex }}
      >
        {" "}
        {/* TODO: remove style, custom tailwind css was not working :shrug: */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gp-text-hc bg-opacity-25" />
        </Transition.Child>
        <div
          className={classNames(
            "fixed inset-0 overflow-y-auto",
            !absolutelyCentered && "lg:pl-72",
          )}
        >
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={twMerge(
                  `w-full max-w-lg transform rounded-2xl bg-${backgroundColor} p-6 text-left align-middle shadow-xl transition-all`,
                  containerClassName,
                )}
              >
                {closeable && (
                  <button
                    onClick={handleClose}
                    className="absolute top-7 right-6 z-50"
                  >
                    <X size={20} />
                  </button>
                )}
                {children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

export default Dialog;
