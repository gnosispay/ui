import { cookies } from "next/headers";

import Intercom from "@/components/intercom";
import { getIntercomUserHash } from "@/lib/get-intercom-user-hash";
import getUser from "@/lib/get-user";

const intercomEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERCOM === "true";

type LayoutProps = {
  children: React.ReactNode;
};

const AppLayout = async ({ children }: LayoutProps) => {
  const user = await getUser(cookies);
  const intercomUserHash = await getIntercomUserHash(cookies);

  return (
    <Intercom
      userEmail={user?.email as string}
      intercomUserHash={intercomUserHash as string}
      shouldInitialize={intercomEnabled}
    >
      <div className="bg-stone-25">{children}</div>
    </Intercom>
  );
};

export default AppLayout;
