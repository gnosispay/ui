import "@rainbow-me/rainbowkit/styles.css";
import { SiteHeader } from "./components/site-header";
import { Button } from "./components/ui/button";
import { useCallback } from "react";
import { postApiV1OrderCreate } from "./client";
import { useAuth } from "./context/AuthContext";
import { Cards } from "./components/cards";

function App() {
  const { isAuthenticating } = useAuth();

  const onCardOrder = useCallback(async () => {
    const { data, error } = await postApiV1OrderCreate({
      body: {
        virtual: true,
        ENSName: "",
        personalizationSource: "ENS",
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    console.log("Card order data: ", data);
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
              <Button onClick={onCardOrder}>Order Virtual Card</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
