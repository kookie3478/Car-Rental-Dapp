import "./MyCarsPreview.css";

export default function MyCarsPreview() {
  return (
    <div className="card">
      <div className="cars-header">
        <h3>My Cars</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="cars-scroll">
        <div className="car-mini">Tesla Model 3</div>
        <div className="car-mini">BMW X5</div>
        <div className="car-mini">Audi A4</div>
      </div>
    </div>
  );
}
