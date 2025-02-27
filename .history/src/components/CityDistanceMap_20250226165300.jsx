import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Example geocoding function (you can replace this with a real geocoding API)
const getCoordinates = async (cityName) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json`;
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

const CityMap = () => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCoordinates, setFromCoordinates] = useState(null);
  const [toCoordinates, setToCoordinates] = useState(null);

  const [cities, setCities] = useState({
    from: { name: '', coordinates: null },
    to: { name: '', coordinates: null },
  });

  useEffect(() => {
    if (fromCity) {
      getCoordinates(fromCity).then((coords) => {
        if (coords) setFromCoordinates(coords);
      });
    }
    if (toCity) {
      getCoordinates(toCity).then((coords) => {
        if (coords) setToCoordinates(coords);
      });
    }
  }, [fromCity, toCity]);

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

      <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {fromCoordinates && (
          <Marker position={fromCoordinates}>
            <Popup>{fromCity}</Popup>
          </Marker>
        )}

        {toCoordinates && (
          <Marker position={toCoordinates}>
            <Popup>{toCity}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default CityMap;
