import "@rainbow-me/rainbowkit/styles.css";
import { SiteHeader } from "./components/site-header";
import { useAuth } from "./context/AuthContext";
import { Cards } from "./components/cards";
import { LoaderCircle } from "lucide-react";
import { VirtualCardsOrderModal } from "./components/modals/virtual-cards-order";

function App() {
  const { isAuthenticating, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        {isAuthenticating && (
          <div className="col-span-4 col-start-2">
            <h2 className="flex items-center text-xl">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
            </h2>
            <p>Please connect your wallet and sign the message request.</p>
          </div>
        )}
        <div className="col-span-4 col-start-2">
          {!isAuthenticating && isAuthenticated && (
            <div>
              <Cards />
              <VirtualCardsOrderModal />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
