import { Cards } from "../components/cards";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Balances } from "@/components/balances";
import { Transactions } from "@/components/transactions";

export const Home = () => {
  const { isAuthenticating, isAuthenticated } = useAuth();

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      {!isAuthenticated && !isAuthenticating && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <h2 className="text-xl">Welcome to Gnosis Pay</h2>
          <p className="text-muted-foreground">Connect your wallet to get started.</p>
        </div>
      )}
      {isAuthenticating && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <h2 className="flex items-center text-xl">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
          </h2>
          <p>Please sign the message request.</p>
        </div>
      )}
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        {!isAuthenticating && isAuthenticated && (
          <>
            <Balances />
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 lg:col-span-2">
                <Transactions />
              </div>
              <div className="col-span-3 lg:col-span-1 lg:col-start-3">
                <Cards />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
