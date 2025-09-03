import prisma from "@gnosispay/prisma";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@/auth";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";

const SignUpForm = dynamic(() => import("./components/sign-up-form"), {
  ssr: false,
});

const SignupPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const session = await auth();
  const rcc = searchParams?.["rcc"]?.toString();

  if (session?.user?.id && rcc) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (
      !existingUser?.referalCouponCode &&
      existingUser?.referrerCode !== rcc
    ) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          referalCouponCode: rcc,
        },
      });
    } else {
      console.log(`User already has this referal code ${rcc}`);
    }
  }

  return (
    <>
      <MarketingPageviewEvent event={GTM_EVENTS.PAGE_VIEWS.SIGNUP} />
      <Suspense>
        <SignUpForm />
      </Suspense>
    </>
  );
};

export default SignupPage;
