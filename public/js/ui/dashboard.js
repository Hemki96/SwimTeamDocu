
import { apiGet } from '../api.js';

export async function viewDashboard(){
  const el = document.createElement('div');
  el.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Heute</h2><p>Lade...</p>`;
  el.appendChild(card);
  try{
    const sessions = await apiGet('/api/sessions');
    const today = new Date().toISOString().slice(0,10);
    const todays = sessions.filter(s => s.date === today);
    card.innerHTML = `<h2>Heute</h2>
      <p>${todays.length} Einheiten am ${today}</p>
      <ul>${todays.map(s=>`<li>${s.time} — ${s.location} (${s.teamId})</li>`).join('')}</ul>`;
  }catch(e){
    card.innerHTML = `<h2>Heute</h2><p>Fehler: ${e}</p>`;
  }
  return el;
}
