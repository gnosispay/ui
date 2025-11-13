import { cookies } from "next/headers";

import getUser from "@/lib/get-user";


type LayoutProps = {
  children: React.ReactNode;
};

const AppLayout = async ({ children }: LayoutProps) => {
  const user = await getUser(cookies);

  return (
      <div className="bg-stone-25">{children}</div>
  );
};

export default AppLayout;
