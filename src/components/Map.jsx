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

const mapLayers = {
  OpenStreetMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  Terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  Google: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
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

function FitBounds({ coords }) {
  const map = useMap();

  useEffect(() => {
    const bounds = [
      [-8.75, 114.9], 
      [-8.1, 115.5],
    ];
    map.fitBounds(bounds, { padding: [30, 30] });
    map.setView(coords, 11); 
  }, [map, coords]);

  return null;
}

export default function Map() {
  const [coords, setCoords] = useState([-8.409518, 115.188919]); 
  const [mapType, setMapType] = useState(mapLayers.OpenStreetMap); 

  return (
    <div className="flex flex-col items-center justify-center p-10 relative z-0 bg-gray-100">
      {/* Space to avoid navbar overlap */}
      <div className="h-20"></div>

      <h2 className="text-4xl font-bold text-blue-950 mb-4">🗺️ Peta Geografis Bali</h2>
      <p className="text-gray-700 mb-6 text-lg text-center">Klik pada peta untuk mendapatkan koordinat</p>

      {/* Layer Selection Dropdown */}
      <div className="mb-6">
        <label className="text-blue-950 font-semibold text-lg mb-2 block text-center">Pilih Layer Peta:</label>
        <select
          className="border border-gray-300 px-4 py-2 rounded-lg text-lg shadow-md bg-white focus:ring focus:ring-blue-800"
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

      {/* Display Selected Coordinates */}
      <div className="bg-white px-6 py-3 rounded-lg shadow-lg text-lg text-gray-800 mb-6 border-l-4 border-blue-950">
        <strong>📍 Koordinat:</strong> {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
      </div>

      {/* Map Container */}
      <div className="w-full h-[600px] max-w-6xl rounded-lg shadow-xl overflow-hidden relative z-0 border border-gray-300">
        <MapContainer 
          center={coords} 
          zoom={11}  
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer url={mapType} />
          <Marker position={coords} icon={markerIcon} />
          <LocationMarker setCoords={setCoords} />
          <FitBounds coords={coords} />
        </MapContainer>
      </div>
    </div>
  );
}
