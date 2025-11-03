
import { apiGet } from '../api.js';

export async function viewSessions(){
  const container = document.createElement('div');
  container.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Sessions</h2><p>Lade Sitzungen...</p>`;
  container.appendChild(card);

  try{
    const list = await apiGet('/api/sessions');
    const rows = list.map(s => `<tr>
<td><a href='#/session/${s.id}'>${s.id}</a></td>
<td>${s.teamId||''}</td>
<td>${s.date||''}</td>
<td>${s.time||''}</td>
<td>${s.location||''}</td>
<td>${s.status||''}</td>
<td><a class='btn' href='#/attendance/${s.id}'>Anwesenheit</a></td>
</tr>`).join('');
    card.innerHTML = `
      <h2>Sessions</h2>
      <table>
        <thead><tr><th>ID</th><th>Team</th><th>Datum</th><th>Uhrzeit</th><th>Ort</th><th>Status</th><th>Aktion</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }catch(e){
    card.innerHTML = `<h2>Sessions</h2><p>Fehler: ${e}</p>`;
  }
  return container;
}
