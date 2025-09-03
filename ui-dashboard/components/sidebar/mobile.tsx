import { Fragment, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { List, X } from "@phosphor-icons/react";
import { classNames } from "@/lib/utils";
import AccountButton from "../account/account-button";
import Badge from "../badge";
import type { NavigationItem } from ".";

export const MobileSidebar = ({
  navigation,
}: {
  navigation: NavigationItem[];
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <Image
                      src="/static/logo-black.svg"
                      alt="Gnosis Pay"
                      width="106"
                      height="29"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation
                            .filter((item) => item.enabled)
                            .map((item) => (
                              <li key={item.name}>
                                {item.separateSection && (
                                  <hr className="!my-3.5 !mx-2 border-gray-200" />
                                )}
                                {item.href ? (
                                  <a
                                    href={item.href}
                                    className={classNames(
                                      item.current
                                        ? "text-gp-text-hc"
                                        : "text-gp-text-lc",
                                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                    )}
                                    target={item.newWindow ? "_blank" : "_self"}
                                  >
                                    <item.icon
                                      className={classNames(
                                        item.current
                                          ? "text-gp-icon-active"
                                          : "text-gp-icon-inactive",
                                        "h-6 w-6 shrink-0",
                                      )}
                                      aria-hidden="true"
                                    />
                                    {item.name}
                                    {item.isNew && <Badge>New</Badge>}
                                  </a>
                                ) : (
                                  <button
                                    onClick={item.onClick}
                                    className={classNames(
                                      item.current
                                        ? "text-gp-text-hc"
                                        : "text-gp-text-lc",
                                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center",
                                    )}
                                  >
                                    <item.icon
                                      className={classNames(
                                        item.current
                                          ? "text-gp-icon-active"
                                          : "text-gp-icon-inactive",
                                        "h-6 w-6 shrink-0",
                                      )}
                                      aria-hidden="true"
                                    />
                                    {item.name}
                                    {item.isNew && <Badge>New</Badge>}
                                  </button>
                                )}
                              </li>
                            ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden justify-between">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <List className="h-6 w-6" aria-hidden="true" />
        </button>
        <div>
          <span className="sr-only">Account</span>
          <AccountButton compact />
        </div>
      </div>
    </>
  );
};
