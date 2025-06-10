import { Cards } from "../components/cards";
import { LoaderCircle } from "lucide-react";
import { VirtualCardsOrderModal } from "../components/modals/virtual-cards-order";
import { useAuth } from "@/context/AuthContext";

export const Home = () => {
  const { isAuthenticating, isAuthenticated } = useAuth();

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      {!isAuthenticated && !isAuthenticating && (
        <div className="col-span-4 col-start-2">
          <h2 className="text-xl">Welcome to Gnosis Pay</h2>
          <p className="text-muted-foreground">Connect your wallet to get started.</p>
        </div>
      )}
      {isAuthenticating && (
        <div className="col-span-4 col-start-2">
          <h2 className="flex items-center text-xl">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
          </h2>
          <p>Please sign the message request.</p>
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
  );
};
