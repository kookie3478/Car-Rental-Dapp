import "./ActiveRentals.css";
export default function ActiveRentals() {
  return (
    <div className="card">
      <div className="active-rentals-header">
        <h3>Active Rentals</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="rentals-scroll">
        <div className="rental-mini">Rental 1</div>
      </div>
    </div>
  );
}
