import { fetchApi } from "@/lib/api";

export const attachTransactionHash = async ({
  orderId,
  transactionHash,
}: {
  orderId: string;
  transactionHash?: string;
}) => {
  return fetchApi(`/order/${orderId}/attach-transaction`, {
    method: "PUT",
    body: { transactionHash },
  });
};

export const confirmPayment = async ({
  orderId,
}: {
  orderId: string;
  transactionHash?: string;
}) => {
  return fetchApi(`/order/${orderId}/confirm-payment`, {
    method: "PUT",
  }).then(({ response }) => {
    if (response.ok) {
      return true;
    }
    throw new Error("Something went wrong");
  });
};
