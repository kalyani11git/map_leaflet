import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const CityDistanceMap = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [distance, setDistance] = useState(null);

  // Function to convert city names to latitude/longitude
  const fetchCoordinates = async (city) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
      );
      if (res.data.length === 0) throw new Error(`Location not found: ${city}`);
      return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    } catch (error) {
      console.error("Error fetching coordinates:", error.message);
      alert("Failed to find location. Please enter valid city names.");
      return null;
    }
  };

  // Haversine formula to calculate air distance
  const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const calculateDistance = async () => {
    if (!from || !to) return alert("Please enter both cities!");

    try {
      const fromCoords = await fetchCoordinates(from);
      const toCoords = await fetchCoordinates(to);

      if (!fromCoords || !toCoords) return;

      setFromCoords(fromCoords);
      setToCoords(toCoords);

      const distanceKm = haversineDistance(fromCoords, toCoords);
      setDistance(distanceKm);
    } catch (error) {
      console.error("Error calculating distance:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Great-Circle Distance Finder</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="From City"
          className="p-2 border rounded"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="text"
          placeholder="To City"
          className="p-2 border rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={calculateDistance}
        >
          Submit
        </button>
      </div>

      {distance !== null && (
        <p className="mb-4 font-semibold">
          Air Distance: {distance.toFixed(2)} km
        </p>
      )}

      <MapContainer
        center={fromCoords || [20, 0]}
        zoom={fromCoords ? 4 : 2}
        className="w-full h-96"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {fromCoords && (
          <Marker position={fromCoords}>
            <Popup>From: {from}</Popup>
          </Marker>
        )}
        {toCoords && (
          <Marker position={toCoords}>
            <Popup>To: {to}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default CityDistanceMap;
