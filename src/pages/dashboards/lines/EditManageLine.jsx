import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
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

export default function EditManageLine() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); // Default Bali
  const [zoomLevel, setZoomLevel] = useState(10);
  const [mapType, setMapType] = useState("osm");
  const navigate = useNavigate();
  const routeRefs = useRef({});

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  useEffect(() => {
    fetch("https://gis-backend-production-f4bc.up.railway.app/routes")
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FaMapMarkerAlt className="mr-3 text-blue-950 text-3xl" />
          Peta & Pilih Rute
        </h1>
        <p className="mt-2 text-gray-600">Pilih rute dari daftar atau klik langsung di peta untuk melihat detail.</p>
      </div>

      {/* Route Selection & Map Layer Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-5xl">
        {/* Select Route */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold mb-2">Pilih Rute:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
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
          {routes.map((route) => (
            route.points?.length > 0 && (
              <Polyline
                key={route.id}
                positions={route.points.map(point => [point.latitude, point.longitude])}
                color="blue"
                weight={4}
              >
                <Popup>
                  <div className="text-left">
                    <strong className="text-lg">{route.name}</strong>
                    <p className="text-sm text-gray-600">
                      {route.description ? route.description : "Tidak ada deskripsi"}
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/line/edit/${route.id}`)}
                      className="bg-blue-950 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-800 transition duration-300 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Edit Rute
                    </button>
                  </div>
                </Popup>
              </Polyline>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
