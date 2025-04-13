import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaSave, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

const markerIcon = new L.Icon.Default();

function LocationSelector({ setCoords }) {
  useMap().on("click", (e) => {
    setCoords([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function EditMarker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState(null);
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

  useEffect(() => {
    fetch(`http://localhost:5000/markers/${id}`)
      .then(response => response.json())
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setCoords([data.latitude, data.longitude]);
      })
      .catch(error => console.error("Error fetching marker:", error));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const updatedMarker = {
      name,
      latitude: coords[0],
      longitude: coords[1],
      description,
    };

    try {
      const response = await fetch(`http://localhost:5000/markers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMarker),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui marker");
      }

      setMessage({ text: "Marker berhasil diperbarui!", type: "success" });

      setTimeout(() => {
        setMessage(null);
        navigate("/dashboard/marker/manage");
      }, 3000);
    } catch (error) {
      setMessage({ text: "❌ " + error.message, type: "error" });

      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 relative">
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

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">
        {/* Header */}
        <h2 className="text-2xl font-bold text-blue-950 flex items-center mb-4">
          <FaMapMarkerAlt className="mr-3 text-blue-950 text-3xl" /> Edit Marker
        </h2>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Nama Marker */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">Nama Marker</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Pilih Layer Peta */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">Pilih Layer Peta</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <label className="block text-gray-800 font-semibold mb-1">Pilih Lokasi di Peta</label>
            <div className="w-full h-[400px] rounded-lg shadow-md overflow-hidden mt-2">
              {coords ? (
                <MapContainer center={coords} zoom={14} className="w-full h-full" scrollWheelZoom={true}>
                  <ChangeView center={coords} zoom={9} />
                  <TileLayer url={mapLayers[mapType].url} />
                  <Marker position={coords} icon={markerIcon} />
                  <LocationSelector setCoords={setCoords} />
                </MapContainer>
              ) : (
                <p className="text-center text-gray-500 py-6">Memuat peta...</p>
              )}
            </div>
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            className="w-full bg-blue-950 text-white py-3 rounded-lg flex items-center justify-center hover:bg-blue-800 transition duration-300 font-semibold"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : <><FaSave className="mr-2 text-lg" /> Simpan Perubahan</>}
          </button>
        </form>
      </div>
    </div>
  );
}
