export const CashbackRateProgressBar = ({ rate }: { rate: number }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="h-2 bg-tertiary rounded-full">
        <div
          className="h-full bg-green-brand rounded-full"
          style={{ width: `${Math.min(25 * rate, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm text-primary">0%</span>
          <span className="text-sm text-secondary">0 GNO</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-primary">1%</span>
          <span className="text-sm text-secondary">0.1 GNO</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-primary">2%</span>
          <span className="text-sm text-secondary">1 GNO</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-primary">3%</span>
          <span className="text-sm text-secondary">10 GNO</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-primary">4%</span>
          <span className="text-sm text-secondary">100 GNO</span>
        </div>
      </div>
    </div>
  );
};
