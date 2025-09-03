import { Check } from "@phosphor-icons/react";
import React from "react";

interface SuccessNotificationProps {
  children: React.ReactNode;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  children,
}) => {
  return (
    <div className="text-gp-text-hc bg-green-100 text-sm border py-3 px-2 rounded-md border-green-400 flex items-center mt-4">
      <Check className="mr-2 text-xl text-green-900" height={20} />
      {children}
    </div>
  );
};

export default SuccessNotification;
