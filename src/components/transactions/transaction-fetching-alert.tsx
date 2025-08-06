import { StandardAlert } from "../ui/standard-alert";

export const TransactionFetchingAlert = () => (
  <StandardAlert
    variant="destructive"
    title="Error fetching transactions"
    description="Please try again later."
    className="mt-4"
  />
);
