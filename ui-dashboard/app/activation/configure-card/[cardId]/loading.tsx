const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse flex flex-col md:flex-row h-full w-full justify-around p-4 sm:p-10 md:p-24 gap-4">
    <div className="sm:hidden flex justify-center my-8">
      <div
        className="bg-gray-300 rounded-md"
        style={{ width: "106px", height: "29px" }}
      ></div>
    </div>
    <div className="flex-1 flex justify-start flex-col gap-8">
      <div className="flex items-center gap-3">
        <div
          className="bg-gray-300 rounded-full"
          style={{ width: "24px", height: "24px" }}
        ></div>
        <div
          className="bg-gray-300 rounded-md"
          style={{ width: "200px", height: "20px" }}
        ></div>
      </div>
      <div
        className="bg-gray-300 rounded-md"
        style={{ width: "100%", height: "14px" }}
      ></div>
      <div className="p-8 min-w-[306px] max-w-[500px] w-full mt-8 bg-gray-300 rounded-lg">
        <div className="h-12 bg-gray-400 rounded-md"></div>
        <div className="mt-4 h-12 bg-gray-400 rounded-md"></div>
        <div className="mt-4 h-12 bg-gray-400 rounded-md"></div>
      </div>
    </div>
    <div className="w-full md:w-1/2 h-64 bg-gray-300 rounded-lg"></div>
  </div>
);

export default LoadingSkeleton;
