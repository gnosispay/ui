import { useAccount } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { SiteHeader } from "./components/site-header";

function App() {
  const account = useAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="grid grid-cols-6 gap-4 h-full mt-4">
        <div className="col-span-4 col-start-2 ...">
          <div>
            <h2>Account: {account.status}</h2>
            {account.address && (
              <div>
                addresses: {JSON.stringify(account.addresses)}
                <br />
                chainId: {account.chainId}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
