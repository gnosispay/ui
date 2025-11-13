import dynamic from "next/dynamic";
import Spinner from "@/components/spinner";
import type { WidgetProps } from "@/components/lifi-widget/widget";

const LifiWidget = dynamic<WidgetProps>(
  () =>
    import("@/components/lifi-widget/widget").then(
      (module) => module.Widget,
    ) as any,
  {
    ssr: false,
    loading: () => {
      return (
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      );
    },
  },
);

export default LifiWidget;
