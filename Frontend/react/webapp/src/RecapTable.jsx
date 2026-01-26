import React from "react";

export default function RecapTable({ points }) {
  const nb = points.length;
  const totalSurface = points.reduce((sum, p) => sum + (p.surface || 0), 0);
  const totalBudget = points.reduce((sum, p) => sum + (p.budget || 0), 0);
  const nbTermine = points.filter(p => p.status === 'termine').length;
  const avancement = nb ? Math.round((nbTermine / nb) * 100) : 0;

  return (
    <div style={{margin: '32px auto', maxWidth: 600, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24}}>
      <h3>Tableau de récapitulation</h3>
      <table style={{width: '100%', fontSize: 16, borderCollapse: 'collapse'}}>
        <tbody>
          <tr><td>Nombre de points</td><td><b>{nb}</b></td></tr>
          <tr><td>Total surface</td><td><b>{totalSurface} m²</b></td></tr>
          <tr><td>Avancement</td><td><b>{avancement} %</b></td></tr>
          <tr><td>Total budget</td><td><b>{totalBudget} Ar</b></td></tr>
        </tbody>
      </table>
    </div>
  );
}
