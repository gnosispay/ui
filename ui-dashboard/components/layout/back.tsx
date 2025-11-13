import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import Link from "next/link";

export const Back = ({ to }: { to: string }) => {
  return (
    <Link href={to}>
      <span className="gap-2 flex">
        <CaretLeft className="w-6 h-6" /> Back
      </span>
    </Link>
  );
};
