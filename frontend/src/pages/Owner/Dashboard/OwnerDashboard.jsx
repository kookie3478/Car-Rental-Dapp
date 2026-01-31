import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3Context } from "../../../context/Web3Context";
import { getCarRentalContract } from "../../../context/useCarRental";

import "./OwnerDashboard.css";

import EarningsOverview from "./components/EarningsOverview";
import MyCarsPreview from "./components/MyCarsPreview";
import ActiveRentals from "./components/ActiveRentals";
import Notifications from "./components/Notifications";

export default function OwnerDashboard() {
  const { signer, account } = useContext(Web3Context);

  const [model, setModel] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch owner's cars ---------------- */
  useEffect(() => {
    if (!signer) return;

    const fetchCars = async () => {
      const contract = getCarRentalContract(signer);
      const count = await contract.carCount();

      const ownedCars = [];

      for (let i = 1; i <= Number(count); i++) {
        const car = await contract.cars(i);
        if (car.owner.toLowerCase() === account.toLowerCase()) {
          ownedCars.push({
            id: car.id,
            model: car.model,
            available: car.isAvailable,
          });
        }
      }

      setCars(ownedCars);
    };

    fetchCars();
  }, [signer, account]);

  /* ---------------- Register new car ---------------- */
  const registerCar = async () => {
    if (!model || !pricePerDay) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const contract = getCarRentalContract(signer);

      const tx = await contract.registerCar(
        model,
        ethers.parseEther(pricePerDay),
      );
      await tx.wait();

      setModel("");
      setPricePerDay("");
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page owner-page">
      <h1 className="owner-title">Owner Dashboard</h1>

      {/* Earnings */}
      <div className="section">
        <EarningsOverview />
      </div>

      {/* Register Car */}
      <div className="section register-car-card">
        <h3>Register New Car</h3>

        <div className="register-form">
          <input
            type="text"
            placeholder="Car model (e.g. Tesla Model 3)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />

          <input
            type="text"
            placeholder="Price per day (ETH)"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={registerCar}
            disabled={loading}
          >
            {loading ? "Registering..." : "Add Car"}
          </button>
        </div>
      </div>

      {/* My Cars */}
      <div className="section">
        <MyCarsPreview cars={cars.slice(0, 3)} />
      </div>

      {/* Rentals + Notifications */}
      <div className="section grid-2">
        <ActiveRentals />
      </div>
      <div className="section-grid-3">
        <Notifications />
      </div>
    </div>
  );
}
