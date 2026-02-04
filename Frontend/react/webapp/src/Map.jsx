import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from "react";
import DetailsPanel from "./DetailsPanel";
import { getSignalementsApi } from "./api";
import { useProfile } from "./ProfileContext";

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
}

export default function Map() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const { profile } = useProfile();

  useEffect(() => {
    setLoading(true);
    setError("");
    getSignalementsApi(localStorage.getItem("token"))
      .then(data => {
        setPoints(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Erreur lors du chargement des points");
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="map-page">
      <div className="page-header">
        <h1 className="page-title">
          🗺️ Carte des travaux
        </h1>
        <p className="page-subtitle">
          Visualisation géographique des points de travaux en cours et planifiés
        </p>
      </div>
      
      <div style={{display: 'flex', alignItems: 'stretch', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', margin: '0 auto', maxWidth: '1400px'}}>
        <div className="content-container" style={{flex: 1, minWidth: 350, minHeight: 600, maxWidth: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
          {loading && <div style={{textAlign: 'center', padding: '40px', color: '#2c3e50'}}>Chargement des points...</div>}
          {error && <div style={{color: 'red', textAlign: 'center'}}>{error}</div>}
          {!loading && !error && (
            <MapContainer 
              center={[-18.8792, 47.5079]} 
              zoom={13} 
              style={{height: 560, width: '100%', borderRadius: '12px'}}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {points.map((pt) => (
                <Marker
                  key={pt.id}
                  position={[pt.latitude, pt.longitude]}
                  icon={createCustomIcon(getStatusColor(pt.status))}
                  eventHandlers={{
                    click: () => setSelectedPoint(pt),
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup>
                    <div style={{padding: '10px'}}>
                      <strong style={{fontSize: '16px'}}>{pt.titre || 'Travaux routier'}</strong><br/>
                      <span>Status : <b style={{color: getStatusColor(pt.status)}}>{pt.status}</b></span><br/>
                      <span>Date : {pt.date || '-'} </span><br/>
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
        
        <div className="content-container" style={{width: 380, minWidth: 320, minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
          <div style={{width: '100%', height: '100%', padding: 20}}>
            <DetailsPanel point={selectedPoint} />
          </div>
        </div>
      </div>
      
      {/* Tableau récapitulatif déplacé dans Dashboard */}
    </div>
  );
}