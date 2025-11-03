
import { apiGet } from '../api.js';

export async function viewSessionDetail(id){
  const el = document.createElement('div');
  el.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Session</h2><p>Lade...</p>`;
  el.appendChild(card);

  try{
    const s = await apiGet(`/api/sessions/${id}`);
    const blocks = (s.blocks||[]).map(b => `
      <div class="card">
        <h3>${b.name}</h3>
        <table>
          <thead><tr><th>#</th><th>Wdh</th><th>Distanz</th><th>Stil</th><th>Intensität</th><th>Abgang</th></tr></thead>
          <tbody>
            ${(b.sets||[]).map((st,idx)=>`<tr><td>${idx+1}</td><td>${st.reps||''}</td><td>${st.distance_m||''} m</td><td>${st.stroke||''}</td><td>${st.intensity||''}</td><td>${st.leave_at||''}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    card.innerHTML = `
      <h2>Session ${s.id}</h2>
      <p><strong>Team:</strong> ${s.teamId} &nbsp; <strong>Datum:</strong> ${s.date} &nbsp; <strong>Uhrzeit:</strong> ${s.time}</p>
      <p><strong>Ort:</strong> ${s.location} &nbsp; <strong>Becken:</strong> ${s.poolLength_m} m &nbsp; <strong>Status:</strong> ${s.status}</p>
      <div style="margin:12px 0">
        <a class="btn" href="#/attendance/${s.id}">Zur Anwesenheit</a>
        <a class="btn" href="#/session-edit/${s.id}">Bearbeiten</a>
      </div>
      ${blocks || '<p>Keine Blöcke vorhanden.</p>'}
    `;
  }catch(e){
    card.innerHTML = `<h2>Session</h2><p>Fehler: ${e}</p>`;
  }

  return el;
}
