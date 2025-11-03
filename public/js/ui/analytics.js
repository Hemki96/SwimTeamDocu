
import { apiGet } from '../api.js';
import { cardClass, containerClass, mutedTextClass, sectionTitleClass, subtleCardClass } from './styles.js';

export async function viewAnalytics(){
  const el = document.createElement('div');
  el.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Analysen</h2><p class="${mutedTextClass}">Lade...</p>`;
  el.appendChild(card);

  const teamId = 'TEAM-A';
  const data = await apiGet(`/api/analytics/team/${teamId}?from=2025-01-01&to=2025-12-31`);
  card.innerHTML = `
    <h2 class="${sectionTitleClass}">Analysen – Team ${teamId}</h2>
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="${subtleCardClass}">
        <p class="${mutedTextClass}">Sessions</p>
        <p class="text-3xl font-semibold text-slate-100">${data.sessions}</p>
      </div>
      <div class="${subtleCardClass}">
        <p class="${mutedTextClass}">Summe Distanz (geschätzt)</p>
        <p class="text-3xl font-semibold text-slate-100">${data.estimated_distance_m} m</p>
      </div>
      <div class="${subtleCardClass}">
        <p class="${mutedTextClass}">Anwesenheitsquote (Demo)</p>
        <p class="text-3xl font-semibold text-slate-100">${Math.round((data.attendance_rate||0)*100)}%</p>
      </div>
    </div>
  `;
  return el;
}
