import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from "react";

const points = [
  { 
    id: 1, 
    position: [-18.8792, 47.5079], 
    title: "Route endommagée",
    description: "Nid-de-poule important sur 10m de long",
    status: "en cours",
    date: "2026-01-15",
    entreprise: "ABC Construction"
  },
  { 
    id: 2, 
    position: [-18.9100, 47.5250], 
    title: "Travaux de revêtement",
    description: "Renouvellement du revêtement asphaltique",
    status: "nouveau",
    date: "2026-01-20",
    entreprise: "XYZ Travaux"
  },
  { 
    id: 3, 
    position: [-18.8650, 47.5350], 
    title: "Réparation de pont",
    description: "Renforcement structurel du pont",
    status: "termine",
    date: "2026-01-10",
    entreprise: "InfraPlus"
  },
];

// Correction des icônes Leaflet pour React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getStatusColor = (status) => {
  switch(status) {
    case 'termine': return '#4caf50';
    case 'en cours': return '#ffc107';
    case 'nouveau': return '#2196f3';
    default: return '#9e9e9e';
  }
};

// Icône personnalisée
const createCustomIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50%;
          opacity: 0.8;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          top: 10px;
          left: 10px;
        "></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function Map() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/issues")
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du chargement des points");
        return res.json();
      })
      .then(data => {
        setPoints(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">
          🗺️ Carte des travaux
        </h1>
        <p className="page-subtitle">
          Visualisation géographique des points de travaux en cours et planifiés
        </p>
      </div>
      <div className="content-container" style={{height: 600, margin: '0 auto', maxWidth: 900}}>
        {loading && <div>Chargement des points...</div>}
        {error && <div style={{color: 'red'}}>{error}</div>}
        {!loading && !error && (
          <MapContainer center={[-18.8792, 47.5079]} zoom={13} style={{height: 600, width: '100%'}}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {points.map((pt, idx) => (
              <Marker
                key={pt.id || idx}
                position={[pt.latitude, pt.longitude]}
                icon={createCustomIcon(getStatusColor(pt.status))}
              >
                <Popup>
                  <div>
                    <strong>{pt.titre || 'Travaux routier'}</strong><br/>
                    <span>Status : <b style={{color: getStatusColor(pt.status)}}>{pt.status}</b></span><br/>
                    <span>Date : {pt.date || '-'}</span><br/>
                    <span>Surface : {pt.surface || '-'} m²</span><br/>
                    <span>Budget : {pt.budget || '-'} Ar</span><br/>
                    <span>Entreprise : {pt.entreprise || '-'}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}