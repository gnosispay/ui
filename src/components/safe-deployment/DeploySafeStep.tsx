import { CheckCircle2, LoaderCircle } from "lucide-react";

export type DeploySafeStepProps = {
  setError: (err: string) => void;
};

const DeploySafeStep = (_: DeploySafeStepProps) => (
  <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
    <div className="flex flex-col items-center justify-center h-full">
      <div>
        <h2 className="text-lg font-semibold mb-4 mt-4 flex items-center">
          <CheckCircle2 className="w-10 h-10 mr-2 text-success" /> Phone verified
        </h2>
        <h2 className="text-lg font-semibold mb-4 mt-4 flex items-center">
          <LoaderCircle className="w-10 h-10 mr-2 animate-spin" /> Deploying your safe...
        </h2>
      </div>
    </div>
  </div>
);

export default DeploySafeStep;
