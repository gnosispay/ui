import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Switch } from "@headlessui/react";
import { useState } from "react";

interface ConsentScreenProps {
  goBack: () => void;
  onSubmit: (args: any) => void;
}
const ManageCookies = ({ goBack, onSubmit }: ConsentScreenProps) => {
  const [marketingCookiesEnabled, setMarketingCookiesEnabled] =
    useState<boolean>(true);

  return (
    <>
      <div className="flex flex-row items-center">
        <div className="text-left">
          <ArrowLeft
            className="text-xl hover:cursor-pointer"
            onClick={goBack}
          />
        </div>

        <div className="flex-grow text-center">
          <p className="font-medium">🍪 Cookie preferences</p>
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <p className="font-medium">Essential cookies</p>

        <p className="text-sm">
          Essential cookies help you to access the website and each of its web
          pages and sub domains, by enabling basic functions like cookie
          consent. They cannot be disabled.
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex flex-row justify-between items-center mt-2">
          <p className="font-medium">Marketing cookies</p>

          <Switch
            checked={marketingCookiesEnabled}
            onChange={setMarketingCookiesEnabled}
            className={`${
              marketingCookiesEnabled ? "bg-black" : "bg-gray-200"
            } relative inline-flex w-[55px] h-[28px] items-center rounded-full transition-colors duration-200 ease-in-out`}
          >
            <span
              className={`${
                marketingCookiesEnabled ? "translate-x-[32px]" : "translate-x-1"
              } bg-white inline-block h-[20px] w-[20px] transform rounded-full transition-transform duration-200 ease-in-out`}
            />
          </Switch>
        </div>

        <p className="text-sm">
          These cookies record your visit to our Platforms, the pages you have
          visited and the links you have followed. We will use this information
          to make our Platforms and the advertising displayed on it more
          relevant to your interests.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onSubmit({ consentGiven: marketingCookiesEnabled })}
          className="rounded-lg bg-black px-4 py-2.5 text-white sm:w-auto font-medium text-sm mt-2"
        >
          Save cookie settings
        </button>
      </div>
    </>
  );
};

export default ManageCookies;
