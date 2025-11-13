import CardBack from "../../../../../components/card-details/card-back";

export const CardPreview = ({ name }: { name?: string | null }) => {
  return (
    <div className="w-full rounded-lg bg-green-brand flex items-center left-0 h-64 px-16 sm:px-28 pb-8 overflow-hidden">
      <div className="w-full self-end">
        <CardBack cardholderName={name} />
      </div>
    </div>
  );
};
