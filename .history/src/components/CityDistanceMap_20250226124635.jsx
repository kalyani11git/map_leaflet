import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CityDistanceMap = () => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ from: null, to: null });

  // Function to handle city input change
  const handleCityChange = (event, type) => {
    const value = event.target.value;
    if (type === 'from') {
      setFromCity(value);
    } else {
      setToCity(value);
    }
  };

  // Function to fetch coordinates (for example, using OpenCage Geocoder)
  const fetchCoordinates = async (city) => {
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: city,
          key: 'YOUR_OPENCAGE_API_KEY',  // You can get this key from OpenCage Geocoder
        },
      });

      if (response.data.results.length > 0) {
        return response.data.results[0].geometry;
      } else {
        throw new Error('City not found');
      }
    } catch (error) {
      setError('Could not fetch coordinates for the city');
      return null;
    }
  };

  // Function to get distance using Google Maps API
  const fetchDistance = async () => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
        params: {
          origins: fromCity,
          destinations: toCity,
          key: 'AIzaSyDHrPLPd6lNPx_su11v2JGaDy5MjvIhaxk', // Google Maps API Key
        },
      });

      if (response.data.rows[0].elements[0].status === 'OK') {
        setDistance(response.data.rows[0].elements[0].distance.text);
        
        // Fetch coordinates for both cities
        const fromCoords = await fetchCoordinates(fromCity);
        const toCoords = await fetchCoordinates(toCity);
        
        setCoordinates({
          from: fromCoords,
          to: toCoords,
        });
      } else {
        setError('Could not find a valid route.');
      }
    } catch (err) {
      setError('An error occurred while fetching the distance.');
    }
  };

  // Switch cities
  const switchCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">City Distance and Map</h2>
      <div className="space-y-4 mb-5">
        <div>
          <input
            type="text"
            placeholder="From City"
            value={fromCity}
            onChange={(e) => handleCityChange(e, 'from')}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="To City"
            value={toCity}
            onChange={(e) => handleCityChange(e, 'to')}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <button
            onClick={fetchDistance}
            className="btn btn-primary w-full"
          >
            Get Distance
          </button>
        </div>
        <div>
          <button
            onClick={switchCities}
            className="btn btn-secondary w-full mt-2"
          >
            Switch Cities
          </button>
        </div>
        {distance && <div className="mt-4">Distance: {distance}</div>}
        {error && <div className="text-red-500">{error}</div>}
      </div>

      {coordinates.from && coordinates.to && (
        <div className="h-80">
          <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coordinates.from.lat, coordinates.from.lng]}>
              <Popup>{fromCity}</Popup>
            </Marker>
            <Marker position={[coordinates.to.lat, coordinates.to.lng]}>
              <Popup>{toCity}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CityDistanceMap;
