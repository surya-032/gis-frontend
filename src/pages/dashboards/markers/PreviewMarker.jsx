import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function PreviewMarker() {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCoords, setSearchCoords] = useState({ lat: "", lng: "" });
  const [mapType, setMapType] = useState("osm"); 
  const [selectedPosition, setSelectedPosition] = useState([-8.409518, 115.188919]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const markerRefs = useRef({});

  const mapLayers = {
    osm: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
    satellite: { name: "Satellite (ArcGIS)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    terrain: { name: "Topographic", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
    google: { name: "Google Maps", url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
    googleHybrid: { name: "Google Hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  };

  useEffect(() => {
    fetch("/api/markers")
      .then(response => response.json())
      .then(data => setMarkers(data))
      .catch(error => console.error("Error fetching markers:", error));
  }, []);

  const handleSearch = () => {
    const foundMarker = markers.find(marker => marker.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (foundMarker) {
      setSelectedPosition([foundMarker.latitude, foundMarker.longitude]);
      setZoomLevel(14);
      if (markerRefs.current[foundMarker.id]) {
        markerRefs.current[foundMarker.id].openPopup();
      }
    } else {
      alert("❌ Marker tidak ditemukan!");
    }
  };

  const handleSearchCoords = () => {
    const lat = parseFloat(searchCoords.lat);
    const lng = parseFloat(searchCoords.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedPosition([lat, lng]);
      setZoomLevel(14);
    } else {
      alert("❌ Masukkan koordinat yang valid!");
    }
  };

  const handleSelectMarker = (event) => {
    const markerId = event.target.value;
    setSelectedMarker(markerId);

    const foundMarker = markers.find(marker => marker.id === parseInt(markerId));
    if (foundMarker) {
      setSelectedPosition([foundMarker.latitude, foundMarker.longitude]);
      setZoomLevel(14);
      if (markerRefs.current[foundMarker.id]) {
        markerRefs.current[foundMarker.id].openPopup();
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-950">🌍 Peta & Pencarian Marker</h1>
        <p className="mt-2 text-gray-800">
          Pilih marker dari dropdown, cari berdasarkan nama, atau masukkan koordinat untuk menemukannya.
        </p>
      </div>

      {/* Search & Selection UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md mb-4 w-full max-w-6xl">
        {/* Dropdown Select Marker */}
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

        {/* Search by Name */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Cari Marker:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan nama marker..."
              className="border p-2 rounded-md w-full text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition duration-300"
            >
              Cari
            </button>
          </div>
        </div>

        {/* Search by Coordinates */}
        <div className="flex flex-col">
          <label className="text-gray-800 font-semibold">Cari Berdasarkan Koordinat:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Latitude"
              className="border p-2 rounded-md w-28 text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
              value={searchCoords.lat}
              onChange={(e) => setSearchCoords({ ...searchCoords, lat: e.target.value })}
            />
            <input
              type="text"
              placeholder="Longitude"
              className="border p-2 rounded-md w-28 text-gray-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
              value={searchCoords.lng}
              onChange={(e) => setSearchCoords({ ...searchCoords, lng: e.target.value })}
            />
            <button
              onClick={handleSearchCoords}
              className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition duration-300"
            >
              Cari
            </button>
          </div>
        </div>

        {/* Layer Selection */}
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

      {/* Map Display */}
      <div className="w-full max-w-6xl h-[600px] rounded-lg shadow-2xl overflow-hidden relative">
        <MapContainer center={selectedPosition} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
          <ChangeView center={selectedPosition} zoom={zoomLevel} />
          <TileLayer key={mapType} url={mapLayers[mapType].url} />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={markerIcon}>
              <Popup><strong>{marker.name}</strong><br/>Deskripsi: {marker.description || "Tidak ada deskripsi"}<br/>Koordinat: {marker.latitude}, {marker.longitude}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
