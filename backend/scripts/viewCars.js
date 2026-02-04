const hre = require("hardhat");

async function main() {
  const [, renter] = await hre.ethers.getSigners();

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const carRental = await hre.ethers.getContractAt(
    "CarRental",
    CONTRACT_ADDRESS,
    renter,
  );

  const carCount = await carRental.carCount();

  console.log("Total cars:", carCount.toString());

  for (let i = 1; i <= carCount; i++) {
    const car = await carRental.cars(i);

    console.log({
      id: car.id.toString(),
      model: car.model,
      location: car.pickupLocation,
      pricePerDay: hre.ethers.formatEther(car.pricePerDay),
      available: car.isAvailable,
    });
  }
}

main().catch(console.error);
