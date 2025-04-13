import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const markerIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [30, 50],
  iconAnchor: [15, 50],
});

// Map layer options
const mapLayers = {
  "OpenStreetMap (Default)": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "Topo Map": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  "Satelit (ArcGIS)": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "Google Maps": "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  "Google Hybrid": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

function LocationMarker({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = [
      [-8.75, 114.9], // Southwest Bali
      [-8.1, 115.5],  // Northeast Bali
    ];
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [map]);

  return null;
}

export default function PetaDashboard() {
  const [coords, setCoords] = useState([-8.409518, 115.188919]); 
  const [mapType, setMapType] = useState(mapLayers["OpenStreetMap (Default)"]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">🌍 Peta Geografis Bali</h1>
        <p className="mt-2 text-gray-800">
          Gunakan peta ini untuk melihat dan memilih lokasi di Bali. Klik pada peta untuk mendapatkan koordinat.
        </p>
      </div>

      {/* Map Layer Selection */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row gap-4 w-full max-w-lg">
        <label className="text-gray-800 font-semibold">Pilih Layer Peta:</label>
        <select 
          className="border p-2 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-800 focus:outline-none"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
        >
          {Object.keys(mapLayers).map((layer) => (
            <option key={layer} value={mapLayers[layer]}>
              {layer}
            </option>
          ))}
        </select>
      </div>

      {/* Coordinate Display */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full max-w-lg text-center">
        <h3 className="text-lg font-semibold text-gray-800">Koordinat yang Dipilih:</h3>
        <p className="text-gray-700 text-lg font-mono mt-2">{coords[0].toFixed(6)}, {coords[1].toFixed(6)}</p>
      </div>

      {/* Map Display */}
      <div className="w-full max-w-6xl h-[600px] rounded-lg shadow-2xl overflow-hidden relative">
        <MapContainer 
          center={coords} 
          zoom={11}  
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer url={mapType} />
          <Marker position={coords} icon={markerIcon} />
          <LocationMarker setCoords={setCoords} />
          <FitBounds />
        </MapContainer>
      </div>
    </div>
  );
}
