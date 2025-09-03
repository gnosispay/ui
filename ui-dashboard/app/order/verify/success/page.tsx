import { CheckCircle, Package } from "@phosphor-icons/react/dist/ssr";

const VerificationSucessPage = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-center  justify-center gap-4 rounded-3xl border-2 border-gp-green-200 bg-white-300 p-4 sm:flex-row sm:p-8 lg:rounded-xl">
        <div className="aspect-square h-fit w-fit rounded-full border-2 border-gp-green-400 bg-gp-green-50 p-3 text-gp-moss">
          <CheckCircle size="20" />
        </div>
        <h2 className="text-center text-lg font-medium tracking-tight text-gp-moss sm:text-left">
          Your information is verified.
        </h2>
      </div>
      <div className="flex flex-col items-center  justify-center gap-4 rounded-3xl border-2 border-gp-green-200 bg-white-300 p-4 sm:flex-row sm:p-8 lg:rounded-xl">
        <div className="aspect-square h-fit w-fit rotate-[25deg] rounded-full border-2 border-gp-green-400 bg-gp-green-50 p-3 text-gp-moss">
          <Package size="20" />
        </div>
        <h2 className="text-center text-lg font-medium tracking-tight text-gp-moss sm:text-left">
          We will email you when your card ships.
        </h2>
      </div>
    </div>
  );
};

export default VerificationSucessPage;
