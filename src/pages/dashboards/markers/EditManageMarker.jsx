import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon.Default();

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function ManageMarker() {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState("");
  const [mapType, setMapType] = useState("osm");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const markerRefs = useRef({});
  const navigate = useNavigate();

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  useEffect(() => {
    fetch("http://localhost:5000/markers")
      .then(response => response.json())
      .then(data => setMarkers(data))
      .catch(error => console.error("Error fetching markers:", error));
  }, []);

  const handleSelectMarker = (event) => {
    const markerId = event.target.value;
    setSelectedMarker(markerId);

    const foundMarker = markers.find(marker => marker.id === parseInt(markerId));
    if (foundMarker) {
      setSelectedPosition([foundMarker.latitude, foundMarker.longitude]);
      setZoomLevel(15);

      if (markerRefs.current[foundMarker.id]) {
        markerRefs.current[foundMarker.id].openPopup();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">Peta & Pilih Marker</h1>
        <p className="mt-2 text-gray-600">
          Pilih marker dari daftar atau klik langsung di peta untuk melihat detail.
        </p>
      </div>

      {/* Search & Map Layer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-5xl">
        {/* Select Marker */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold mb-2">Pilih Marker:</label>
          <select
            className="border p-3 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={selectedMarker}
            onChange={handleSelectMarker}
          >
            <option value="">Pilih marker...</option>
            {markers.map(marker => (
              <option key={marker.id} value={marker.id}>
                {marker.name}
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

      {/* Map Section */}
      <div className="w-full max-w-5xl h-[500px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer center={selectedPosition} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} zoom={zoomLevel} />
          <TileLayer url={mapLayers[mapType].url} />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={markerIcon}
              ref={(ref) => (markerRefs.current[marker.id] = ref)}
            >
              <Popup>
                <div className="text-left">
                  <strong className="text-lg">{marker.name}</strong>
                  <p className="text-sm text-gray-600">
                    {marker.description || "Tidak ada deskripsi"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Koordinat:</span> {marker.latitude}, {marker.longitude}
                  </p>
                  <button
                    onClick={() => navigate(`/dashboard/marker/edit/${marker.id}`)}
                    className="bg-blue-950 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-800 transition duration-300"
                  >
                    Edit Marker
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
