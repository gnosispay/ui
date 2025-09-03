"use client";

import { Camera, IdentificationBadge, MapPin } from "@phosphor-icons/react";

const steps = [
  {
    title: "Proof of address",
    description:
      "A document (e.g. bank statement, utility bill) containing your full name, address, issued within the last 3 months",
    Icon: MapPin,
  },
  {
    title: "Proof of identity",
    description: "Upload or take a photo of your Passport or National ID",
    Icon: IdentificationBadge,
  },
  {
    title: "Take a selfie",
    description: "A live photo of you to prove you are a real person",
    Icon: Camera,
  },
];

export const Instructions = () => {
  return (
    <div className="space-y-6 bg-white p-4 rounded-md py-6 px-4 shadow-black/5 shadow-md">
      {steps.map((step) => {
        const { Icon, title, description } = step;
        return (
          <div key={title} className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-warning" />
            </div>
            <div className="ml-3 -mt-1">
              <p className="text-base text-primary">{title}</p>
              <p className="text-sm text-secondary">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
