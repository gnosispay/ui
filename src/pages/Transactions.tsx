import { Transactions } from "@/components/transactions/transactions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router";

export const TransactionsRoute = () => {
  const { isAuthenticating, isAuthenticated } = useAuth();
  const { isUserSignedUp, isKycApproved, isSafeConfigured } = useUser();
  const navigate = useNavigate();

  if (isAuthenticated && (!isUserSignedUp || !isKycApproved || !isSafeConfigured))
    return (
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <h2 className="text-xl">Welcome to Gnosis Pay</h2>
          <div className="text-muted-foreground">You need to complete the signup process to use the app.</div>
          <Button className="mt-4" onClick={() => navigate("/register")}>
            Complete Signup
          </Button>
        </div>
      </div>
    );

  if (!isAuthenticated && !isAuthenticating)
    return (
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <h2 className="text-xl">Welcome to Gnosis Pay</h2>
          <p className="text-muted-foreground">Connect your wallet to get started.</p>
        </div>
      </div>
    );

  if (isAuthenticating)
    return (
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <h2 className="flex items-center text-xl">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
          </h2>
          <p>Please sign the message request.</p>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-4 col-start-2">
        <h1 className="text-xl">Transactions</h1>
      </div>
      <div className="col-span-4 col-start-2">
        <Transactions showHeader={false} />
      </div>
    </div>
  );
};
