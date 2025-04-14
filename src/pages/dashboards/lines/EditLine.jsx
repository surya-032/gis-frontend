import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaSave, FaTrash } from "react-icons/fa";

function LocationEditor({ points, setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prevPoints) => [...prevPoints, { latitude: e.latlng.lat, longitude: e.latlng.lng }]);
    },
  });

  return points.map((point, index) => (
    <Marker
      key={index}
      position={[point.latitude, point.longitude]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const newPoints = [...points];
          newPoints[index] = { latitude: e.target.getLatLng().lat, longitude: e.target.getLatLng().lng };
          setPoints(newPoints);
        },
        contextmenu: () => {
          if (points.length > 2) {
            setPoints((prevPoints) => prevPoints.filter((_, i) => i !== index)); 
          }
        },
      }}
    />
  ));
}

export default function EditRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState(null);
  const [mapType, setMapType] = useState("osm");

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  };

  useEffect(() => {
    fetch(`https://gis-backend-production-f4bc.up.railway.app/routes/${id}`)
      .then(response => response.json())
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setPoints(data.points || []);
      })
      .catch(error => console.error("Error fetching route:", error));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (points.length < 2) {
      setMessage({ text: "Tambahkan minimal 2 titik!", type: "error" });
      return;
    }

    const updatedRoute = { name, description, points };

    try {
      const response = await fetch(`https://gis-backend-production-f4bc.up.railway.app/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoute),
      });

      if (!response.ok) throw new Error("Gagal memperbarui rute");

      setMessage({ text: "✅ Rute berhasil diperbarui!", type: "success" });
      setTimeout(() => navigate("/dashboard/line/preview"), 2000);
    } catch (error) {
      setMessage({ text: "❌ " + error.message, type: "error" });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* ✅ Notifikasi Pesan di atas Map */}
      {message && (
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-opacity duration-300 ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">Edit Rute</h1>
        <p className="mt-2 text-gray-600">Klik pada peta untuk menambah titik, geser titik untuk memindahkannya, atau klik kanan untuk menghapus titik.</p>
      </div>

      {/* ✅ Form */}
      <form onSubmit={handleUpdate} className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-md">
        {/* Nama Rute */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Nama Rute:</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Deskripsi */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Deskripsi:</label>
          <textarea
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Pilih Layer Peta */}
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Pilih Layer Peta:</label>
          <select
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            {Object.entries(mapLayers).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        {/* ✅ Peta */}
        <div className="w-full h-[500px] rounded-lg shadow-lg overflow-hidden mb-6">
          <MapContainer center={[-8.409518, 115.188919]} zoom={12} className="w-full h-full">
            <TileLayer url={mapLayers[mapType].url} />
            <Polyline positions={points.map(p => [p.latitude, p.longitude])} color="blue" weight={4} />
            <LocationEditor points={points} setPoints={setPoints} />
          </MapContainer>
        </div>

        {/* ✅ Tombol Simpan */}
        <button
          type="submit"
          className="w-full bg-blue-950 text-white py-3 rounded-lg flex items-center justify-center hover:bg-blue-800 transition duration-300 font-semibold"
        >
          <FaSave className="mr-2" /> Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
