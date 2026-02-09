import React from "react";

export default function RecapTable({ points }) {
  const nb = points.length;
  const totalSurface = points.reduce((sum, p) => sum + (p.surface || 0), 0);
  const totalBudget = points.reduce((sum, p) => sum + (p.budget || 0), 0);
  
  // Calcul de l'avancement : nouveau=0%, en cours=50%, terminé=100%
  const calculerAvancement = (status) => {
    if (!status) return 0;
    switch (status.toLowerCase()) {
      case 'nouveau': return 0;
      case 'en cours': return 50;
      case 'termine': case 'terminé': return 100;
      default: return 0;
    }
  };
  
  const avancementTotal = points.reduce((sum, p) => sum + calculerAvancement(p.status), 0);
  const avancement = nb > 0 ? Math.round(avancementTotal / nb) : 0;

  return (
    <div style={{margin: '32px 0', background: '#fff', borderRadius: 8, boxShadow: 'none', padding: 24}}>
      <h3 style={{margin: '0 0 20px 0', color: '#2c3e50', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        📊 Tableau de récapitulation
      </h3>
      <table style={{width: '100%', fontSize: 16, borderCollapse: 'collapse'}}>
        <tbody>
          <tr style={{borderBottom: 'none'}}>
            <td style={{padding: '12px 8px', color: '#555'}}>Nombre de points</td>
            <td style={{padding: '12px 8px', textAlign: 'right'}}><b style={{color: '#2196f3', fontSize: '18px'}}>{nb}</b></td>
          </tr>
          <tr style={{borderBottom: 'none'}}>
            <td style={{padding: '12px 8px', color: '#555'}}>Total surface</td>
            <td style={{padding: '12px 8px', textAlign: 'right'}}><b style={{color: '#ff9800', fontSize: '18px'}}>{totalSurface.toLocaleString()} m²</b></td>
          </tr>
          <tr style={{borderBottom: 'none'}}>
            <td style={{padding: '12px 8px', color: '#555'}}>Avancement</td>
            <td style={{padding: '12px 8px', textAlign: 'right'}}>
              <b style={{color: avancement === 100 ? '#4caf50' : avancement >= 50 ? '#ffc107' : '#2196f3', fontSize: '18px'}}>{avancement} %</b>
            </td>
          </tr>
          <tr>
            <td style={{padding: '12px 8px', color: '#555'}}>Total budget</td>
            <td style={{padding: '12px 8px', textAlign: 'right'}}><b style={{color: '#4caf50', fontSize: '18px'}}>{totalBudget.toLocaleString()} Ar</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
