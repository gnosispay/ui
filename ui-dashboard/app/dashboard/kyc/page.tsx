import { cookies } from "next/headers";

import getUser from "@/lib/get-user";
import MainContent from "@/components/layout/main-content";
import { getSumsubAccessToken } from "@/app/order/verify/kyc/sumsub/actions";
import { KycForm } from "./form";

const KycPage = async () => {
  const user = await getUser(cookies);

  if (!user) {
    return <>Need to be logged in</>;
  }

  const sumsubAccessToken = await getSumsubAccessToken(user.id);

  return (
    <MainContent className="flex justify-center">
      <KycForm sumsubAccessToken={sumsubAccessToken as string} />
    </MainContent>
  );
};

export default KycPage;
