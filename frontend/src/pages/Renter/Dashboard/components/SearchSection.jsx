import "./SearchSection.css";

export default function SearchSection() {
  return (
    <div className="card">
      <h3>Search Cars</h3>

      <div className="search-grid">
        <input placeholder="Car model" />
        <input type="date" />
        <input type="date" />
        <input placeholder="Pickup location" />
        <input placeholder="Drop-off location" />
      </div>

      <button className="primary-btn search-btn">Search</button>
    </div>
  );
}
