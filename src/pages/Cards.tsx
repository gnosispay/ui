import { Cards } from "@/components/cards";

export const CardsRoute = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-4 col-start-2">
        <h1 className="text-xl">Cards</h1>
      </div>
      <div className="col-span-4 col-start-2">
        <Cards />
      </div>
    </div>
  );
};
