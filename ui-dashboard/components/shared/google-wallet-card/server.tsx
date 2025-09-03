import prisma from "@gnosispay/prisma";
import { TokenSymbol } from "@gnosispay/prisma/client";
import { isEEA } from "@gnosispay/countries";
import { auth } from "@/auth";

export async function getGoogleWalletCardData() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: {
      SafeAccount: true,
    },
  });

  const isEligible =
    user?.SafeAccount[0]?.tokenSymbol === TokenSymbol.EURe &&
    user?.country &&
    isEEA(user?.country);

  return { isEligible };
} 