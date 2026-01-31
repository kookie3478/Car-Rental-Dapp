import "./EarningsOverview.css";

export default function EarningsOverview() {
  return (
    <div className="card earnings-grid">
      <div className="earning-box purple">
        <p>Total Earnings</p>
        <h3>Ξ 0.00</h3>
      </div>

      <div className="earning-box blue">
        <p>This Month</p>
        <h3>Ξ 0.00</h3>
      </div>

      <div className="earning-box pink">
        <p>This Year</p>
        <h3>Ξ 0.00</h3>
      </div>
    </div>
  );
}
