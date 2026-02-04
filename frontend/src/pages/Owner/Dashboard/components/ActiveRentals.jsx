import { useEffect, useState, useContext } from "react";
import { Web3Context } from "../../../../context/Web3Context";
import { getOwnerHistory } from "../../../../context/useCarRental";
import "./ActiveRentals.css";

export default function ActiveRentals() {
  const { account } = useContext(Web3Context);

  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    const loadActiveRentals = async () => {
      try {
        setLoading(true);

        const history = await getOwnerHistory(account);

        if (!Array.isArray(history)) {
          setActiveRentals([]);
          return;
        }

        // Active rental = endTime === 0
        const active = history.filter((rental) => Number(rental.endTime) === 0);

        setActiveRentals(active);
      } catch (err) {
        console.error("Failed to load active rentals:", err);
        setActiveRentals([]);
      } finally {
        setLoading(false);
      }
    };

    loadActiveRentals();
  }, [account]);

  return (
    <div className="card">
      <div className="active-rentals-header">
        <h3>Active Rentals</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="rentals-scroll">
        {loading && <div className="rental-mini">Loading...</div>}

        {!loading && activeRentals.length === 0 && (
          <p style={{ color: "#a1a7c4" }}>No active rentals</p>
        )}

        {!loading &&
          activeRentals.map((rental, index) => (
            <div key={index} className="rental-mini">
              <div>
                <strong>Car ID:</strong> {rental.carId.toString()}
              </div>
              <div>
                <strong>Renter:</strong>{" "}
                {`${rental.renter.slice(0, 6)}...${rental.renter.slice(-4)}`}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
