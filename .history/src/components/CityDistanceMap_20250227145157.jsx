import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Component to fit map bounds when route updates
const FitMapBounds = ({ routeCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = routeCoords.map(coord => [coord[0], coord[1]]);
      map.fitBounds(bounds, { padding: [30, 30] }); // Reduced padding for better fit
    }
  }, [routeCoords, map]);

  return null;
};

const MapComponent = () => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [mapKey, setMapKey] = useState(0); // To re-render the map

  // Fetch coordinates from OpenStreetMap Nominatim API
  const fetchCoordinates = async (location) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: location, format: "json", limit: 1 },
      });

      if (response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      } else {
        alert(`Location "${location}" not found. Try another.`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Failed to get location. Check network connection.");
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
        const coordinates = routeResponse.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
        setDistance((routeResponse.data.routes[0].distance / 1000).toFixed(2)); // Convert meters to km
        setMapKey(prevKey => prevKey + 1);
      } else {
        alert("No route found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Failed to get route. Check network connection.");
    }
  };

  // Swap locations
  const switchLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 className="text-2xl mb-5">Find Distance with Leaflet Map</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Enter Source Location"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          type="button"
          onClick={switchLocations}
          style={{
            padding: "8px 15px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ⇄
        </button>
        <input
          type="text"
          placeholder="Enter End Location"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Find
        </button>
      </form>

      {distance && <h3>Distance: {distance} km</h3>}

      <div  style={{ height: "400px", width: "90%", marginTop: "50px", margin: "auto", borderRadius: "10px", overflow: "hidden" }}>
        <MapContainer key={mapKey} center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routeCoords.length > 0 && (
            <>
              <Marker position={routeCoords[0]} />
              <Marker position={routeCoords[routeCoords.length - 1]} />
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
