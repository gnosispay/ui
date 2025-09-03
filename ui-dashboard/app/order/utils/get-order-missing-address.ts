import type { CardOrder } from "../types";

export function getOrderMissingAddressFields(order: CardOrder): string[] {
  const fields = [
    { name: "address", value: order?.address1 },
    { name: "postal code", value: order?.postalCode },
    { name: "city", value: order?.city },
    { name: "country", value: order?.country },
  ];

  const missing = fields
    .filter((field) => !field.value)
    .map((field) => field.name);

  return missing;
}
