import { format as formatDateTime } from "date-fns";

const FormattedDateTime = ({
  date,
  format,
}: {
  date: number | Date;
  format: string;
}) => {
  return <>{formatDateTime(date, format)}</>;
};

export default FormattedDateTime;
