import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import axios from "axios";

const API_KEY = "5b3ce3597851110001cf624811f6a93e9dc648559b06f18f50076c83";

const CityDistanceMap = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [shortest, setShortest] = useState(false);

  const fetchRoute = async () => {
    if (!from || !to) return alert("Please enter both cities!");

    try {
      // Convert city names to coordinates
      const geocode = async (place) => {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
        );
        if (res.data.length === 0) throw new Error(`Location not found: ${place}`);
        return [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)];
      };

      const fromCoords = await geocode(from);
      const toCoords = await geocode(to);

      console.log("From:", fromCoords, "To:", toCoords);

      // Fetch route from OpenRouteService
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          params: {
            api_key: API_KEY,
            start: `${fromCoords[0]},${fromCoords[1]}`,
            end: `${toCoords[0]},${toCoords[1]}`,
          },
        }
      );

      console.log("ORS Response:", response.data);

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error("No route found between the selected locations.");
      }

      const routeCoords = response.data.routes[0].geometry.coordinates;
      setCoordinates(routeCoords.map(([lon, lat]) => [lat, lon]));
      setDistance(response.data.routes[0].summary.distance / 1000);
    } catch (error) {
      console.error("Error fetching route:", error.message);
      alert("Failed to fetch route. Check city names and API key!");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">City Distance Finder</h1>

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
          onClick={fetchRoute}
        >
          Submit
        </button>
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={shortest}
          onChange={() => setShortest(!shortest)}
        />
        Show Shortest Path
      </label>

      {distance && (
        <p className="mb-4 font-semibold">
          Distance: {distance.toFixed(2)} km
        </p>
      )}

      <MapContainer
        center={[20, 0]} // Default center (adjust as needed)
        zoom={3}
        className="w-full h-96"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.length > 0 && <Polyline positions={coordinates} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default CityDistanceMap;
