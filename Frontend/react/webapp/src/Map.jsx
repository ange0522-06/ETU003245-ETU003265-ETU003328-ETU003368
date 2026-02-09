import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from "react";
import DetailsPanel from "./DetailsPanel";
import RecapTable from "./RecapTable";
import PhotoGallery from "./PhotoGallery";
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
  const [showPhotos, setShowPhotos] = useState(null); // null ou l'id du signalement
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
          Carte des travaux
        </h1>
        <p className="page-subtitle">
          Visualisation géographique des points de travaux en cours et planifiés
        </p>
      </div>
      
      <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px', width: '100%'}}>
        <div className="content-container" style={{flex: 3, minHeight: 700, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: 0}}>
          {loading && <div style={{textAlign: 'center', padding: '40px', color: '#2c3e50'}}>Chargement des points...</div>}
          {error && <div style={{color: 'red', textAlign: 'center'}}>{error}</div>}
          {!loading && !error && (
            <MapContainer 
              center={[-18.8792, 47.5079]} 
              zoom={13} 
              style={{height: '100%', width: '100%', borderRadius: '12px'}}
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
                    <div style={{padding: '10px', minWidth: '220px'}}>
                      <strong style={{fontSize: '16px', display: 'block', marginBottom: '8px'}}>{pt.titre || 'Travaux routier'}</strong>
                      <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                        <div><span style={{color: '#666'}}>Status :</span> <b style={{color: getStatusColor(pt.status)}}>{pt.status}</b></div>
                        <div><span style={{color: '#666'}}>Date :</span> {pt.date || '-'}</div>
                        <div><span style={{color: '#666'}}>Surface :</span> {pt.surface || '-'} m²</div>
                        <div><span style={{color: '#666'}}>Budget :</span> {pt.budget ? `${pt.budget.toLocaleString()} Ar` : '-'}</div>
                        <div><span style={{color: '#666'}}>Entreprise :</span> {pt.entreprise || '-'}</div>
                        <div style={{marginTop: '8px', paddingTop: '8px', borderTop: 'none'}}>
                          <button
                            onClick={() => setShowPhotos(pt.id)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#2196f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            📷 Voir les photos
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
        
        {selectedPoint && (
          <div className="content-container" style={{flex: 1, minHeight: 700, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: 0, overflow: 'auto'}}>
            <div style={{width: '100%', height: '100%', padding: 20}}>
              <DetailsPanel point={selectedPoint} />
            </div>
          </div>
        )}
      </div>
      
      {/* Tableau récapitulatif */}
      {!loading && !error && points.length > 0 && (
        <RecapTable points={points} />
      )}

      {/* Modal Galerie de Photos */}
      {showPhotos && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowPhotos(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPhotos(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✕ Fermer
            </button>
            <h2 style={{marginTop: 0, marginBottom: 20}}>Photos du signalement #{showPhotos}</h2>
            <PhotoGallery signalementId={showPhotos} canEdit={false} />
          </div>
        </div>
      )}
    </div>
  );
}