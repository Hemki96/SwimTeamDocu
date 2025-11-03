
import { apiGet, apiPost } from '../api.js';
import { createSetEditor } from './components/setEditor.js';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardClass,
  containerClass,
  inputClass,
  sectionTitleClass,
  selectClass,
  textareaClass
} from './styles.js';

export async function viewSessionEdit(id){
  const el = document.createElement('div');
  el.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Session bearbeiten</h2><p class="text-sm text-slate-300">Lade...</p>`;
  el.appendChild(card);

  const s = await apiGet(`/api/sessions/${id}`);

  card.innerHTML = `
    <h2 class="${sectionTitleClass}">Session bearbeiten – ${s.id}</h2>
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Team ID
        <input class="${inputClass}" id="teamId" value="${s.teamId||''}">
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Datum
        <input class="${inputClass}" id="date" value="${s.date||''}">
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Uhrzeit
        <input class="${inputClass}" id="time" value="${s.time||''}">
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Ort
        <input class="${inputClass}" id="location" value="${s.location||''}">
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Beckenlänge (m)
        <input class="${inputClass}" id="pool" type="number" value="${s.poolLength_m||25}">
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200">Status
        <select class="${selectClass}" id="status">
          ${['planned','in_progress','completed','locked'].map(v=>`<option ${s.status===v?'selected':''} value="${v}">${v}</option>`).join('')}
        </select>
      </label>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-200 sm:col-span-2">Coach-Notizen
        <textarea class="${textareaClass}" id="notes" rows="3">${s.notesCoach||''}</textarea>
      </label>
      <div class="sm:col-span-2 space-y-4" id="editor-host"></div>
    </div>
    <div class="flex flex-wrap gap-3 pt-2">
      <button class="${buttonPrimaryClass}" id="save">Speichern</button>
      <a class="${buttonSecondaryClass}" href="#/session/${s.id}">Abbrechen</a>
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
