import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const Map = () => {
  return (
    <MapContainer
      center={[-18.8792, 47.5079]} // Antananarivo
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="http://localhost:8085/styles/basic/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
};

export default Map;
