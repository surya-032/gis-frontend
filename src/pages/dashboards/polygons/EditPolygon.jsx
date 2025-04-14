import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { FaSave, FaEdit } from "react-icons/fa";

function DrawControl({ polygon, setPolygon }) {
  const map = useMap();
  const featureGroupRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    if (!map) return;

    featureGroupRef.current.clearLayers();
    map.addLayer(featureGroupRef.current);

    if (polygon.length > 2) {
      try {
        const validPolygon = polygon.map(pt => [pt.latitude, pt.longitude]);
        const existingPolygon = L.polygon(validPolygon, { color: "blue" }).addTo(featureGroupRef.current);
        featureGroupRef.current.addLayer(existingPolygon);
      } catch (error) {
        console.error("Error rendering polygon:", error);
      }
    }

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,  
        rectangle: false, 
        circle: false, 
        circlemarker: false,  
        polyline: false,
        marker: false, 
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true, 
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.EDITED, (event) => {
      event.layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const newPolygon = layer.getLatLngs()[0].map((latlng) => ({
            latitude: latlng.lat,
            longitude: latlng.lng,
          }));
          setPolygon(newPolygon);
        }
      });
    });

    map.on(L.Draw.Event.CREATED, (event) => {
      if (event.layer instanceof L.Polygon) {
        const newPolygon = event.layer.getLatLngs()[0].map((latlng) => ({
          latitude: latlng.lat,
          longitude: latlng.lng,
        }));
        setPolygon(newPolygon);
      }
    });

    map.on(L.Draw.Event.DELETED, () => {
      setPolygon([]);
    });

    return () => {
      map.removeControl(drawControl);
    };
  }, [map, polygon, setPolygon]);

  return null;
}

export default function EditPolygon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [polygon, setPolygon] = useState([]);
  const [message, setMessage] = useState(null);
  const [mapType, setMapType] = useState("osm");

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  };

  useEffect(() => {
    fetch(`https://gis-backend-production-f4bc.up.railway.app/polygons/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setName(data.name || "");
        setDescription(data.description || "");

        setPolygon(data.points?.length > 2 ? data.points.map(pt => ({ latitude: pt.latitude, longitude: pt.longitude })) : []);
      })
      .catch((error) => console.error("Error fetching polygon:", error));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (polygon.length < 3) {
      setMessage({ text: "Tambahkan minimal 3 titik polygon!", type: "error" });
      return;
    }

    const updatedData = { name, description, points: polygon };

    try {
      const response = await fetch(`https://gis-backend-production-f4bc.up.railway.app/polygons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Gagal memperbarui polygon");

      setMessage({ text: "✅ Data berhasil diperbarui!", type: "success" });

      setTimeout(() => navigate("/dashboard/polygon/manage"), 2000);
    } catch (error) {
      setMessage({ text: "❌ " + error.message, type: "error" });
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      {message && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
          {message.text}
        </div>
      )}

      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FaEdit className="mr-2 text-blue-950 text-3xl" /> Edit Polygon
        </h1>
      </div>

      <form onSubmit={handleUpdate} className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Nama:</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md text-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-800 font-semibold">Deskripsi:</label>
          <textarea
            className="w-full p-3 border rounded-md text-gray-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <MapContainer center={[-8.409518, 115.188919]} zoom={12} className="w-full h-[500px] rounded-lg shadow-lg">
          <TileLayer url={mapLayers[mapType].url} />
          <FeatureGroup>
            <DrawControl polygon={polygon} setPolygon={setPolygon} />
          </FeatureGroup>
        </MapContainer>

        <button type="submit" className="w-full bg-blue-950 text-white py-3 rounded-lg">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
