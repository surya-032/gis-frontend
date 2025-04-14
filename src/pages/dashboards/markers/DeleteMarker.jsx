import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const markerIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [30, 50],
  iconAnchor: [15, 50],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function DeleteMarker() {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState("");
  const [mapType, setMapType] = useState("osm");
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]); 
  const [zoomLevel, setZoomLevel] = useState(12);
  const [message, setMessage] = useState(null); 
  const markerRefs = useRef({});

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };


  useEffect(() => {
    fetch("https://gis-backend-production-f4bc.up.railway.app/markers")
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
      setZoomLevel(16);

      if (markerRefs.current[foundMarker.id]) {
        markerRefs.current[foundMarker.id].openPopup();
      }
    }
  };


  const handleDeleteMarker = async (markerId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus marker ini?")) return;

    try {
      const response = await fetch(`https://gis-backend-production-f4bc.up.railway.app/markers/${markerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus marker");
      }

      setMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== markerId));

      setMessage({ text: "Marker berhasil dihapus!", type: "success" });

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
        <h1 className="text-3xl font-bold text-blue-950">Peta & Pilih Marker</h1>
        <p className="mt-2 text-gray-700">
          Pilih marker dari daftar atau klik langsung di peta.
        </p>
      </div>

      {/* Search & Map Layer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-md mb-4 w-full max-w-6xl">
        
        {/* Select Marker */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Pilih Marker:</label>
          <select
            className="border p-2 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
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
          <label className="text-gray-800 font-semibold">Pilih Layer Peta:</label>
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
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={markerIcon}
              ref={(ref) => (markerRefs.current[marker.id] = ref)}
            >
              <Popup>
                <strong className="text-lg text-blue-800">{marker.name}</strong> <br />
                <p className="text-gray-700">{marker.description ? marker.description : "Tidak ada deskripsi"}</p>

                {/* Tombol Hapus */}
                <button
                  onClick={() => handleDeleteMarker(marker.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded mt-2 hover:bg-red-600 transition duration-300"
                >
                  Hapus Marker
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
