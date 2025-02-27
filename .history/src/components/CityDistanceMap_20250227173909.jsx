import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Custom Marker Icons
const greenIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-green",
});

const redIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-red",
});

// Component to fit map bounds when route updates
const FitMapBounds = ({ routeCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = routeCoords.map(coord => [coord[0], coord[1]]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [routeCoords, map]);

  return null;
};

const MapComponent = () => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  // Fetch coordinates from OpenStreetMap
  const fetchCoordinates = async (location) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: location, format: "json", limit: 1 },
      });
      if (response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      }
      alert(`Location "${location}" not found.`);
      return null;
    } catch (error) {
      alert("Failed to fetch location.");
      return null;
    }
  };

  // Get Current Location
  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setStartLocation(`${latitude}, ${longitude}`);
      }, () => {
        alert("Failed to get current location.");
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const startCoords = await fetchCoordinates(startLocation);
    const endCoords = await fetchCoordinates(endLocation);
    if (!startCoords || !endCoords) return;

    try {
      const routeResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`
      );
      if (routeResponse.data.routes.length > 0) {
        const coordinates = routeResponse.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
        setDistance((routeResponse.data.routes[0].distance / 1000).toFixed(2));
        setMapKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      alert("Failed to get route.");
    }
  };

  return (
    <div className="text-center p-5">
      <h2 className="text-2xl font-semibold mb-5">Find Distance with Leaflet Map</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 justify-center items-center">
        <input type="text" placeholder="Enter Source" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} required className="p-2 border border-gray-300 rounded-md" />
        <button type="button" onClick={fetchCurrentLocation} className="bg-blue-500 text-white px-4 py-2 rounded-md">📍 Use My Location</button>
        <input type="text" placeholder="Enter Destination" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} required className="p-2 border border-gray-300 rounded-md" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Find</button>
      </form>
      {distance && <h3 className="mt-4 text-lg font-bold">Distance: {distance} km</h3>}
      <div className="h-[400px] w-[90%] mt-5 mx-auto rounded-xl overflow-hidden border border-gray-300">
        <MapContainer key={mapKey} center={[20, 78]} zoom={5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routeCoords.length > 0 && (
            <>
              <Marker position={routeCoords[0]} icon={greenIcon} />
              <Marker position={routeCoords[routeCoords.length - 1]} icon={redIcon} />
              <Polyline positions={routeCoords} color="blue" weight={4} />
              <FitMapBounds routeCoords={routeCoords} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;
