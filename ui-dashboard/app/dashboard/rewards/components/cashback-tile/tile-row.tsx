import type { ReactNode } from "react";

export const TileRow = ({
  label,
  value,
  subvalue,
}: {
  label: ReactNode;
  value: ReactNode;
  subvalue?: ReactNode;
}) => (
  <div className="flex justify-between">
    <div>{label}</div>
    <div className="flex flex-col text-right">
      <div>{value}</div>
      {subvalue && <div className="text-sm text-secondary">{subvalue}</div>}
    </div>
  </div>
);
