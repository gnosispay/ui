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
import {
  deleteApiV1IbansReset,
  getApiV1IbansAvailable,
  getApiV1IbansSigningMessage,
  postApiV1IntegrationsMonerium,
} from "@/client/sdk.gen";
import { useSignMessage, useAccount } from "wagmi";
import { MONERIUM_CONSTANTS } from "@/constants";
import { generateCodeVerifier, generateCodeChallenge, sendMoneriumAuthRequest } from "@/utils/moneriumAuth";
import { StandardAlert } from "@/components/ui/standard-alert";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";

export const Home = () => {
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [moneriumError, setMoneriumError] = useState<string | null>(null);
  const [isMoneriumLoading, setIsMoneriumLoading] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const [ibanAvailable, setIbanAvailable] = useState(false);

  const handleIbanAvailableButtonClick = useCallback(async () => {
    try {
      const { data: ibanAvailable, error: ibanAvailableError } = await getApiV1IbansAvailable();

      if (ibanAvailableError) {
        console.error("Error getting IBAN available", ibanAvailableError);
        return;
      }

      console.log("IBAN available", ibanAvailable);
      setIbanAvailable(ibanAvailable.data.available);
    } catch (error) {
      console.error("Error getting IBAN available", error);
    }
  }, []);

  const handleIntegrationMoneriumButtonClick = useCallback(async () => {
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
      const nonce = generateSiweNonce();
      const siweMessage = createSiweMessage({
        address: address,
        chainId: 100,
        domain: "localhost:5173",
        uri: "http://localhost:5173",
        nonce,
        version: "1",
        resources: ["https://monerium.com/siwe", "http://localhost:5173", "http://localhost:5173"],
        issuedAt: new Date(),
        expirationTime: new Date(Date.now() + 60 * 60 * 1000),
        statement: "Allow Gnosis Pay - Sandbox to access my data on Monerium",
      });

      // Step 3: Request user signature
      const signature = await signMessageAsync({
        message: siweMessage,
      });

      // Step 4: Send authentication request to Monerium
      const response = await sendMoneriumAuthRequest({
        clientId: MONERIUM_CONSTANTS.AUTHORIZATION_CODE_FLOW,
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

        <div className="lg:grid lg:grid-cols-3 lg:gap-x-4">
          {/* Balances - Row 1 Left on desktop */}
          <div className="mx-4 lg:mx-0 lg:col-span-2 lg:row-start-1">
            <Balances />
            <div className="mb-12 mt-4 flex flex-col gap-4 mx-4 lg:mx-0">
              <Button onClick={() => setSendFundsModalOpen(true)}>Send funds</Button>
              <Button onClick={() => setAddFundsModalOpen(true)}>Add funds</Button>
              <Button onClick={handleIbanAvailableButtonClick}>IBAN Available: {ibanAvailable ? "Yes" : "No"}</Button>
              <Button onClick={handleIntegrationMoneriumButtonClick}>Integration Monerium</Button>
              <Button onClick={handleResetIBANButtonClick}>Reset IBAN</Button>
              <Button onClick={handleAuthenticateWithMonerium} disabled={isMoneriumLoading}>
                {isMoneriumLoading ? "Authenticating..." : "Auth Monerium"}
              </Button>
            </div>
          </div>

          {/* Partner Banner - After Balances on mobile, Row 1 Right on desktop */}
          <div className="m-4 lg:mx-0 lg:mb-0 lg:col-span-1 lg:col-start-3 lg:row-start-1">
            <PartnerBanner />
          </div>

          {/* Rewards and Cards - After Partner on mobile, Row 2 Right on desktop */}
          <div className="m-4 lg:m-0 lg:col-span-1 lg:col-start-3 lg:row-start-2">
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

          {/* Transactions - Last on mobile, Row 2 Left on desktop */}
          <div className="mx-4 lg:mx-0 lg:col-span-2 lg:row-start-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary text-lg">Transactions</h1>
            </div>
            <Transactions />
          </div>
        </div>
      </div>
      <SendFundsModal open={sendFundsModalOpen} onOpenChange={setSendFundsModalOpen} />
      <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
    </div>
  );
};
