import { ShippingAddress } from "../../../../../components/shipping-address";
import type { CardOrder } from "../../../types";
import type { Me } from "../../../../../lib/get-user";

export const OrderDetails = ({
  order,
  user,
}: {
  order: CardOrder;
  user: Me | null;
}) => {
  const nameToShow =
    order.personalizationSource === "ENS" ? order.embossedName : user?.name;

  return (
    <div className="space-y-4">
      <h3 className="text-xl">Order details</h3>
      <div className="bg-white rounded-md border border-tertiary px-4 py-6 space-y-6">
        <div className="space-y-2">
          <span className="text-sm text-secondary">Name on card</span>
          <p className="text-primary">{nameToShow ?? "No name set"}</p>
        </div>
        <hr />
        <div className="space-x-2 flex">
          <ShippingAddress order={order} />
          <div className="space-y-2 flex-1">
            <span className="text-sm text-secondary">Mobile number</span>
            <p className="text-primary">{user?.phone ?? "Unknown"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
