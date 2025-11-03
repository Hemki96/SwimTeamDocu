
import { apiGet } from '../api.js';
import {
  buttonSmallClass,
  cardClass,
  containerClass,
  mutedTextClass,
  sectionTitleClass,
  tableCellClass,
  tableClass,
  tableHeadCellClass,
  tableWrapperClass
} from './styles.js';

export async function viewSessions(){
  const container = document.createElement('div');
  container.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Sessions</h2><p class="${mutedTextClass}">Lade Sitzungen...</p>`;
  container.appendChild(card);

  try{
    const list = await apiGet('/api/sessions');
    const rows = list.map(s => `
      <tr class="border-b border-slate-800/60 hover:bg-slate-900/40">
        <td class="${tableCellClass}"><a class="font-semibold text-lagoon hover:underline" href='#/session/${s.id}'>${s.id}</a></td>
        <td class="${tableCellClass}">${s.teamId||''}</td>
        <td class="${tableCellClass}">${s.date||''}</td>
        <td class="${tableCellClass}">${s.time||''}</td>
        <td class="${tableCellClass}">${s.location||''}</td>
        <td class="${tableCellClass}"><span class="${mutedTextClass}">${s.status||''}</span></td>
        <td class="${tableCellClass}"><a class='${buttonSmallClass}' href='#/attendance/${s.id}'>Anwesenheit</a></td>
      </tr>
    `).join('');
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="${sectionTitleClass}">Sessions</h2>
        <p class="${mutedTextClass}">Gesamt: ${list.length}</p>
      </div>
      <div class="${tableWrapperClass}">
        <table class="${tableClass}">
          <thead>
            <tr>
              <th class="${tableHeadCellClass}">ID</th>
              <th class="${tableHeadCellClass}">Team</th>
              <th class="${tableHeadCellClass}">Datum</th>
              <th class="${tableHeadCellClass}">Uhrzeit</th>
              <th class="${tableHeadCellClass}">Ort</th>
              <th class="${tableHeadCellClass}">Status</th>
              <th class="${tableHeadCellClass}">Aktion</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">${rows}</tbody>
        </table>
      </div>`;
  }catch(e){
    card.innerHTML = `<h2 class="${sectionTitleClass}">Sessions</h2><p class="text-sm text-red-300">Fehler: ${e}</p>`;
  }
  return container;
}
