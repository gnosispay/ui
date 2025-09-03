
import Image from "next/image";
import { classNames } from "@/lib/utils";
import AccountButton from "../account/account-button";
import Badge from "../badge";
import type { NavigationItem } from ".";

export const DesktopSideBar = ({
  navigation,
}: {
  navigation: NavigationItem[];
}) => {
  return (
    <div className="flex grow flex-col gap-y-16 overflow-y-auto border-r border-gp-border bg-gp-bg-app px-6">
      <div className="flex shrink-0 items-center pt-14">
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
                      <hr className="!my-3.5 border-gray-200" />
                    )}
                    {item.href ? (
                      <a
                        href={item.href}
                        className={classNames(
                          item.current ? "text-gp-text-hc" : "text-gp-text-lc",
                          "group flex gap-x-3 rounded-md p-2 leading-6 cursor-pointer",
                        )}
                        target={item.newWindow ? "_blank" : "_self"}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-gp-icon-active"
                              : "text-icon-inactive",
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
                          item.current ? "text-gp-text-hc" : "text-gp-text-lc",
                          "group flex gap-x-3 rounded-md p-2 leading-6 cursor-pointer items-center",
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-gp-icon-active"
                              : "text-icon-inactive",
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
          <li className="-mx-6 mt-auto border-t border-gray-200">
            <AccountButton />
          </li>
        </ul>
      </nav>
    </div>
  );
};
