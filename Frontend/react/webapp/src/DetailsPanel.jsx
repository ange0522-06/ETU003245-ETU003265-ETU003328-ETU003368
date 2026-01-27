import React from "react";

export default function DetailsPanel({ point }) {
  if (!point) {
    return <div style={{padding: 24, color: '#888'}}>Sélectionnez un point sur la carte pour voir les détails.</div>;
  }
  return (
    <div style={{padding: 24, minWidth: 320, maxWidth: 400, background: '#fafaff', borderLeft: '1px solid #eee', height: 600}}>
      <h3 style={{marginBottom: 16}}>{point.titre || 'Travaux routier'}</h3>
      <ul style={{listStyle: 'none', padding: 0, fontSize: 16}}>
        <li><b>Status :</b> <span style={{color: point.status === 'termine' ? '#4caf50' : point.status === 'en cours' ? '#ffc107' : '#2196f3'}}>{point.status}</span></li>
        <li><b>Date :</b> {point.date || '-'}</li>
        <li><b>Surface :</b> {point.surface || '-'} m²</li>
        <li><b>Budget :</b> {point.budget || '-'} Ar</li>
        <li><b>Entreprise :</b> {point.entreprise || '-'}</li>
        <li><b>Coordonnées :</b> [{point.latitude}, {point.longitude}]</li>
      </ul>
    </div>
  );
}
