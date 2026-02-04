const hre = require("hardhat");

async function main() {
  const [, renter] = await hre.ethers.getSigners();

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const carRental = await hre.ethers.getContractAt(
    "CarRental",
    CONTRACT_ADDRESS,
    renter,
  );

  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 2 * 24 * 60 * 60; // 2 days

  const tx = await carRental.rentCar(1, startDate, endDate, {
    value: hre.ethers.parseEther("2"),
  });

  await tx.wait();
  console.log("Car rented");
}

main().catch(console.error);
