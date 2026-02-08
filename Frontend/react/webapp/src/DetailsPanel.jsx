import React, { useState } from "react";
import PhotoGallery from "./PhotoGallery";

export default function DetailsPanel({ point }) {
  const [showPhotos, setShowPhotos] = useState(false);
  
  if (!point) {
    return (
      <div style={{padding: 24, color: '#888', textAlign: 'center'}}>
        <div style={{fontSize: '48px', marginBottom: '12px'}}>📍</div>
        <p>Sélectionnez un point sur la carte pour voir les détails.</p>
      </div>
    );
  }
  
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'termine': case 'terminé': return '#4caf50';
      case 'en cours': return '#ffc107';
      case 'nouveau': return '#2196f3';
      default: return '#9e9e9e';
    }
  };
  
  return (
    <>
      <div style={{padding: 24, minWidth: 320, maxWidth: 400, background: '#fafaff', borderLeft: '1px solid #eee', height: '100%', overflow: 'auto'}}>
        <h3 style={{marginBottom: 16, color: '#2c3e50', fontSize: '20px'}}>{point.titre || 'Travaux routier'}</h3>
        <ul style={{listStyle: 'none', padding: 0, fontSize: 15, lineHeight: '2'}}>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Status :</span>{' '}
            <span style={{
              color: getStatusColor(point.status), 
              fontWeight: 'bold',
              padding: '4px 12px',
              borderRadius: '12px',
              background: getStatusColor(point.status) + '20'
            }}>
              {point.status}
            </span>
          </li>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Date :</span> <b>{point.date || '-'}</b>
          </li>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Surface :</span> <b>{point.surface || '-'} m²</b>
          </li>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Budget :</span> <b>{point.budget ? `${point.budget.toLocaleString()} Ar` : '-'}</b>
          </li>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Entreprise :</span> <b>{point.entreprise || '-'}</b>
          </li>
          <li style={{padding: '8px 0', borderBottom: '1px solid #f0f0f0'}}>
            <span style={{color: '#666'}}>Coordonnées :</span> <span style={{fontSize: '13px', color: '#888'}}>[{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}]</span>
          </li>
        </ul>
        
        <div style={{marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #eee'}}>
          <button
            onClick={() => setShowPhotos(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📷 Voir les photos
          </button>
        </div>
      </div>

      {/* Modal de la galerie de photos */}
      {showPhotos && (
        <div
          onClick={() => setShowPhotos(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowPhotos(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>
            <PhotoGallery signalementId={point.id} canEdit={false} />
          </div>
        </div>
      )}
    </>
  );
}
