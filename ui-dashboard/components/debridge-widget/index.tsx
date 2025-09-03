import dynamic from "next/dynamic";
import Spinner from "@/components/spinner";

export const DebridgeWidget = dynamic(
  () => import("./widget").then((mod) => mod.DebridgeWidget),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    ),
  },
);
