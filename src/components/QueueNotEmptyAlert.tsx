import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export const QueueNotEmptyAlert = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Another transaction is already in the queue. Please wait for it to complete before submitting another one.
      </AlertDescription>
    </Alert>
  );
};
