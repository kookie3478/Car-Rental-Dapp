import { useContext, useEffect, useState } from "react";
import { Web3Context } from "../../../context/Web3Context";

import {
  fetchAllCars,
  registerCar as registerCarOnChain,
} from "../../../context/useCarRental";

import "./OwnerDashboard.css";

import EarningsOverview from "./components/EarningsOverview";
import MyCarsPreview from "./components/MyCarsPreview";
import ActiveRentals from "./components/ActiveRentals";
import Notifications from "./components/Notifications";

export default function OwnerDashboard() {
  const { signer, account } = useContext(Web3Context);

  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch owner's cars ---------------- */
  const loadOwnerCars = async () => {
    if (!account) return;

    const allCars = await fetchAllCars();

    const owned = allCars.filter(
      (car) => car.owner.toLowerCase() === account.toLowerCase(),
    );

    setCars(
      owned.map((car) => ({
        id: Number(car.id),
        model: car.model,
        status: Number(car.status), // 0,1,2
        earnings: Number(car.earnings),
      })),
    );
  };

  useEffect(() => {
    if (!account) return;
    loadOwnerCars();
  }, [account]);

  /* ---------------- Register new car ---------------- */
  const handleRegisterCar = async () => {
    if (!model || !location || !pricePerDay) {
      alert("Please fill all fields");
      return;
    }

    if (!signer) {
      alert("Wallet not connected");
      return;
    }

    try {
      setLoading(true);

      await registerCarOnChain(signer, model, location, pricePerDay);

      setModel("");
      setLocation("");
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
        <EarningsOverview cars={cars} />
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
            placeholder="Pickup location (e.g. Delhi)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="text"
            placeholder="Price per day (ETH)"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={handleRegisterCar}
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
