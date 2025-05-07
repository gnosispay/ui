import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  // useConnect,
  // useDisconnect
} from "wagmi";
// import { Button } from "./components/ui/button";
import { ModeToggle } from "./components/mode-toggle";
import "@rainbow-me/rainbowkit/styles.css";

function App() {
  const account = useAccount();
  // const { connectors, connect, status, error } = useConnect();
  // const { disconnect } = useDisconnect();

  return (
    <>
      <ModeToggle />
      <div>
        <ConnectButton />
      </div>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {/* {account.status === "connected" && (
          <Button type="button" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )} */}
      </div>

      {/*<div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <Button key={connector.uid} onClick={() => connect({ connector })} type="button" className="ml-2">
            {connector.name}
          </Button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div> */}
    </>
  );
}

export default App;
