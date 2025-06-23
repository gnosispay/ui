import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

export const TransactionFetchingAlert = () => (
  <Alert variant="destructive" className="mt-4">
    <AlertCircleIcon />
    <AlertTitle>Error fetching transactions</AlertTitle>
    <AlertDescription>Please try again later.</AlertDescription>
  </Alert>
);
