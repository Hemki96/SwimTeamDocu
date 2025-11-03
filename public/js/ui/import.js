
import { apiPost } from '../api.js';

export function viewImport(){
  const wrap = document.createElement('div');
  wrap.className = 'container';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h2>Import (JSON)</h2>
    <p>JSON-Datei mit Sessions wählen (Array von Sessions im Schema v1).</p>
    <input type="file" id="f" accept=".json,application/json" />
    <div style="margin-top:12px">
      <button class="btn" id="preview">Preview</button>
      <button class="btn" id="commit" style="margin-left:8px">Commit</button>
    </div>
    <pre id="out" style="margin-top:12px; white-space:pre-wrap;"></pre>
  `;
  wrap.appendChild(card);

  const $f = card.querySelector('#f');
  const $out = card.querySelector('#out');

  async function readFile(){
    const file = $f.files?.[0];
    if(!file){ alert('Bitte Datei wählen'); return null; }
    const text = await file.text();
    try { return JSON.parse(text); } catch(e){ alert('Kein gültiges JSON'); return null; }
  }

  card.querySelector('#preview').addEventListener('click', async ()=>{
    const data = await readFile(); if(!data) return;
    const res = await apiPost('/api/import/sessions?preview=true', data);
    $out.textContent = JSON.stringify(res, null, 2);
  });

  card.querySelector('#commit').addEventListener('click', async ()=>{
    const data = await readFile(); if(!data) return;
    const res = await apiPost('/api/import/sessions', data);
    $out.textContent = JSON.stringify(res, null, 2);
  });

  return wrap;
}
