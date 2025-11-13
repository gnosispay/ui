"use client";

import {
  CreditCard,
  ListBullets,
  User,
  Question,
  Gift,
} from "@phosphor-icons/react";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile";
import { DesktopSideBar } from "./desktop";

type IconType = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref">
>;

export type NavigationItem = {
  name: string;
  href?: string;
  onClick?: () => void;
  icon: IconType;
  current?: boolean;
  newWindow?: boolean;
  separateSection?: boolean;
  enabled?: boolean;
  isNew?: boolean;
};

const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Transactions",
      href: "/dashboard",
      icon: ListBullets,
      current: false,
      enabled: true,
    },
    {
      name: "Card details",
      href: "/dashboard/card",
      icon: CreditCard,
      current: false,
      enabled: true,
    },
    {
      name: "Account",
      href: "/dashboard/profile",
      icon: User,
      current: false,
      enabled: true,
    },
    {
      name: "Rewards",
      href: "/dashboard/rewards",
      icon: Gift,
      current: false,
      isNew: true,
      enabled: true,
    },
    {
      name: "Help center",
      href: "https://help.gnosispay.com/",
      icon: Question,
      current: false,
      newWindow: true,
      enabled: true,
    },
  ].map((item) => {
    item.current = item.href === pathname;
    return item;
  });

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-72 lg:flex-col">
        <DesktopSideBar navigation={navigation} />
      </div>
      <MobileSidebar navigation={navigation} />
    </>
  );
};

export default Sidebar;
