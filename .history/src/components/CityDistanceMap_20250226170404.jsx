import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Example geocoding function (you can replace this with a real geocoding API)
const getCoordinates = async (cityName) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?city=${cityName}&country=India&format=json`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();
  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  }
  return null;
};

// Haversine formula to calculate the distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2); // Return distance rounded to 2 decimal places
};

const CityMap = () => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCoordinates, setFromCoordinates] = useState(null);
  const [toCoordinates, setToCoordinates] = useState(null);
  const [distance, setDistance] = useState(null);

  const [showMarkers, setShowMarkers] = useState(false); // For controlling marker display

  useEffect(() => {
    if (fromCity && toCity && showMarkers) {
      // Fetch coordinates for both cities when both are entered
      const fetchCoordinates = async () => {
        const fromCoords = await getCoordinates(fromCity);
        const toCoords = await getCoordinates(toCity);

        if (fromCoords && toCoords) {
          setFromCoordinates(fromCoords);
          setToCoordinates(toCoords);

          // Calculate the distance between cities
          const dist = calculateDistance(
            fromCoords.lat,
            fromCoords.lon,
            toCoords.lat,
            toCoords.lon
          );
          setDistance(dist);
        }
      };

      fetchCoordinates();
    }
  }, [fromCity, toCity, showMarkers]);

  const handleSubmit = () => {
    if (fromCity && toCity) {
      setShowMarkers(true); // Only show markers when both cities are entered and submit is clicked
    }
  };

  const handleSwitch = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="From City"
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={handleSwitch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Switch
        </button>
        <input
          type="text"
          placeholder="To City"
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          className="px-4 py-2 border rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Submit
      </button>

      {distance && showMarkers && (
        <p className="mt-4 text-xl text-center">
          Distance between {fromCity} and {toCity}: {distance} km
        </p>
      )}

      <MapContainer
        center={[20.5937, 78.9629]} // Center on India
        zoom={5} // Adjust zoom level to focus on India
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap tiles
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {fromCoordinates && showMarkers && (
          <Marker position={fromCoordinates}>
            <Popup>{fromCity}</Popup>
          </Marker>
        )}

        {toCoordinates && showMarkers && (
          <Marker position={toCoordinates}>
            <Popup>{toCity}</Popup>
          </Marker>
        )}

        {/* Drawing the line between the two cities */}
        {fromCoordinates && toCoordinates && showMarkers && (
          <Polyline
            positions={[
              [fromCoordinates.lat, fromCoordinates.lon],
              [toCoordinates.lat, toCoordinates.lon],
            ]}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default CityMap;
