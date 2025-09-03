export const InfraOutageWarning = () => {
  return (
    <div className="bg-gray-100 relative p-4 rounded-md flex gap-3 border-gp-border border">
      <div className="">
        <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold ">
          Infrastructure Outage
        </h2>
        <div className="text-stone-600 mt-2 text-sm">
          {`We are currently experiencing an infrastructure outage. We will communicate the status as soon as possible.
          Your funds are still under your control, you can withdraw them as usual using the button bellow
          `}
        </div>
      </div>
    </div>
  );
};
