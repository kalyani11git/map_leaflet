import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const calculateDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const CityDistanceMap = () => {
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);

  const fetchCoordinates = async (city) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  const fetchData = async () => {
    const coord1 = await fetchCoordinates(city1);
    const coord2 = await fetchCoordinates(city2);
    if (coord1 && coord2) {
      setCoordinates([coord1, coord2]);
      setDistance(calculateDistance(coord1, coord2));
    } else {
      setCoordinates([]);
      setDistance(null);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex space-x-4">
        <input
          type="text"
          value={city1}
          onChange={(e) => setCity1(e.target.value)}
          placeholder="Enter first city"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={city2}
          onChange={(e) => setCity2(e.target.value)}
          placeholder="Enter second city"
          className="p-2 border rounded"
        />
        <button
          onClick={fetchData}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </div>
      {distance && <p className="text-lg font-bold">Distance: {distance} km</p>}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-96 w-full md:w-3/4 lg:w-1/2 border"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.length === 2 && (
          <>
            <Marker position={coordinates[0]} />
            <Marker position={coordinates[1]} />
            <Polyline positions={coordinates} color="blue" />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default CityDistanceMap;
