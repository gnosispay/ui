import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useCallback, useState, useMemo } from "react";
import { useCards } from "@/context/CardsContext";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { generateSessionKey, encryptSessionKey, generateIV, encryptSecret } from "@/utils/cryptography";
import { getApiV1UserCardPublicKey, postApiV1CardsVerify } from "@/client";

interface CardsOrderPhysicalProps {
  onClose: () => void;
  onGoBack: () => void;
}

export const LinkPhysicalCard = ({ onClose, onGoBack }: CardsOrderPhysicalProps) => {
  const [pan, setPan] = useState("");
  const [panError, setPanError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCards } = useCards();

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, ""); // Remove all non-digit characters
    value = value.replace(/\s/g, ""); // Remove all spaces
    value = value.match(/.{1,4}/g)?.join(" ") || ""; // Add spaces every 4 digits
    setPan(value);
    setPanError("");
  }, []);

  const validatePan = useCallback((value: string): boolean => {
    const numDigits = value.replace(/\s/g, "").length;
    return numDigits >= 13 && numDigits <= 16;
  }, []);

  const getFutureCardPublicKey = useCallback(async (): Promise<string> => {
    const response = await getApiV1UserCardPublicKey();

    if (response.error) {
      throw new Error(extractErrorMessage(response.error, "Failed to get card public key"));
    }

    if (!response.data) {
      throw new Error("No data returned from card public key endpoint");
    }

    return response.data.publicKey;
  }, []);

  const handleVerify = useCallback(async () => {
    const sanitizedPan = pan.replace(/\s/g, "").trim();

    if (!validatePan(pan)) {
      setPanError("Invalid card number");
      return;
    }

    setIsLoading(true);
    setPanError("");

    try {
      const publicKey = await getFutureCardPublicKey();

      // Encrypt the PAN
      const key = generateSessionKey();
      const encryptedKey = await encryptSessionKey(key, publicKey);
      const iv = generateIV();
      const encryptedPan = await encryptSecret(sanitizedPan, key, iv);

      if (!encryptedPan) {
        throw new Error("Failed to encrypt PAN");
      }

      const response = await postApiV1CardsVerify({
        body: {
          encryptedPan,
          encryptedKey,
          iv,
        },
      });

      if (response.error) {
        const errorMessage = extractErrorMessage(response.error, "Failed to verify card");
        setPanError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!response.data) {
        throw new Error("No data returned from verify endpoint");
      }

      const { cardId } = response.data;

      if (!cardId) {
        throw new Error("Failed to verify card");
      }

      toast.success("Card linked successfully");
      refreshCards();
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("Error verifying card:", error);
      const errorMessage = extractErrorMessage(error, "Failed to verify card");
      setPanError(errorMessage);
      toast.error(<CollapsedError title="Error linking card" error={error} />);
      setIsLoading(false);
    }
  }, [pan, validatePan, getFutureCardPublicKey, refreshCards, onClose]);

  const isFormValid = useMemo(() => {
    return validatePan(pan);
  }, [pan, validatePan]);

  const disableSubmit = isLoading || !isFormValid;

  return (
    <div className="space-y-4" data-testid="physical-card-link-step">
      <div className="space-y-2">
        <Label htmlFor="pan">Card number</Label>
        <Input
          id="pan"
          type="text"
          inputMode="numeric"
          value={pan}
          onChange={handleInputChange}
          placeholder="4567 1234 5678 9010"
          className={panError ? "border-destructive" : ""}
          maxLength={19} // 16 digits + 3 spaces
        />
        {panError && <StandardAlert variant="destructive" description={panError} />}
      </div>

      <DialogFooter className="justify-end">
        <Button variant="outline" onClick={onGoBack} data-testid="back-button" disabled={isLoading}>
          Back
        </Button>
        <Button disabled={disableSubmit} loading={isLoading} onClick={handleVerify} data-testid="link-card-button">
          Link Card
        </Button>
      </DialogFooter>
    </div>
  );
};
