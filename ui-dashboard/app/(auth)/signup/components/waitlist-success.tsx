import Link from "next/link";
import Button from "../../../../components/buttons/buttonv2";
import { HOMEPAGE_URL } from "../../../../lib/constants";

export const WaitlistSuccess = () => {
  return (
    <div className="p-6 text-center space-y-8">
      <h1 className="text-3xl mt-4 font-brand">{`You've joined the waitlist`}</h1>
      <p className="mt-4 text-gray-900">
        {`We’ll contact you as soon as Gnosis Pay becomes available in your country`}
      </p>
      <div className="mt-4 flex gap-3 flex-col flex-1">
        <Link href={HOMEPAGE_URL} className="flex-1 flex">
          <Button className="py-3 flex-1">Back to homepage</Button>
        </Link>
      </div>
    </div>
  );
};
