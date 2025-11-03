
import { apiGet } from '../api.js';

export async function viewAnalytics(){
  const el = document.createElement('div');
  el.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Analysen</h2><p>Lade...</p>`;
  el.appendChild(card);

  const teamId = 'TEAM-A';
  const data = await apiGet(`/api/analytics/team/${teamId}?from=2025-01-01&to=2025-12-31`);
  card.innerHTML = `<h2>Analysen – Team ${teamId}</h2>
    <p>Sessions: ${data.sessions}</p>
    <p>Summe Distanz (geschätzt): ${data.estimated_distance_m} m</p>
    <p>Anwesenheitsquote (Demo): ${Math.round((data.attendance_rate||0)*100)}%</p>
  `;
  return el;
}
