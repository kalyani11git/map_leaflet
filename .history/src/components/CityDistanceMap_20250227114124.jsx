import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyDLFPvPfbisg0L5mKddcRLlad7EFynZalI"; // Your API Key

const CityDistanceMap = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [route, setRoute] = useState([]);
  const [center, setCenter] = useState([20, 0]); // Default center

  // Convert city name to coordinates using Google Geocoding API
  const getCoordinates = async (city) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const location = response.data.results[0].geometry.location;
      return [location.lat, location.lng]; // Return [lat, lng]
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  // Fetch route using Google Directions API
  const fetchRoute = async () => {
    try {
      const fromCoords = await getCoordinates(from);
      const toCoords = await getCoordinates(to);

      if (!fromCoords || !toCoords) {
        alert("Invalid city names. Please enter correct locations.");
        return;
      }

      setCenter(fromCoords); // Center map on starting city

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${fromCoords[0]},${fromCoords[1]}&destination=${toCoords[0]},${toCoords[1]}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
      );

      const points = response.data.routes[0].overview_polyline.points;
      const decodedPoints = decodePolyline(points);
      setRoute(decodedPoints);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Decode polyline to coordinates
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b, shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-5">
      {/* Input fields */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="From (City Name)"
          className="border p-2"
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="text"
          placeholder="To (City Name)"
          className="border p-2"
          onChange={(e) => setTo(e.target.value)}
        />
        <button onClick={fetchRoute} className="bg-blue-500 text-white px-4 py-2">
          Get Route
        </button>
      </div>

      {/* Map Container */}
      <MapContainer center={center} zoom={5} className="w-full h-[500px]">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default CityDistanceMap;
