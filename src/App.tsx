import { useAccount, useSignMessage, useSignTypedData } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { SiteHeader } from "./components/site-header";
import { Button } from "./components/ui/button";
import { useCallback } from "react";
import {
  getApiV1AccountSignaturePayload,
  getApiV1CardsByCardIdStatus,
  patchApiV1AccountDeploySafeModules,
  postApiV1Account,
  postApiV1OrderCreate,
  postApiV1SafeSetCurrency,
  putApiV1OrderByOrderIdConfirmPayment,
} from "./client";
import { useUser } from "./context/UserContext";
import { useAuth } from "./context/AuthContext";
import { Cards } from "./components/cards";

function App() {
  const account = useAccount();
  const { user, safeConfig, cards } = useUser();
  const { isAuthenticating } = useAuth();
  const { signTypedDataAsync } = useSignTypedData();

  console.log("Safe config: ", safeConfig);
  console.log("cards: ", cards);

  const onCallAccount = useCallback(async () => {
    const { data, error } = await postApiV1Account({ body: { chainId: "100" } });

    if (error) {
      console.error(error);
      return;
    }

    console.log("Deploy data: ", data);
  }, []);

  const onSetCurrency = useCallback(async () => {
    const { data, error } = await postApiV1SafeSetCurrency();
    if (error) {
      console.error(error);
      return;
    }

    console.log("Set currency data: ", data);
  }, []);

  const onSetupModule = useCallback(async () => {
    const { data, error } = await getApiV1AccountSignaturePayload();

    if (error) {
      console.error("Error getting signature payload", error);
      return;
    }

    // there's some issues with the types here
    // the sdk doesn't type the response correctly
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    if (!data?.domain || !data?.message || !data?.types || !(data as any)?.primaryType) {
      console.error("No correct data returned", data);
      return;
    }

    console.log("Signature payload: ", data);

    let signature = "";

    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      signature = await signTypedDataAsync(data as any);
    } catch (error) {
      console.error("Error signing message", error);
      return;
    }

    if (!signature) {
      console.error("No signature returned");
      return;
    }

    const { data: patchData, error: patchError } = await patchApiV1AccountDeploySafeModules({
      body: {
        signature,
      },
    });

    if (patchError) {
      console.error(patchError);
      return;
    }

    console.log("Patch data: ", patchData);
  }, [signTypedDataAsync]);

  const onCardOrder = useCallback(async () => {
    const { data, error } = await postApiV1OrderCreate({
      body: {
        virtual: true,
        ENSName: "test.eth",
        personalizationSource: "ENS",
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    console.log("Card order data: ", data);
  }, []);

  const onConfirmOrder = useCallback(async () => {
    const { data, error } = await putApiV1OrderByOrderIdConfirmPayment({
      path: {
        orderId: "cmao25gxs0b7bb8jug3ikbrne",
      },
    });

    if (error) {
      console.error(error);
      return;
    }
    console.log("Confirm order data: ", data);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        <div className="col-span-4 col-start-2 ...">
          {isAuthenticating && (
            <div>
              <h2>Authenticating...</h2>
              <p>Please sign the message in your wallet.</p>
            </div>
          )}
          {!isAuthenticating && (
            <div>
              <Cards />
              <Button onClick={onSetCurrency}>Set Currency</Button>
              <Button onClick={onCallAccount}>Call Account</Button>
              <Button onClick={onSetupModule}>Get Safe Data to sign & sign</Button>
              <Button onClick={onCardOrder}>Order Virtual Card</Button>
              <Button onClick={onConfirmOrder}>Confirm Order</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
