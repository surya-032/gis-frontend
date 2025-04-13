import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14); 
    }
  }, [center, map]);
  return null;
}

export default function PreviewPolygon() {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState("");
  const [selectedPoints, setSelectedPoints] = useState([]); 
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); 
  const [mapType, setMapType] = useState("osm"); 
  const [selectedDescription, setSelectedDescription] = useState(""); 

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  useEffect(() => {
    fetch("http://localhost:5000/polygons")
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Polygons:", data);
        setPolygons(data);
      })
      .catch(error => console.error("Error fetching polygons:", error));
  }, []);

  const handleSelectPolygon = (event) => {
    const polygonId = event.target.value;
    setSelectedPolygon(polygonId);

    if (polygonId) {
      const foundPolygon = polygons.find(polygon => polygon.id === parseInt(polygonId));
      if (foundPolygon && foundPolygon.points.length > 0) {
        setSelectedPoints(foundPolygon.points);
        setSelectedPosition([foundPolygon.points[0].latitude, foundPolygon.points[0].longitude]);
        setSelectedDescription(foundPolygon.description); 
      }
    } else {
      setSelectedPoints([]);
      setSelectedDescription("");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">🌍 Peta & Pencarian Polygon</h1>
        <p className="mt-2 text-gray-700">Pilih polygon yang tersedia atau tampilkan semuanya di peta.</p>
      </div>

      {/* Dropdown & Map Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md mb-4 w-full max-w-5xl">
        {/* Pilih Polygon */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Pilih Polygon:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={selectedPolygon}
            onChange={handleSelectPolygon}
          >
            <option value="">Tampilkan Semua Polygon</option>
            {polygons.map(polygon => (
              <option key={polygon.id} value={polygon.id}>
                {polygon.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Layer Peta */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Pilih Layer Peta:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            {Object.entries(mapLayers).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deskripsi Polygon */}
      {selectedPolygon && selectedDescription && (
        <div className="w-full max-w-5xl bg-blue-100 text-blue-900 p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-lg font-semibold">📖 Deskripsi Polygon:</h2>
          <p className="text-sm">{selectedDescription}</p>
        </div>
      )}

      {/* Peta */}
      <div className="w-full max-w-5xl h-[600px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={12} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} />
          <TileLayer url={mapLayers[mapType].url} />

          {/* Tampilkan hanya polygon yang dipilih */}
          {selectedPolygon ? (
            <Polygon positions={selectedPoints.map(point => [point.latitude, point.longitude])} color="red" weight={2}>
              <Popup>
                <strong>📍 Polygon Terpilih</strong> <br />
                {selectedDescription ? <p className="text-sm">{selectedDescription}</p> : "Tidak ada deskripsi"}
              </Popup>
            </Polygon>
          ) : (
            // Jika tidak ada polygon yang dipilih, tampilkan semua polygon
            polygons.map(polygon =>
              polygon.points?.length > 0 && (
                <Polygon key={polygon.id} positions={polygon.points.map(point => [point.latitude, point.longitude])} color="blue" weight={2}>
                  <Popup>
                    <strong>📍 {polygon.name}</strong> <br />
                    {polygon.description ? <p className="text-sm">{polygon.description}</p> : "Tidak ada deskripsi"}
                  </Popup>
                </Polygon>
              )
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
}
