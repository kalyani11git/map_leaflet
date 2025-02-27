import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic3ViaGFtcHJlZXQiLCJhIjoiY2toY2IwejF1MDdodzJxbWRuZHAweDV6aiJ9.Ys8MP5kVTk5P9V2TDvnuDg";

const MapComponent = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setupMap([position.coords.longitude, position.coords.latitude]),
      () => setupMap([-2.24, 53.48]), // Default location in case of error
      { enableHighAccuracy: true }
    );

    function setupMap(center) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: 15,
      });

      map.addControl(new mapboxgl.NavigationControl());
      
      const directions = new MapboxDirections({ accessToken: mapboxgl.accessToken });
      map.addControl(directions, "top-left");
    }
  }, []);

  return <div ref={mapContainer} className="w-screen h-screen" />;
};

export default MapComponent;