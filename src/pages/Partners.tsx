import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import MetriLogo from "@/assets/partners-logos/metri.svg";
import ZealLogo from "@/assets/partners-logos/zeal.png";
import PicnicLogo from "@/assets/partners-logos/picnic.png";
import GreenhoodLogo from "@/assets/partners-logos/greenhood.svg";
import RebindLogo from "@/assets/partners-logos/rebind.png";

interface PartnerApp {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoAlt: string;
  url: string;
}

const partnerApps: PartnerApp[] = [
  {
    id: "metri",
    name: "Metri",
    description: "The simple, powerful wallet built by Gnosis for the Circles economy and beyond",
    logo: MetriLogo,
    logoAlt: "Metri logo",
    url: "https://app.metri.xyz/",
  },
  {
    id: "zeal",
    name: "Zeal Wallet",
    description: "Earn every second and spend globally with a Visa debit card",
    logo: ZealLogo,
    logoAlt: "Zeal Wallet logo",
    url: "https://www.zeal.app/",
  },
  {
    id: "picnic",
    name: "Picnic",
    description: "More freedom for you and your money",
    logo: PicnicLogo,
    logoAlt: "Picnic logo",
    url: "https://usepicnic.com/",
  },
  {
    id: "greenhood",
    name: "Greenhood",
    description: "Discover a new world of secure and easy payments with the Greenhood wallet.",
    logo: GreenhoodLogo,
    logoAlt: "Greenhood logo",
    url: "https://www.greenhoodwallet.com",
  },
  {
    id: "rebind",
    name: "Rebind",
    description: "Onramp for free. Earn across chains & protocols. Spend without fees.",
    logo: RebindLogo,
    logoAlt: "Rebind logo",
    url: "https://rebind.co/",
  },
];

export const Partners = () => {
  const handleGetApp = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-6 gap-4 h-full">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="mx-4 lg:mx-0 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Apps</h1>
              <p className="text-muted-foreground">
                For the best Gnosis Pay experience we recommend downloading one of our partner apps
              </p>
            </div>

            {/* Partner Apps Grid */}
            <div className="space-y-4 bg-card rounded-lg p-4">
              {partnerApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    {/* App Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 border border-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img src={app.logo} alt={app.logoAlt} className="object-contain" />
                      </div>
                    </div>

                    {/* App Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{app.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
                    </div>
                  </div>

                  {/* Get Button */}
                  <div className="flex-shrink-0 ml-4">
                    <Button
                      onClick={() => handleGetApp(app.url)}
                      className="bg-button-bg hover:bg-button-bg-hover text-button-black font-medium px-6"
                    >
                      Get
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PartnersRoute = Partners;
