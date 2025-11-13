interface LabeledDataProps {
  title: string;
  value?: string;
  classNames?: string;
}

const LabeledData = ({ title, value, classNames }: LabeledDataProps) => (
  <div>
    <p className="mb-2 text-gp-text-lc text-sm">{title}</p>

    <p className={classNames ?? ""}>{value ?? ""}</p>
  </div>
);

export default LabeledData;
