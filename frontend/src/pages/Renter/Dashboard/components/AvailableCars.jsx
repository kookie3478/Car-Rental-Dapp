import CarCard from "./CarCard";
import NoCars from "./NoCars";

export default function AvailableCars() {
  const hasResults = false; // placeholder

  return (
    <div className="card">
      <h3>Available Cars</h3>

      {hasResults ? (
        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          <CarCard />
          <CarCard />
        </div>
      ) : (
        <NoCars />
      )}
    </div>
  );
}
