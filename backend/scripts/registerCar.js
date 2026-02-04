const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const carRental = await hre.ethers.getContractAt(
    "CarRental",
    CONTRACT_ADDRESS,
    owner,
  );

  const tx = await carRental.registerCar(
    "Hyundai Verna",
    "Delhi",
    hre.ethers.parseEther("1"),
  );

  await tx.wait();
  console.log("Car registered");
}

main().catch(console.error);
