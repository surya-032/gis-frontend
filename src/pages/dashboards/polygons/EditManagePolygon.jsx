import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapMarkerAlt, FaEdit } from "react-icons/fa";

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function EditManagePolygon() {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState("");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); 
  const [zoomLevel, setZoomLevel] = useState(10);
  const [mapType, setMapType] = useState("osm");
  const navigate = useNavigate();
  const polygonRefs = useRef({});

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
      .then(data => setPolygons(data))
      .catch(error => console.error("Error fetching polygons:", error));
  }, []);

  const handleSelectPolygon = (event) => {
    const polygonId = event.target.value;
    setSelectedPolygon(polygonId);

    const foundPolygon = polygons.find(polygon => polygon.id === parseInt(polygonId));
    if (foundPolygon && foundPolygon.points.length > 0) {
      setSelectedPosition([foundPolygon.points[0].latitude, foundPolygon.points[0].longitude]);
      setZoomLevel(14);
      if (polygonRefs.current[foundPolygon.id]) {
        polygonRefs.current[foundPolygon.id].openPopup();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FaMapMarkerAlt className="mr-3 text-blue-950 text-3xl" />
          Peta & Pilih Polygon
        </h1>
        <p className="mt-2 text-gray-600">Pilih poligon dari daftar atau klik langsung di peta untuk melihat detail.</p>
      </div>

      {/* Polygon Selection & Map Layer Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-5xl">
        {/* Select Polygon */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold mb-2">Pilih Polygon:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={selectedPolygon}
            onChange={handleSelectPolygon}
          >
            <option value="">Pilih polygon...</option>
            {polygons.map(polygon => (
              <option key={polygon.id} value={polygon.id}>
                {polygon.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Layer Selection */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold mb-2">Pilih Layer Peta:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            {Object.entries(mapLayers).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Peta */}
      <div className="w-full max-w-5xl h-[500px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} zoom={zoomLevel} />
          <TileLayer url={mapLayers[mapType].url} />
          {polygons.map((polygon) => (
            polygon.points?.length > 0 && (
              <Polygon
                key={polygon.id}
                positions={polygon.points.map(point => [point.latitude, point.longitude])}
                color="blue"
                weight={4}
              >
                <Popup>
                  <div className="text-left">
                    <strong className="text-lg">{polygon.name}</strong>
                    <p className="text-sm text-gray-600">
                      {polygon.description ? polygon.description : "Tidak ada deskripsi"}
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/polygon/edit/${polygon.id}`)}
                      className="bg-blue-950 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-800 transition duration-300 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Edit Polygon
                    </button>
                  </div>
                </Popup>
              </Polygon>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
