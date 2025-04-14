import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 10); 
    }
  }, [center, map]);
  return null;
}

export default function PreviewLine() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
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
    fetch("https://gis-backend-production-f4bc.up.railway.app/routes")
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Routes:", data);
        setRoutes(data);
      })
      .catch(error => console.error("Error fetching routes:", error));
  }, []);

  const handleSelectRoute = (event) => {
    const routeId = event.target.value;
    setSelectedRoute(routeId);

    if (routeId) {
      const foundRoute = routes.find(route => route.id === parseInt(routeId));
      if (foundRoute && foundRoute.points.length > 0) {
        setSelectedPoints(foundRoute.points);
        setSelectedPosition([foundRoute.points[0].latitude, foundRoute.points[0].longitude]);
        setSelectedDescription(foundRoute.description); 
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
        <h1 className="text-3xl font-bold text-blue-950">🌍 Peta & Pencarian Rute</h1>
        <p className="mt-2 text-gray-700">Pilih rute yang tersedia atau tampilkan semuanya di peta.</p>
      </div>

      {/* Dropdown & Map Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md mb-4 w-full max-w-5xl">
        {/* Pilih Rute */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Pilih Rute:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={selectedRoute}
            onChange={handleSelectRoute}
          >
            <option value="">Tampilkan Semua Rute</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name}
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

      {/* Deskripsi Rute */}
      {selectedRoute && selectedDescription && (
        <div className="w-full max-w-5xl bg-blue-100 text-blue-900 p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-lg font-semibold">📖 Deskripsi Rute:</h2>
          <p className="text-sm">{selectedDescription}</p>
        </div>
      )}

      {/* Peta */}
      <div className="w-full max-w-5xl h-[600px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={12} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} />
          <TileLayer url={mapLayers[mapType].url} />

          {/* Tampilkan hanya rute yang dipilih */}
          {selectedRoute ? (
            <Polyline positions={selectedPoints.map(point => [point.latitude, point.longitude])} color="red" weight={5}>
              <Popup>
                <strong>📍 Rute Terpilih</strong> <br />
                {selectedDescription ? <p className="text-sm">{selectedDescription}</p> : "Tidak ada deskripsi"}
              </Popup>
            </Polyline>
          ) : (
            routes.map(route =>
              route.points?.length > 0 && (
                <Polyline key={route.id} positions={route.points.map(point => [point.latitude, point.longitude])} color="blue" weight={4}>
                  <Popup>
                    <strong>📍 {route.name}</strong> <br />
                    {route.description ? <p className="text-sm">{route.description}</p> : "Tidak ada deskripsi"}
                  </Popup>
                </Polyline>
              )
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
}
