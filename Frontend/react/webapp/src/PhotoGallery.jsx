import React, { useState, useEffect } from 'react';
import { getPhotosApi, uploadPhotoApi, deletePhotoApi } from './api';

export default function PhotoGallery({ signalementId, canEdit = false }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadPhotos();
  }, [signalementId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getPhotosApi(signalementId);
      setPhotos(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);
      await uploadPhotoApi(signalementId, file, token);
      await loadPhotos();
      e.target.value = ''; // Reset input
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      return;
    }

    try {
      await deletePhotoApi(signalementId, photoId, token);
      await loadPhotos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Chargement des photos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        📷 Photos ({photos.length})
      </h3>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '20px', padding: '12px', background: '#ffe0e0', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Upload button pour Manager */}
      {canEdit && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: uploading ? '#9e9e9e' : '#2196f3',
            color: 'white',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}>
            {uploading ? '⏳ Upload en cours...' : '➕ Ajouter une photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {/* Galerie de photos */}
      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
          <p>Aucune photo pour ce signalement</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {photos.map(photo => (
            <div key={photo.idPhoto} style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'none',
              cursor: 'pointer'
            }}>
              <img
                src={`http://localhost:8080${photo.urlPhoto}`}
                alt={`Photo ${photo.idPhoto}`}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                }}
              />
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.idPhoto);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 107, 107, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Supprimer"
                >
                  🗑️
                </button>
              )}
              <div style={{
                padding: '8px',
                background: '#f5f5f5',
                fontSize: '12px',
                color: '#666'
              }}>
                {new Date(photo.dateAjout).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox pour agrandir la photo */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer'
          }}
        >
          <img
            src={`http://localhost:8080${selectedPhoto.urlPhoto}`}
            alt="Photo agrandie"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
