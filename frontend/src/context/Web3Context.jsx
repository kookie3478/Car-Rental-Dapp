import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { HARDHAT_CHAIN_ID } from "../abi/contract";

export const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [networkOk, setNetworkOk] = useState(false);

  /**
   * Force MetaMask to Hardhat local network
   */
  const ensureHardhatNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }], // 31337
      });
      setNetworkOk(true);
    } catch (err) {
      // Network not added → add it
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7A69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Hardhat ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
        setNetworkOk(true);
      } else {
        console.error("Network switch failed:", err);
        setNetworkOk(false);
        throw err;
      }
    }
  };

  /**
   * Connect wallet (login)
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    try {
      await ensureHardhatNetwork();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(address);
      setConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet");
    }
  };

  /**
   * Restore wallet connection on page refresh
   */
  const restoreWallet = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length === 0) return;

      // Ensure we are still on Hardhat network
      await ensureHardhatNetwork();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setConnected(true);
    } catch (err) {
      console.error("Failed to restore wallet:", err);
    }
  };

  /**
   * Handle account change (owner ↔ renter)
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setConnected(false);
        setAccount(null);
        setSigner(null);
        return;
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setConnected(true);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    restoreWallet();
  }, []);
  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        connected,
        networkOk,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
