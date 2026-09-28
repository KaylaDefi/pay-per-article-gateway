import {
  useConnection,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnector() {
  const { address, isConnected, chainId, connector } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  if (isConnected && address) {
    const wrongNetwork = chainId !== baseSepolia.id;

    return (
      <div className="wallet">
        <span className="address">
          {connector?.name}: {shortenAddress(address)}
        </span>
        {wrongNetwork && (
          <button onClick={() => switchChain.mutate({ chainId: baseSepolia.id })}>
            Switch to Base Sepolia
          </button>
        )}
        <button onClick={() => disconnect.mutate()}>Disconnect</button>
      </div>
    );
  }

  const namedWallets = connectors.filter((c) => c.id !== "injected");
  const options = namedWallets.length > 0 ? namedWallets : connectors;

  if (options.length === 0) {
    return (
      <p>No EVM wallet detected. Install Backpack, MetaMask, or Coinbase Wallet to continue.</p>
    );
  }

  return (
    <div className="wallet">
      {options.map((c) => (
        <button
          key={c.uid}
          disabled={connect.isPending}
          onClick={() => connect.mutate({ connector: c, chainId: baseSepolia.id })}
        >
          {c.icon && <img src={c.icon} alt="" width={20} height={20} />}
          Connect {c.name}
        </button>
      ))}
      {connect.error && <p className="error">{connect.error.message}</p>}
    </div>
  );
}