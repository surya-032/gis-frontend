import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { FaCheckCircle, FaExclamationTriangle, FaDrawPolygon } from "react-icons/fa";

export default function AddPolygon() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [polygon, setPolygon] = useState([]);
  const [message, setMessage] = useState(null);
  const [mapType, setMapType] = useState("osm");

  const featureGroupRef = useRef(null); 

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  function DrawControl({ setPolygon }) {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      if (!featureGroupRef.current) {
        featureGroupRef.current = new L.FeatureGroup();
        map.addLayer(featureGroupRef.current);
      }

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: featureGroupRef.current,
          remove: true, 
        },
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (event) => {
        const { layer } = event;

        featureGroupRef.current.clearLayers();
        featureGroupRef.current.addLayer(layer);

        if (layer instanceof L.Polygon) {
          setPolygon(layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]));
        }
      });

      map.on(L.Draw.Event.EDITED, (event) => {
        event.layers.eachLayer((layer) => {
          if (layer instanceof L.Polygon) {
            setPolygon(layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]));
          }
        });
      });

      map.on(L.Draw.Event.DELETED, () => {
        setPolygon([]);
      });

      return () => {
        map.removeControl(drawControl);
      };
    }, [map, setPolygon]);

    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (polygon.length < 3) {
      setMessage({ text: "Polygon harus memiliki minimal 3 titik!", type: "error" });
      return;
    }

    const newPolygon = { name, description, points: polygon };

    try {
      const response = await fetch("/api/polygons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolygon),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan polygon");
      }

      setMessage({ text: "Polygon berhasil ditambahkan!", type: "success" });
      setName("");
      setDescription("");
      setPolygon([]);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center relative">
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

      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FaDrawPolygon className="mr-2 text-blue-950 text-4xl" /> Tambah Polygon Baru
        </h1>
        <p className="mt-2 text-gray-700">Gunakan alat gambar untuk menambahkan polygon.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Nama Polygon:</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Deskripsi:</label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

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

        <div className="w-full h-[500px] rounded-lg shadow-lg overflow-hidden mb-4">
          <MapContainer center={[-8.409518, 115.188919]} zoom={12} className="w-full h-full">
            <TileLayer url={mapLayers[mapType].url} />
            {polygon.length > 2 && <Polygon positions={polygon} color="blue" weight={4} />}
            <FeatureGroup ref={featureGroupRef}>
              <DrawControl setPolygon={setPolygon} />
            </FeatureGroup>
          </MapContainer>
        </div>

        <button type="submit" className="w-full bg-blue-950 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition duration-300">
          Simpan Polygon
        </button>
      </form>
    </div>
  );
}
