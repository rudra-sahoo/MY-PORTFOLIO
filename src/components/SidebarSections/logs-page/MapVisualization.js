import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapVisualization = ({ logs }) => {
  // Filter out logs without valid location data
  const validLogs = logs.filter(log => log.location && log.location.lat && log.location.lng);

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validLogs.map((log, index) => (
        <Marker key={index} position={[log.location.lat, log.location.lng]}>
          <Popup>
            IP: {log.ip}<br />
            ISP: {log.isp}<br />
            Location: {log.location}<br />
            Postal Code: {log.postalCode}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapVisualization;
