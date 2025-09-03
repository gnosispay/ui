import { cookies } from "next/headers";
import Intercom from "@/components/intercom";
import getUser from "@/lib/get-user";
import { getIntercomUserHash } from "@/lib/get-intercom-user-hash";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser(cookies);
  const intercomUserHash = await getIntercomUserHash(cookies);

  return (
    <Intercom
      userEmail={user?.email as string}
      intercomUserHash={intercomUserHash as string}
      shouldInitialize={true}
    >
      {children}
    </Intercom>
  );
}

/**
 * Explicitly state we are using Dynamic rendering here.
 * This prevents build-time errors which are sometimes silent.
 */
export const dynamic = "force-dynamic";
