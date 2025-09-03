import { cookies } from "next/headers";
import getUser from "@/lib/get-user";
import { SideBar } from "../activation/components/sidebar";
import { TopBar } from "../activation/components/topbar";
import { OrderStepperWrapper } from "./components/order-stepper-wrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser(cookies);
  return (
    <div className="flex bg-[#FCF9F2] flex-col sm:flex-row min-h-screen">
      <TopBar>
        <OrderStepperWrapper user={user} />
      </TopBar>
      <SideBar>
        <OrderStepperWrapper user={user} />
      </SideBar>
      <div className="flex-grow overflow-auto sm:pl-64 max-w-6xl m-0 sm:m-auto flex items-center h-full w-full sm:min-h-screen">
        {children}
      </div>
    </div>
  );
}
