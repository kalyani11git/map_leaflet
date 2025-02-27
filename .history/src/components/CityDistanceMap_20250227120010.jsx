import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const defaultCenter = { lat: 53.48, lng: -2.24 }; // Default location

const MapComponent = () => {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        console.warn("Geolocation permission denied, using default location.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchDirections = () => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: { lat: 53.35, lng: -6.26 }, // Example destination
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={currentLocation} zoom={15}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <button
        className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={fetchDirections}
      >
        Get Directions
      </button>
    </LoadScript>
  );
};

export default MapComponent;
