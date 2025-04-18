import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";

// Komponen untuk mengubah pusat peta saat koordinat berubah
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function DeleteLine() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [mapType, setMapType] = useState("osm");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); // Default Bali
  const [zoomLevel, setZoomLevel] = useState(12);
  const [message, setMessage] = useState(null);
  const routeRefs = useRef({});

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  useEffect(() => {
    fetch("/api/routes")
      .then(response => response.json())
      .then(data => setRoutes(data))
      .catch(error => console.error("Error fetching routes:", error));
  }, []);

  const handleSelectRoute = (event) => {
    const routeId = event.target.value;
    setSelectedRoute(routeId);

    const foundRoute = routes.find(route => route.id === parseInt(routeId));
    if (foundRoute && foundRoute.points.length > 0) {
      setSelectedPosition([foundRoute.points[0].latitude, foundRoute.points[0].longitude]);
      setZoomLevel(14);

      if (routeRefs.current[foundRoute.id]) {
        routeRefs.current[foundRoute.id].openPopup();
      }
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus rute ini?")) return;

    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus rute");
      }

      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));

      setMessage({ text: "✅ Rute berhasil dihapus!", type: "success" });

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
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-opacity duration-300 ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
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
        <h1 className="text-3xl font-bold text-blue-950">Peta & Hapus Rute</h1>
        <p className="mt-2 text-gray-700">
          Pilih rute dari daftar atau klik langsung di peta untuk menghapusnya.
        </p>
      </div>

      {/* Route Selection & Map Layer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-md mb-4 w-full max-w-6xl">
        
        {/* Select Route */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">🔽 Pilih Rute:</label>
          <select
            className="border p-2 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={selectedRoute}
            onChange={handleSelectRoute}
          >
            <option value="">Pilih rute...</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Layer Selection */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">🗺️ Pilih Layer Peta:</label>
          <select
            className="border p-2 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
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
      <div className="w-full max-w-6xl h-[600px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} zoom={zoomLevel} />
          <TileLayer url={mapLayers[mapType].url} />
          {routes.map((route) => (
            route.points?.length > 0 && (
              <Polyline
                key={route.id}
                positions={route.points.map(point => [point.latitude, point.longitude])}
                color="blue"
                weight={4}
              >
                <Popup>
                  <strong className="text-lg text-blue-800">{route.name}</strong> <br />
                  <p className="text-gray-700">{route.description ? route.description : "Tidak ada deskripsi"}</p>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded mt-2 hover:bg-red-600 transition duration-300 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Hapus Rute
                  </button>
                </Popup>
              </Polyline>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
