import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import { AddressCheckStep } from "./AddressCheckStep";
import { SetPinStep } from "./SetPinStep";

enum OrderStep {
  ADDRESS_CHECK = "address-check",
  SET_PIN = "set-pin",
}

export const ExistingCardOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [currentStep, setCurrentStep] = useState<OrderStep>(OrderStep.ADDRESS_CHECK);
  const [cardToken, setCardToken] = useState<string | null>(null);

  // Step transition handlers
  const handleAddressConfirmed = useCallback((cardToken: string) => {
    setCardToken(cardToken);
    setCurrentStep(OrderStep.SET_PIN);
  }, []);

  const handleBackToAddressCheck = useCallback(() => {
    setCurrentStep(OrderStep.ADDRESS_CHECK);
    setCardToken(null);
  }, []);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <div className="text-center text-secondary">Invalid order ID</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:my-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        {currentStep === OrderStep.ADDRESS_CHECK && (
          <AddressCheckStep orderId={orderId} onNext={handleAddressConfirmed} />
        )}
        {currentStep === OrderStep.SET_PIN && <SetPinStep cardToken={cardToken} onBack={handleBackToAddressCheck} />}
      </div>
    </div>
  );
};
