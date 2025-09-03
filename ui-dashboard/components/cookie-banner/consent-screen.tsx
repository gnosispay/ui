import Link from "next/link";

interface ConsentScreenProps {
  onAccept: () => void;
  manageCookies: () => void;
}
const ConsentScreen = ({ onAccept, manageCookies }: ConsentScreenProps) => (
  <>
    <p className="font-medium">🦉 Psst...</p>

    <p className="text-sm">
      We use cookies to understand how you use the product and help us improve
      it. Please accept cookies for the best experience using Gnosis Pay.{" "}
      <Link
        href="https://legal.gnosispay.com/en/articles/8646483-gnosis-pay-privacy-and-cookies-policy"
        target="_blank"
        className="underline"
      >
        Privacy and Cookies Policy.
      </Link>
    </p>

    <div className="flex flex-row space-x-0.5">
      <button
        type="button"
        onClick={onAccept}
        className="rounded-lg bg-black px-4 py-2 text-white sm:w-auto font-medium text-sm mt-1"
      >
        Accept cookies
      </button>

      <button
        type="button"
        onClick={manageCookies}
        className="px-4 py-2.5 sm:w-auto font-medium text-sm mt-1"
      >
        Manage cookies
      </button>
    </div>
  </>
);

export default ConsentScreen;
