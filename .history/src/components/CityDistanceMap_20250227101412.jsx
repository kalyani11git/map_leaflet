import { useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Switch } from "@headlessui/react";

const API_KEY = "YOUR_OPENROUTESERVICE_API_KEY"; // Replace with your API key

function MapComponent() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [shortestPath, setShortestPath] = useState(false);

  const fetchRoute = async () => {
    if (!from || !to) return alert("Please enter both cities!");

    try {
      // Convert city names to coordinates
      const geocode = async (place) => {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
        );
        return [res.data[0].lon, res.data[0].lat]; // Return longitude, latitude
      };

      const fromCoords = await geocode(from);
      const toCoords = await geocode(to);

      // Get route from OpenRouteService
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
        {
          coordinates: [fromCoords, toCoords],
          options: { avoid_features: shortestPath ? ["tollways"] : [] },
        },
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
        }
      );

      const routeCoords = response.data.features[0].geometry.coordinates;
      setCoordinates(routeCoords.map(([lon, lat]) => [lat, lon]));
      setDistance(response.data.features[0].properties.segments[0].distance / 1000); // Convert to km
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Failed to fetch route. Check city names!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-semibold text-center">Find Route</h2>
        <input
          type="text"
          placeholder="From (e.g., New York)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="To (e.g., Los Angeles)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={fetchRoute}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>

        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-700">Shortest Path</span>
          <Switch
            checked={shortestPath}
            onChange={setShortestPath}
            className={`${shortestPath ? "bg-blue-600" : "bg-gray-300"} 
            relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${shortestPath ? "translate-x-6" : "translate-x-1"} 
              inline-block h-4 w-4 transform bg-white rounded-full transition`}
            />
          </Switch>
        </div>

        {distance !== null && (
          <p className="text-center text-lg font-medium">
            Distance: {distance.toFixed(2)} km
          </p>
        )}
      </div>

      {/* Map Display */}
      <div className="mt-6 w-full max-w-4xl h-96">
        <MapContainer center={[40, -100]} zoom={4} className="w-full h-full rounded-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {coordinates.length > 0 && (
            <Polyline positions={coordinates} color="blue" weight={5} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapComponent;
