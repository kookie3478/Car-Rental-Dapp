import { ethers } from "ethers";
import artifact from "../abi/CarRental.json";
import { CONTRACT_ADDRESS, HARDHAT_RPC } from "../abi/contract";

const ABI = artifact.abi;

/* ---------------- READ CONTRACT ---------------- */

export function getReadContract() {
  const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

/* ---------------- WRITE CONTRACT ---------------- */

export function getWriteContract(signer) {
  if (!signer) throw new Error("Signer required");
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

/* ---------------- READ HELPERS ---------------- */

/**
 * Fetch all cars from chain
 * (filtering happens in UI)
 */
export async function fetchAllCars() {
  const contract = getReadContract();
  const count = Number(await contract.carCount());

  const cars = [];
  for (let i = 1; i <= count; i++) {
    cars.push(await contract.cars(i));
  }
  return cars;
}

/**
 * Get active rental for a car (if any)
 */
export async function getActiveRental(carId) {
  const contract = getReadContract();
  return await contract.activeRental(carId);
}

/* ---------------- OWNER ACTIONS ---------------- */

/**
 * Register a new car
 */
export async function registerCar(signer, model, location, priceEth) {
  const contract = getWriteContract(signer);

  const tx = await contract.registerCar(
    model,
    location,
    ethers.parseEther(priceEth),
  );

  await tx.wait();
}

/**
 * Update price or pickup location
 * (ONLY works if car is Available — enforced on-chain)
 */
export async function updateCarDetails(signer, carId, location, priceEth) {
  const contract = getWriteContract(signer);

  const tx = await contract.updateCarDetails(
    carId,
    location,
    ethers.parseEther(priceEth),
  );

  await tx.wait();
}

/**
 * Mark a car unavailable (servicing / soft delete)
 * ONLY if not rented
 */
export async function setCarUnavailable(signer, carId) {
  const contract = getWriteContract(signer);

  const tx = await contract.setCarUnavailable(carId);
  await tx.wait();
}

/**
 * Cancel an active rental and refund renter
 */
export async function cancelRental(signer, carId) {
  const contract = getWriteContract(signer);

  const tx = await contract.cancelRental(carId);
  await tx.wait();
}

/**
 * End rental normally (after end date)
 */
export async function endRental(signer, carId) {
  const contract = getWriteContract(signer);

  const tx = await contract.endRental(carId);
  await tx.wait();
}

/* ---------------- RENTER ACTIONS ---------------- */

/**
 * Rent a car
 * Reverts automatically if unavailable
 */
export async function rentCar(signer, carId, startDate, endDate, totalEth) {
  const contract = getWriteContract(signer);

  const tx = await contract.rentCar(carId, startDate, endDate, {
    value: ethers.parseEther(totalEth),
  });

  await tx.wait();
}

/* ---------------- HISTORY ---------------- */

export async function getRenterHistory(address) {
  const contract = getReadContract();
  return await contract.getRenterHistory(address);
}

export async function getOwnerHistory(address) {
  const contract = getReadContract();
  return await contract.getOwnerHistory(address);
}
