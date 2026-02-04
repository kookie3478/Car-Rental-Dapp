import { useContext, useEffect, useState } from "react";
import { Web3Context } from "../../../context/Web3Context";
import { fetchAllCars } from "../../../context/useCarRental";
import "../../../styles/layout.css";
import "./OwnerCars.css";

export default function OwnerCars() {
  const { account } = useContext(Web3Context);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;

    const loadCars = async () => {
      setLoading(true);
      try {
        const allCars = await fetchAllCars();

        const ownerAvailableCars = allCars
          .filter(
            (car) =>
              car.owner &&
              account &&
              car.owner.toLowerCase() === account.toLowerCase() &&
              Number(car.status) === 0,
          )
          .map((car) => ({
            id: Number(car.id),
            model: car.model,
            pickupLocation: car.pickupLocation,
            pricePerDay: Number(car.pricePerDay) / 1e18,
          }));

        setCars(ownerAvailableCars);
      } catch (err) {
        console.error("Failed to load owner cars:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [account]);

  if (!account) {
    return <div className="owner-page">Please connect your wallet.</div>;
  }

  return (
    <div className="owner-page">
      <h1 className="owner-title">My Cars</h1>

      {loading ? (
        <p>Loading cars...</p>
      ) : cars.length === 0 ? (
        <p>No available cars to manage.</p>
      ) : (
        <div className="owner-section">
          <div className="owner-grid">
            {cars.map((car) => (
              <div key={car.id} className="register-car-card">
                <h3 style={{ marginBottom: "16px" }}>{car.model}</h3>

                <div className="register-form">
                  <input
                    type="text"
                    defaultValue={car.pickupLocation}
                    placeholder="Pickup Location"
                  />
                </div>

                <div className="register-form">
                  <input
                    type="number"
                    defaultValue={car.pricePerDay}
                    placeholder="Price per day (ETH)"
                  />
                </div>

                <div>
                  <div className="car-actions-row">
                    <button className="primary-btn small-btn">Save</button>
                    <button className="secondary-btn small-btn">
                      Unavailable
                    </button>
                    <button className="danger-btn small-btn">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
