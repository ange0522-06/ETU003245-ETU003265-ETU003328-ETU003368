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
import { getSignalementsApi, getSignalementsFromFirebase } from "./api";
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
  const [source, setSource] = useState('firebase'); // 'sql' ou 'firebase'
  const { profile } = useProfile();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Filtrer uniquement les signalements avec coordonnées GPS valides
  const validPoints = points.filter(p => 
    p.latitude && p.longitude && 
    !isNaN(p.latitude) && !isNaN(p.longitude) &&
    p.latitude !== 0 && p.longitude !== 0
  );

  // Décaler légèrement les marqueurs qui ont les mêmes coordonnées
  const adjustedPoints = validPoints.map((point, index) => {
    const duplicates = validPoints.filter(p => 
      Math.abs(p.latitude - point.latitude) < 0.00001 && 
      Math.abs(p.longitude - point.longitude) < 0.00001
    );
    
    if (duplicates.length > 1) {
      const dupIndex = duplicates.findIndex(p => p.id === point.id);
      // Décalage en cercle autour du point original
      const angle = (dupIndex * 360 / duplicates.length) * (Math.PI / 180);
      const offset = 0.0005; // ~50m de décalage
      return {
        ...point,
        latitude: point.latitude + (offset * Math.sin(angle)),
        longitude: point.longitude + (offset * Math.cos(angle))
      };
    }
    return point;
  });

  const loadSignalements = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let data;
      
      if (source === 'firebase') {
        // Récupérer depuis Firebase
        const firebaseData = await getSignalementsFromFirebase(token);
        // Mapper les données Firebase vers le format attendu
        data = firebaseData.map(s => ({
          id: s.idSignalement || s.id,
          status: s.statut || s.status,
          date: s.dateSignalement ? s.dateSignalement.split('T')[0] : s.date || '',
          surface: s.surfaceM2 || s.surface,
          budget: s.budget,
          entreprise: s.entreprise,
          titre: s.titre,
          latitude: s.latitude,
          longitude: s.longitude,
          description: s.description,
          id_user: s.id_user,
          niveau: s.niveau || 1,
          dateNouveau: s.dateNouveau,
          dateEnCours: s.dateEnCours,
          dateTermine: s.dateTermine,
          avancement: s.avancement
        }));
      } else {
        // Récupérer depuis SQL
        data = await getSignalementsApi(token);
      }
      
      setPoints(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des points");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignalements();
  }, [profile, source]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("🌍 Mode ONLINE");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("📴 Mode OFFLINE");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="map-page">
      <div className="page-header">
        <h1 className="page-title">
          Carte des travaux
        </h1>
        <p className="page-subtitle">
          Visualisation géographique des points de travaux en cours et planifiés
        </p>
        {!loading && (
          <div style={{marginTop: '12px', padding: '8px 16px', background: validPoints.length < points.length ? '#fff3cd' : '#d4edda', borderRadius: '6px', display: 'inline-block'}}>
            <strong>📍 {validPoints.length}</strong> signalement(s) affiché(s) sur la carte (sur <strong>{points.length}</strong> au total)
            {validPoints.length < points.length && (
              <span style={{marginLeft: '8px', color: '#856404'}}>
                ⚠️ {points.length - validPoints.length} sans coordonnées GPS
              </span>
            )}
          </div>
        )}
        <div style={{marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center'}}>
          <button
            onClick={() => setSource('firebase')}
            style={{
              padding: '10px 20px',
              background: source === 'firebase' ? '#2196f3' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: source === 'firebase' ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            📥 Firebase (Mobile)
          </button>
          <button
            onClick={() => setSource('sql')}
            style={{
              padding: '10px 20px',
              background: source === 'sql' ? '#4caf50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: source === 'sql' ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            💾 SQL (Web)
          </button>
        </div>
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
                url={
                  isOnline
                    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    : "http://localhost:8085/styles/basic/{z}/{x}/{y}.png"
                }
                attribution="&copy; OpenStreetMap contributors"
              />
              {adjustedPoints.map((pt) => (
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
                        <div><span style={{color: '#666'}}>Niveau :</span> <b style={{color: '#9c27b0'}}>{pt.niveau || 1}/10</b></div>
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