export const NoSafeWarning = () => {
  return (
    <div className="bg-gray-100 relative p-4 flex gap-3 rounded-2xl">
      <div>
        <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
          No Configured Gnosis Pay Safe
        </h2>
        <div className="text-stone-600 mt-2 text-sm">
          {
            "It looks like your account still doesn't have a Gnosis Pay Safe configured. Please complete your order and card activation to finish up the Gnosis Pay Safe configuration."
          }
        </div>
      </div>
    </div>
  );
};
