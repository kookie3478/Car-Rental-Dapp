import { createContext, useState } from "react";
import { ethers } from "ethers";

export const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

    try {
      // 1️⃣ Force switch to Hardhat network (chainId 31337)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // 31337 in hex
        });
      } catch (switchError) {
        // 2️⃣ If network not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Hardhat Local",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: {
                  name: "Hardhat ETH",
                  symbol: "HETH",
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // 3️⃣ Now safely create provider & signer
      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const address = await signer.getAddress();

      setProvider(prov);
      setSigner(signer);
      setAccount(address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet");
    }
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}
