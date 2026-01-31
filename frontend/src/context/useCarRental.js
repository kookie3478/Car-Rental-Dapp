import { ethers } from "ethers";
import ABI from "../abi/CarRental.json";
import { CONTRACT_ADDRESS } from "../abi/contract";

export function getCarRentalContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}