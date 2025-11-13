import { cookies } from "next/headers";
import getUser from "@/lib/get-user";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser(cookies);

  return (
      {children}
  );
}

/**
 * Explicitly state we are using Dynamic rendering here.
 * This prevents build-time errors which are sometimes silent.
 */
export const dynamic = "force-dynamic";
