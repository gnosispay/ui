import { StandardAlert } from "./ui/standard-alert";

export const QueueNotEmptyAlert = () => {
  return (
    <StandardAlert
      variant="destructive"
      description="Another transaction is already in the queue. Please wait for it to complete before submitting another one."
    />
  );
};
