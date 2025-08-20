import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { postApiV1OrderCreate } from "@/client";
import { useUser } from "@/context/UserContext";
import { Package, MapPin } from "lucide-react";
import { useCallback, useState, useEffect, useMemo } from "react";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { StandardAlert } from "../ui/standard-alert";
import { SUPPORTED_SHIPPING_COUNTRIES } from "@/constants";

interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  country: string;
}

export const NewCardOrder = () => {
  const navigate = useNavigate();
  const { pendingPhysicalOrders, isLoading, refetch } = useOrders();
  const { user } = useUser();
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // If there are pending orders for physical cards, redirect to the first one
    // there should only be one
    if (pendingPhysicalOrders.length > 0) {
      navigate(`/card-order/${pendingPhysicalOrders[0].id}`, { replace: true });
    }
  }, [pendingPhysicalOrders, navigate, isLoading]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
  });

  // Pre-populate form with user's address data
  useEffect(() => {
    if (user) {
      setShippingAddress({
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const updateShippingField = useCallback((field: keyof ShippingAddress, value: string) => {
    setError(null);
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validation for shipping step
  const isShippingValid = useMemo(() => {
    return shippingAddress.address1 && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country;
  }, [shippingAddress]);

  const createOrder = useCallback(() => {
    if (!isShippingValid) return;

    setIsLoadingCreation(true);
    setError(null);

    const orderData = {
      personalizationSource: "KYC" as const,
      shippingAddress: {
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || null,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      virtual: false,
    };

    postApiV1OrderCreate({
      body: orderData,
    })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error creating order: ", error);
          setError(extractErrorMessage(error, "Error creating order"));
          return;
        }

        if (!data) {
          console.error("No order data returned");
          setError("Error: No order data returned");
          return;
        }

        refetch();
        navigate(`/card-order/${data.id}`, { replace: true });
      })
      .catch((error) => {
        console.error("Error creating order: ", error);
        setError(extractErrorMessage(error, "Error creating order"));
      })
      .finally(() => {
        setIsLoadingCreation(false);
      });
  }, [isShippingValid, shippingAddress, navigate, refetch]);

  return (
    <div className="grid grid-cols-6 gap-8 h-full my-4 md:px-0">
      <div className="col-span-6 md:col-span-4 md:col-start-2 px-4 sm:px-0">
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-5 w-40 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-full">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-medium text-foreground">Order Physical Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your shipping address for physical card delivery
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Form section */}
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </div>
            )}

            <div className="space-y-4">
              {/* Address Line 1 */}
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      placeholder="Street address"
                      value={shippingAddress.address1}
                      onChange={(e) => updateShippingField("address1", e.target.value)}
                    />
                  </>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={shippingAddress.address2}
                      onChange={(e) => updateShippingField("address2", e.target.value)}
                    />
                  </>
                )}
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => updateShippingField("city", e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        placeholder="Postal code"
                        value={shippingAddress.postalCode}
                        onChange={(e) => updateShippingField("postalCode", e.target.value)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={shippingAddress.country}
                      onValueChange={(value) => updateShippingField("country", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_SHIPPING_COUNTRIES.map(({ code, name }) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && !isLoading && (
            <StandardAlert
              title="Error"
              description={extractErrorMessage(error, "Error creating order")}
              variant="destructive"
            />
          )}

          <div className="flex justify-end pt-4">
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <Button
                disabled={isLoadingCreation || !isShippingValid}
                loading={isLoadingCreation}
                onClick={createOrder}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
