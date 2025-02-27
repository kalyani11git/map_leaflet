import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Define custom icons for Source (Green) and Destination (Red)
const sourceIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Component to adjust map bounds when the route updates
const FitMapBounds = ({ routeCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = routeCoords.map((coord) => [coord[0], coord[1]]);
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

  // Get user location
  const fetchCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: { lat: latitude, lon: longitude, format: "json" },
          });
          setStartLocation(response.data.display_name);
        } catch (error) {
          alert("Failed to fetch current location.");
        }
      },
      () => alert("Location access denied.")
    );
  };

  // Fetch coordinates from OpenStreetMap API
  const fetchCoordinates = async (location) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: location, format: "json", limit: 1 },
      });
      if (response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      } else {
        alert(`Location "${location}" not found.`);
        return null;
      }
    } catch (error) {
      alert("Failed to get location.");
      return null;
    }
  };

  // Handle form submission and fetch route
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
        const coordinates = routeResponse.data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
        setDistance((routeResponse.data.routes[0].distance / 1000).toFixed(2));
        setMapKey((prevKey) => prevKey + 1);
      } else {
        alert("No route found.");
      }
    } catch (error) {
      alert("Failed to get route.");
    }
  };

  // Swap source and destination
  const switchLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  return (
    <div className="text-center p-6">
      <h2 className="text-3xl font-bold mb-4">Find Distance with Leaflet Map</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 justify-center items-center mb-4">
        <input
          type="text"
          placeholder="Enter Source"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={fetchCurrentLocation}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          📍 Use My Location
        </button>
        <button
          type="button"
          onClick={switchLocations}
          className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
        >
          ⇄ Switch
        </button>
        <input
          type="text"
          placeholder="Enter Destination"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Find
        </button>
      </form>

      {distance && <h3 className="text-xl font-semibold mt-3">Distance: {distance} km</h3>}

      <div className="h-[400px] w-[90%] mt-6 mx-auto rounded-lg overflow-hidden border border-gray-300">
        <MapContainer key={mapKey} center={[20, 78]} zoom={5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routeCoords.length > 0 && (
            <>
              <Marker position={routeCoords[0]} icon={sourceIcon} />
              <Marker position={routeCoords[routeCoords.length - 1]} icon={destinationIcon} />
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
