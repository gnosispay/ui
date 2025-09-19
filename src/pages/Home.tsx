import { Cards } from "../components/cards";
import { Balances } from "@/components/balances";
import { AddFundsModal } from "@/components/modals/add-funds/add-funds";
import { SendFundsModal } from "@/components/modals/send-funds/send-funds";
import { Transactions } from "@/components/transactions/transactions";
import { PendingCardOrder } from "@/components/pending-card-order";
import { Rewards } from "@/components/rewards";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { StatusHelpIcon } from "@/components/ui/status-help-icon";
import { PartnerBanner } from "@/components/ui/partner-banner";
import { UnspendableAmountAlert } from "@/components/unspendable-amount-alert";
import { deleteApiV1IbansReset, getApiV1IbansSigningMessage, postApiV1IntegrationsMonerium } from "@/client/sdk.gen";
import { useSignMessage, useAccount } from "wagmi";
import { MONERIUM_CONSTANTS } from "@/constants";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateNonce,
  createMoneriumSiweMessage,
  sendMoneriumAuthRequest,
} from "@/utils/moneriumAuth";
import { StandardAlert } from "@/components/ui/standard-alert";
import { extractErrorMessage } from "@/utils/errorHelpers";

export const Home = () => {
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [moneriumError, setMoneriumError] = useState<string | null>(null);
  const [isMoneriumLoading, setIsMoneriumLoading] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const handleMoneriumButtonClick = useCallback(async () => {
    try {
      const { data: messageToSign, error: messageToSignError } = await getApiV1IbansSigningMessage();

      if (messageToSignError) {
        console.error("Error getting message to sign", messageToSignError);
        return;
      }

      if (!messageToSign?.data?.message) {
        console.error("No message to sign", messageToSign);
        return;
      }

      const signature = await signMessageAsync({
        message: messageToSign.data?.message,
      });

      const { data: postMoneriumProfile, error: postMoneriumProfileError } = await postApiV1IntegrationsMonerium({
        body: {
          signature: signature,
        },
      });

      console.log("postMoneriumProfile", postMoneriumProfile);
      console.log("postMoneriumProfileError", postMoneriumProfileError);
    } catch (error) {
      console.error("Error posting monerium profile", error);
    }
  }, [signMessageAsync]);

  const handleResetIBANButtonClick = useCallback(async () => {
    try {
      const { data: resetIBAN, error: resetIBANError } = await deleteApiV1IbansReset();

      if (resetIBANError) {
        console.error("Error resetting IBAN", resetIBANError);
        return;
      }

      console.log("IBAN reset", resetIBAN);
    } catch (error) {
      console.error("Error resetting IBAN", error);
    }
  }, []);

  const handleAuthenticateWithMonerium = useCallback(async () => {
    if (!address) {
      setMoneriumError("Wallet not connected");
      return;
    }

    setIsMoneriumLoading(true);
    setMoneriumError(null);

    try {
      // Step 1: Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Step 2: Generate nonce and create SIWE message
      const nonce = generateNonce();
      const siweMessage = createMoneriumSiweMessage(address, nonce);

      // Step 3: Request user signature
      const signature = await signMessageAsync({
        message: siweMessage,
      });

      // Step 4: Send authentication request to Monerium
      const response = await sendMoneriumAuthRequest({
        clientId: MONERIUM_CONSTANTS.CLIENT_CREDENTIALS_AUTHORIZATION,
        codeChallenge,
        signature,
        message: siweMessage,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Monerium authentication failed: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log("Monerium authentication successful:", result);

      // TODO: Handle successful authentication (e.g., redirect or show success message)
    } catch (error) {
      console.error("Error authenticating with Monerium:", error);
      setMoneriumError(extractErrorMessage(error, "Failed to authenticate with Monerium"));
    } finally {
      setIsMoneriumLoading(false);
    }
  }, [address, signMessageAsync]);

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="mx-4 lg:mx-0">
          <PendingCardOrder />
          <UnspendableAmountAlert />
          {moneriumError && (
            <div className="mb-4">
              <StandardAlert variant="destructive" description={moneriumError} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-2">
            <Balances />
            <div className="mb-12 mt-4 flex gap-4 mx-4 lg:mx-0">
              <Button onClick={() => setSendFundsModalOpen(true)}>Send funds</Button>
              <Button onClick={() => setAddFundsModalOpen(true)}>Add funds</Button>
              <Button onClick={handleMoneriumButtonClick}>Monerium</Button>
              <Button onClick={handleResetIBANButtonClick}>Reset IBAN</Button>
              <Button onClick={handleAuthenticateWithMonerium} disabled={isMoneriumLoading || !address}>
                {isMoneriumLoading ? "Authenticating..." : "Auth Monerium"}
              </Button>
            </div>
          </div>
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-1 lg:col-start-3">
            <PartnerBanner />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary text-lg">Transactions</h1>
            </div>
            <Transactions />
          </div>
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-1 lg:col-start-3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary text-lg">
                Rewards <StatusHelpIcon type="rewards" />
              </h1>
            </div>
            <Rewards />
            <div className="flex items-center justify-between mb-4 mt-6">
              <h1 className="font-bold text-secondary text-lg">Cards</h1>
              <Link to="/cards" className="flex items-center gap-2">
                View details <ChevronRight size={16} />
              </Link>
            </div>
            <Cards />
          </div>
        </div>
      </div>
      <SendFundsModal open={sendFundsModalOpen} onOpenChange={setSendFundsModalOpen} />
      <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
    </div>
  );
};
