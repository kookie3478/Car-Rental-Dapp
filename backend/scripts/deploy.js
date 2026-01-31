async function main() {
  const CarRental = await ethers.getContractFactory("CarRental");
  const contract = await CarRental.deploy();

  await contract.waitForDeployment();

  console.log("CarRental deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});