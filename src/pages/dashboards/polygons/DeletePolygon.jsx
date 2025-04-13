import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function DeletePolygon() {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState("");
  const [mapType, setMapType] = useState("osm");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); 
  const [zoomLevel, setZoomLevel] = useState(12);
  const [message, setMessage] = useState(null);
  const polygonRefs = useRef({});

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  };

  useEffect(() => {
    fetch("http://localhost:5000/polygons")
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map(polygon => ({
          ...polygon,
          points: Array.isArray(polygon.points)
            ? polygon.points.map(pt => [pt.latitude, pt.longitude])
            : [],
        }));

        setPolygons(formattedData);
      })
      .catch(error => console.error("Error fetching polygons:", error));
  }, []);

  const handleSelectPolygon = (event) => {
    const polygonId = event.target.value;
    setSelectedPolygon(polygonId);

    const foundPolygon = polygons.find(polygon => polygon.id === parseInt(polygonId));
    if (foundPolygon && foundPolygon.points.length > 0) {
      setSelectedPosition(foundPolygon.points[0]); 
      setZoomLevel(14);
    }
  };

  const handleDeletePolygon = async (polygonId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus polygon ini?")) return;

    try {
      const response = await fetch(`http://localhost:5000/polygons/${polygonId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus polygon");
      }


      setPolygons(prevPolygons => prevPolygons.filter(polygon => polygon.id !== polygonId));
      setMessage({ text: "Polygon berhasil dihapus!", type: "success" });

      setSelectedPolygon("");
      setSelectedPosition([-8.409518, 115.188919]); 
      setZoomLevel(12);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: "❌ " + error.message, type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center relative">
      {/* Notifikasi Pesan */}
      {message && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-opacity duration-300 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}` }>
          <div className="flex items-center space-x-2">
            {message.type === "success" ? (
              <FaCheckCircle className="text-white text-xl" />
            ) : (
              <FaExclamationTriangle className="text-white text-xl" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">Peta & Pilih Polygon</h1>
        <p className="mt-2 text-gray-700">Pilih polygon dari daftar atau klik langsung di peta.</p>
      </div>

      {/* Select Polygon & Map Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md mb-4 w-full max-w-6xl">
        {/* Select Polygon */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">🔽 Pilih Polygon:</label>
          <select className="border p-2 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none" value={selectedPolygon} onChange={handleSelectPolygon}>
            <option value="">Pilih polygon...</option>
            {polygons.map(polygon => (
              <option key={polygon.id} value={polygon.id}>{polygon.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Peta */}
      <div className="w-full max-w-6xl h-[600px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} zoom={zoomLevel} />
          <TileLayer url={mapLayers[mapType].url} />
          {polygons.map((polygon) => (
            polygon.points.length > 2 && (
              <Polygon key={polygon.id} positions={polygon.points} color="blue">
                <Popup>
                  <strong className="text-lg text-blue-800">{polygon.name}</strong> <br />
                  <p className="text-gray-700">{polygon.description ? polygon.description : "Tidak ada deskripsi"}</p>
                  <button onClick={() => handleDeletePolygon(polygon.id)} className="bg-red-500 text-white px-3 py-1 rounded mt-2 hover:bg-red-600 transition duration-300">
                    Hapus Polygon
                  </button>
                </Popup>
              </Polygon>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
