
import { apiGet, apiPost } from '../api.js';
import {
  buttonPrimaryClass,
  cardClass,
  containerClass,
  inputInlineClass,
  mutedTextClass,
  selectClass,
  sectionTitleClass,
  tableCellClass,
  tableClass,
  tableHeadCellClass,
  tableWrapperClass
} from './styles.js';

export async function viewAttendance(sessionId){
  const el = document.createElement('div');
  el.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Anwesenheit</h2><p class="${mutedTextClass}">Lade...</p>`;
  el.appendChild(card);

  const athletes = await apiGet('/api/athletes'); // new endpoint stubbed
  const rows = athletes.map(a => `
    <tr class="border-b border-slate-800/60 hover:bg-slate-900/40" data-id="${a.id}">
      <td class="${tableCellClass}">${a.name}</td>
      <td class="${tableCellClass}">
        <select class="${selectClass} text-sm">
          <option value="present">anwesend</option>
          <option value="partial">teilweise</option>
          <option value="absent">abwesend</option>
        </select>
      </td>
      <td class="${tableCellClass}"><input class="${inputInlineClass} w-24 text-sm" type="number" min="1" max="10" placeholder="RPE"></td>
    </tr>`).join('');

  card.innerHTML = `
    <h2 class="${sectionTitleClass}">Anwesenheit</h2>
    <div class="${tableWrapperClass}">
      <table class="${tableClass}"><thead><tr>
        <th class="${tableHeadCellClass}">Athlet</th>
        <th class="${tableHeadCellClass}">Status</th>
        <th class="${tableHeadCellClass}">RPE</th>
      </tr></thead><tbody>${rows}</tbody></table>
    </div>
    <button class="${buttonPrimaryClass}" id="save">Speichern</button>
  `;

  card.querySelector('#save').addEventListener('click', async ()=>{
    const list = [...card.querySelectorAll('tbody tr')].map(tr => {
      const athleteId = tr.dataset.id;
      const status = tr.querySelector('select').value;
      const rpeValue = tr.querySelector('input').value;
      const rpe = parseInt(rpeValue || '0',10) || undefined;
      return { athleteId, status, rpe };
    });
    const res = await apiPost(`/api/sessions/${sessionId}/attendance`, list);
    alert(`Gespeichert: ${res.updated}`);
  });

  return el;
}
