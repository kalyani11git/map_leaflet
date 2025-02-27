import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import axios from "axios";

const MAPBOX_ACCESS_TOKEN = "YOUR_MAPBOX_ACCESS_TOKEN"; // Replace with your API key

const CityDistanceMap = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [route, setRoute] = useState([]);

  const fetchRoute = async () => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      const response = await axios.get(url);
      const coordinates = response.data.routes[0].geometry.coordinates;

      setRoute(coordinates.map(coord => [coord[1], coord[0]])); // Convert to Leaflet format (lat, lng)
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-5">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="From (lng,lat)"
          className="border p-2"
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="text"
          placeholder="To (lng,lat)"
          className="border p-2"
          onChange={(e) => setTo(e.target.value)}
        />
        <button onClick={fetchRoute} className="bg-blue-500 text-white px-4 py-2">
          Get Route
        </button>
      </div>

      <MapContainer center={[20, 0]} zoom={2} className="w-full h-[500px]">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default CityDistanceMap;
