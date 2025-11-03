
import { apiPost } from '../api.js';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardClass,
  containerClass,
  mutedTextClass,
  sectionTitleClass
} from './styles.js';

export function viewImport(){
  const wrap = document.createElement('div');
  wrap.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `
    <h2 class="${sectionTitleClass}">Import (JSON)</h2>
    <p class="${mutedTextClass}">JSON-Datei mit Sessions wählen (Array von Sessions im Schema v1).</p>
    <input class="block w-full cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-100 hover:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/60" type="file" id="f" accept=".json,application/json" />
    <div class="flex flex-wrap gap-3 pt-3">
      <button class="${buttonPrimaryClass}" id="preview">Preview</button>
      <button class="${buttonSecondaryClass}" id="commit">Commit</button>
    </div>
    <pre id="out" class="mt-4 max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-lime-200"></pre>
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
