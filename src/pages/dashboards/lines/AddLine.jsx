import { useState } from "react";
import { MapContainer, TileLayer, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCheckCircle, FaExclamationTriangle, FaMapMarkedAlt } from "react-icons/fa";

export default function AddLine() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState(null);
  const [mapType, setMapType] = useState("osm");

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPoints((prevPoints) => [
          ...prevPoints,
          {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            position: prevPoints.length + 1, 
          },
        ]);
      },
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (points.length < 2) {
      setMessage({ text: "Rute harus memiliki minimal 2 titik!", type: "error" });
      return;
    }

    const newRoute = { name, description, points };

    try {
      const response = await fetch("http://localhost:5000/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan rute");
      }

      setMessage({ text: "Rute berhasil ditambahkan!", type: "success" });
      setName("");
      setDescription("");
      setPoints([]);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center relative">
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
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FaMapMarkedAlt className="mr-2 text-blue-950 text-4xl" /> Tambah Line Baru
        </h1>
        <p className="mt-2 text-gray-700">Klik di peta untuk menambahkan titik koordinat.</p>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
        {/* Nama Rute */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Nama Rute:</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Deskripsi */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Deskripsi:</label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Pilih Layer Peta */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Pilih Layer Peta:</label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            {Object.entries(mapLayers).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        {/* Peta untuk menambahkan titik koordinat */}
        <div className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden mb-4">
          <MapContainer center={[-8.409518, 115.188919]} zoom={12} className="w-full h-full">
            <TileLayer url={mapLayers[mapType].url} />
            <Polyline positions={points.map(p => [p.latitude, p.longitude])} color="blue" weight={4} />
            <MapClickHandler />
          </MapContainer>
        </div>

        {/* Menampilkan koordinat yang telah ditambahkan */}
        {points.length > 0 && (
          <div className="bg-gray-200 p-4 rounded-md text-gray-700 mb-4">
            <h3 className="font-semibold">Koordinat yang Dipilih:</h3>
            <ul className="text-sm">
              {points.map((p, index) => (
                <li key={index} className="mt-1">
                  {index + 1}. {p.latitude}, {p.longitude}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-950 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition duration-300">
          Simpan Rute
        </button>
      </form>
    </div>
  );
}
