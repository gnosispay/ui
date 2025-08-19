import { useNavigate } from "react-router-dom";
import { usePendingCardOrders } from "@/hooks/useCardOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postApiV1OrderCreate } from "@/client";
import { useUser } from "@/context/UserContext";
import { Package, MapPin } from "lucide-react";
import { useCallback, useState, useEffect, useMemo } from "react";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { StandardAlert } from "../ui/standard-alert";

// Common countries for shipping - can be expanded based on supported regions
const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "LU", name: "Luxembourg" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
];

interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  country: string;
}

export const NewCardOrder = () => {
  const navigate = useNavigate();
  const { pendingOrders, isLoading } = usePendingCardOrders();
  const { user } = useUser();
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing pending orders and redirect if found
  useEffect(() => {
    if (isLoading) return;

    // If there are pending orders, redirect to the first one
    if (pendingOrders.length > 0) {
      navigate(`/card-order/${pendingOrders[0].id}`, { replace: true });
    }
  }, [pendingOrders, navigate, isLoading]);

  // Initialize shipping address with user's KYC address
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

  // Create order (Step 1 -> Step 2)
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

        navigate(`/card-order/${data.id}`, { replace: true });
      })
      .catch((error) => {
        console.error("Error creating order: ", error);
        setError(extractErrorMessage(error, "Error creating order"));
      })
      .finally(() => {
        setIsLoadingCreation(false);
      });
  }, [isShippingValid, shippingAddress, navigate]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-8 h-full mt-4 md:px-0">
        <div className="col-span-6 md:col-span-4 md:col-start-2 px-4 sm:px-0">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-8 h-full mt-4 md:px-0">
      <div className="col-span-6 md:col-span-4 md:col-start-2 px-4 sm:px-0">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-medium text-foreground">Order Physical Card</h3>
              <p className="text-sm text-muted-foreground">Enter your shipping address for physical card delivery</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  placeholder="Street address"
                  value={shippingAddress.address1}
                  onChange={(e) => updateShippingField("address1", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={shippingAddress.address2}
                  onChange={(e) => updateShippingField("address2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => updateShippingField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    placeholder="Postal code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => updateShippingField("postalCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={shippingAddress.country}
                  onValueChange={(value) => updateShippingField("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error && (
            <StandardAlert
              title="Error"
              description={extractErrorMessage(error, "Error creating order")}
              variant="destructive"
            />
          )}

          <div className="flex justify-end pt-4">
            <Button disabled={isLoadingCreation || !isShippingValid} loading={isLoadingCreation} onClick={createOrder}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
