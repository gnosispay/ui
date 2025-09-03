import { useState, useEffect } from "react";

export type ActivePartner = {
  name: string;
  logoPath: any;
};

const supportedPartners: ActivePartner[] = [
  {
    name: "Zerion",
    logoPath: "/static/zerion-logo.svg",
  },
];

export const useActivePartner = (): ActivePartner | undefined => {
  const [activePartner, setActivePartner] = useState<ActivePartner | undefined>(
    undefined,
  );

  useEffect(() => {
    const partner = new URLSearchParams(window.location.search).get("partner");
    const activePartner = supportedPartners.find(
      ({ name }) => name.toLowerCase() === partner?.toLowerCase(),
    );

    setActivePartner(activePartner);
  }, []);

  return activePartner;
};
