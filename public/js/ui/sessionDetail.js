
import { apiGet } from '../api.js';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardClass,
  containerClass,
  mutedTextClass,
  pillClass,
  sectionTitleClass,
  subtleCardClass,
  tableCellClass,
  tableClass,
  tableHeadCellClass,
  tableWrapperClass
} from './styles.js';

export async function viewSessionDetail(id){
  const el = document.createElement('div');
  el.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Session</h2><p class="${mutedTextClass}">Lade...</p>`;
  el.appendChild(card);

  try{
    const s = await apiGet(`/api/sessions/${id}`);
    const blocks = (s.blocks||[]).map(b => `
      <div class="${subtleCardClass}">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-slate-100">${b.name || 'Block'}</h3>
          <span class="${pillClass}">${(b.sets||[]).length} Sets</span>
        </div>
        ${(b.sets||[]).length
          ? `<div class="${tableWrapperClass}">
              <table class="${tableClass}">
                <thead>
                  <tr>
                    <th class="${tableHeadCellClass}">#</th>
                    <th class="${tableHeadCellClass}">Wdh</th>
                    <th class="${tableHeadCellClass}">Distanz</th>
                    <th class="${tableHeadCellClass}">Stil</th>
                    <th class="${tableHeadCellClass}">Intensität</th>
                    <th class="${tableHeadCellClass}">Abgang</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${(b.sets||[]).map((st,idx)=>`<tr class="hover:bg-slate-900/40"><td class="${tableCellClass}">${idx+1}</td><td class="${tableCellClass}">${st.reps||''}</td><td class="${tableCellClass}">${st.distance_m||''} m</td><td class="${tableCellClass}">${st.stroke||''}</td><td class="${tableCellClass}">${st.intensity||''}</td><td class="${tableCellClass}">${st.leave_at||''}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>`
          : `<p class="${mutedTextClass}">Keine Sets hinterlegt.</p>`}
      </div>
    `).join('');

    card.innerHTML = `
      <div class="flex flex-wrap items-start justify-between gap-4">
        <h2 class="${sectionTitleClass}">Session ${s.id}</h2>
        <div class="${subtleCardClass} text-right">
          <p class="text-lg font-semibold text-slate-100">${s.date || '—'} · ${s.time || '—'}</p>
          <p class="${mutedTextClass}">${s.location || 'Ort offen'}</p>
        </div>
      </div>
      <dl class="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
        <div><dt class="${mutedTextClass}">Team</dt><dd class="font-medium text-slate-100">${s.teamId || '—'}</dd></div>
        <div><dt class="${mutedTextClass}">Becken</dt><dd class="font-medium text-slate-100">${s.poolLength_m || '—'} m</dd></div>
        <div><dt class="${mutedTextClass}">Status</dt><dd class="font-medium text-slate-100">${s.status || '—'}</dd></div>
        <div><dt class="${mutedTextClass}">Coach-Notizen</dt><dd class="font-medium text-slate-100">${s.notesCoach || '—'}</dd></div>
      </dl>
      <div class="flex flex-wrap gap-3">
        <a class="${buttonPrimaryClass}" href="#/attendance/${s.id}">Zur Anwesenheit</a>
        <a class="${buttonSecondaryClass}" href="#/session-edit/${s.id}">Bearbeiten</a>
      </div>
      ${blocks || `<p class="${mutedTextClass}">Keine Blöcke vorhanden.</p>`}
    `;
  }catch(e){
    card.innerHTML = `<h2 class="${sectionTitleClass}">Session</h2><p class="text-sm text-red-300">Fehler: ${e}</p>`;
  }

  return el;
}
