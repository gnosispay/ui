import { findCountry } from "@gnosispay/countries";
import type { CardOrder } from "../app/order/types";

export const ShippingAddress = ({ order }: { order: CardOrder }) => {
  return (
    <div className="space-y-2 flex-1">
      <span className="text-sm text-secondary">Shipping address</span>
      <div className="text-primary">
        {[
          order.address1,
          order.address2,
          order.postalCode,
          order.city,
          order.country && findCountry(order.country)?.name,
        ]
          .filter(Boolean)
          .map((line, idx) => (
            <p key={idx}>
              {line}
              <br />
            </p>
          ))}
      </div>
    </div>
  );
};
