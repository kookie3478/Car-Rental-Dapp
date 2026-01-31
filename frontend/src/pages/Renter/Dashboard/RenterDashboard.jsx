import "./RenterDashboard.css";
import SearchSection from "./components/SearchSection";
import AvailableCars from "./components/AvailableCars";
import CurrentRental from "./components/CurrentRentals";
import RentalHistory from "./components/RentalHistory";

export default function RenterDashboard() {
  return (
    <div className="renter-page">
      <div className="renter-container">
        <h1 className="renter-title">Renter Dashboard</h1>

        <div className="renter-section">
          <SearchSection />
        </div>

        <div className="renter-section">
          <AvailableCars />
        </div>

        <div className="renter-grid">
          <CurrentRental />
          <RentalHistory />
        </div>
      </div>
    </div>
  );
}
