import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaMapMarkerAlt, FaPlusCircle, FaCheckCircle } from "react-icons/fa";

const markerIcon = new L.Icon.Default();

function LocationSelector({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function AddMarker() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState([-8.409518, 115.188919]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 
  const [mapType, setMapType] = useState("osm");

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const markerData = {
      name,
      latitude: coords[0],
      longitude: coords[1],
      description,
    };

    try {
      const response = await fetch("http://localhost:5000/markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(markerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan marker");
      }

      setMessage({ text: "Marker berhasil ditambahkan!", type: "success" });

      setTimeout(() => setMessage(null), 3000);

      setName("");
      setDescription("");
    } catch (error) {
      setMessage({ text: "❌ " + error.message, type: "error" });

      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6 relative">
      {/* Success Notification Pop-up */}
      {message && (
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-opacity duration-300 ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-white text-xl" />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        {/* Header */}
        <h2 className="text-2xl font-bold text-blue-950 flex items-center mb-4">
          <FaMapMarkerAlt className="mr-2 text-blue-950 text-3xl" /> Tambah Marker Baru
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nama Marker */}
          <div>
            <label className="py-2 block text-gray-700 font-semibold text-sm">Nama Marker</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Nama lokasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="py-2 block text-gray-700 font-semibold text-sm">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Deskripsi lokasi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Pilih Layer Peta */}
          <div>
            <label className="py-2 block text-gray-700 font-semibold text-sm">Pilih Layer Peta</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
            >
              {Object.entries(mapLayers).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Peta Pilihan Lokasi */}
          <div>
            <label className="py-2 block text-gray-700 font-semibold text-sm">Pilih Lokasi di Peta</label>
            <div className="w-full h-[400px] rounded-lg shadow-md overflow-hidden mt-2">
              <MapContainer center={coords} zoom={9} className="w-full h-full" scrollWheelZoom={true}>
                <TileLayer url={mapLayers[mapType].url} />
                <Marker position={coords} icon={markerIcon} />
                <LocationSelector setCoords={setCoords} />
              </MapContainer>
            </div>
            <p className="py-2 text-gray-600 mt-2 text-xs text-center">
              Klik di peta untuk memilih lokasi. <br />
              <strong>Koordinat:</strong> {coords[0]}, {coords[1]}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-950 text-white py-2 mt-4 text-sm rounded-lg flex items-center justify-center hover:bg-blue-800 transition duration-300 font-semibold"
            disabled={loading}
          >
            {loading ? "Menambahkan..." : <><FaPlusCircle className="mr-2 text-lg" /> Tambah Marker</>}
          </button>
        </form>
      </div>
    </div>
  );
}
