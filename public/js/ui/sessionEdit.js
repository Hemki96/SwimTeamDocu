
import { apiGet, apiPost } from '../api.js';
import { createSetEditor } from './components/setEditor.js';

export async function viewSessionEdit(id){
  const el = document.createElement('div');
  el.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Session bearbeiten</h2><p>Lade...</p>`;
  el.appendChild(card);

  const s = await apiGet(`/api/sessions/${id}`);

  card.innerHTML = `
    <h2>Session bearbeiten – ${s.id}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label>Team ID<input id="teamId" value="${s.teamId||''}"></label></div>
      <div><label>Datum<input id="date" value="${s.date||''}"></label></div>
      <div><label>Uhrzeit<input id="time" value="${s.time||''}"></label></div>
      <div><label>Ort<input id="location" value="${s.location||''}"></label></div>
      <div><label>Beckenlänge (m)<input id="pool" type="number" value="${s.poolLength_m||25}"></label></div>
      <div>
        <label>Status
          <select id="status">
            ${['planned','in_progress','completed','locked'].map(v=>`<option ${s.status===v?'selected':''} value="${v}">${v}</option>`).join('')}
          </select>
        </label>
      </div>
      <div style="grid-column:1/-1">
        <label>Coach-Notizen<textarea id="notes" rows="3">${s.notesCoach||''}</textarea></label>
      </div>
      <div style="grid-column:1/-1" id="editor-host"></div>
    </div>
    <div style="margin-top:12px">
      <button class="btn" id="save">Speichern</button>
      <a class="btn" href="#/session/${s.id}" style="margin-left:8px">Abbrechen</a>
    </div>
  `;

  const editor = createSetEditor(s.blocks || []);
  card.querySelector('#editor-host').appendChild(editor.el);

  card.querySelector('#save').addEventListener('click', async ()=>{
    const check = editor.validate();
    if(!check.ok){ alert(check.errors.join('\n')); return; }
    const blocks = editor.getValue();

    const payload = {
      teamId: card.querySelector('#teamId').value,
      date: card.querySelector('#date').value,
      time: card.querySelector('#time').value,
      location: card.querySelector('#location').value,
      poolLength_m: parseInt(card.querySelector('#pool').value||'25',10),
      status: card.querySelector('#status').value,
      notesCoach: card.querySelector('#notes').value,
      blocks
    };

    // Try PATCH first
    try{
      const r = await fetch(`/api/sessions/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.ok){ location.hash = `#/session/${s.id}`; return; }
    }catch{}
    // Fallback to queued POST with _method=PATCH
    const res = await apiPost(`/api/sessions/${s.id}?_method=PATCH`, payload);
    if (res.ok || res.queued){ alert('Gespeichert (evtl. offline in Queue).'); location.hash = `#/session/${s.id}`; }
  });

  return el;
}
