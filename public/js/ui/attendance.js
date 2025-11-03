
import { apiGet, apiPost } from '../api.js';

export async function viewAttendance(sessionId){
  const el = document.createElement('div');
  el.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Anwesenheit</h2><p>Lade...</p>`;
  el.appendChild(card);

  const athletes = await apiGet('/api/athletes'); // new endpoint stubbed
  const rows = athletes.map(a => `
    <tr data-id="${a.id}">
      <td>${a.name}</td>
      <td>
        <select>
          <option value="present">anwesend</option>
          <option value="partial">teilweise</option>
          <option value="absent">abwesend</option>
        </select>
      </td>
      <td><input type="number" min="1" max="10" placeholder="RPE" style="width:80px"></td>
    </tr>`).join('');

  card.innerHTML = `
    <h2>Anwesenheit</h2>
    <table><thead><tr><th>Athlet</th><th>Status</th><th>RPE</th></tr></thead><tbody>${rows}</tbody></table>
    <button class="btn" id="save">Speichern</button>
  `;

  card.querySelector('#save').addEventListener('click', async ()=>{
    const list = [...card.querySelectorAll('tbody tr')].map(tr => {
      const athleteId = tr.dataset.id;
      const status = tr.querySelector('select').value;
      const rpe = parseInt(tr.querySelector('input').value || '0',10) || undefined;
      return { athleteId, status, rpe };
    });
    const res = await apiPost(`/api/sessions/${sessionId}/attendance`, list);
    alert(`Gespeichert: ${res.updated}`);
  });

  return el;
}
