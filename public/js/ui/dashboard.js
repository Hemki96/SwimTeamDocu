
import { apiGet } from '../api.js';
import { cardClass, containerClass, mutedTextClass, sectionTitleClass, subtleCardClass } from './styles.js';

export async function viewDashboard(){
  const el = document.createElement('div');
  el.className = containerClass;
  const card = document.createElement('div');
  card.className = cardClass;
  card.innerHTML = `<h2 class="${sectionTitleClass}">Heute</h2><p class="${mutedTextClass}">Lade...</p>`;
  el.appendChild(card);
  try{
    const sessions = await apiGet('/api/sessions');
    const today = new Date().toISOString().slice(0,10);
    const todays = sessions.filter(s => s.date === today);
    const upcoming = todays
      .map(s => `<li class="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm"><div class="flex flex-wrap items-center justify-between gap-3"><span class="font-semibold text-slate-100">${s.time || 'tbd'} · ${s.location || 'Ort offen'}</span><span class="${mutedTextClass}">${s.teamId || 'Team'}</span></div><p class="${mutedTextClass}">${s.status || 'geplant'}</p></li>`)
      .join('');
    card.innerHTML = `
      <div class="flex flex-wrap items-start justify-between gap-4">
        <h2 class="${sectionTitleClass}">Heute</h2>
        <div class="${subtleCardClass} text-right">
          <p class="text-4xl font-bold text-lagoon">${todays.length}</p>
          <p class="${mutedTextClass}">Einheiten am ${today}</p>
        </div>
      </div>
      ${todays.length ? `<ul class="space-y-3">${upcoming}</ul>` : `<p class="${mutedTextClass}">Heute sind keine Sessions geplant.</p>`}
    `;
  }catch(e){
    card.innerHTML = `<h2 class="${sectionTitleClass}">Heute</h2><p class="text-sm text-red-300">Fehler: ${e}</p>`;
  }
  return el;
}
