import {
  buttonPrimaryClass,
  buttonSecondarySmallClass,
  buttonSmallClass,
  inputInlineClass,
  mutedTextClass,
  selectInlineClass,
  subtleCardClass,
  tableCellClass,
  tableClass,
  tableHeadCellClass,
  tableWrapperClass
} from '../styles.js';

/**
 * SetEditor: vanilla component for editing blocks & sets.
 * API:
 *   const editor = createSetEditor(initialBlocks);
 *   editor.el -> HTMLElement
 *   editor.getValue() -> blocks[]
 *   editor.validate() -> { ok, errors[] }
 */
export function createSetEditor(initial = []){
  const el = document.createElement('div');
  el.className = 'space-y-6';

  let blocks = (initial || []).map(block => ({
    name: block?.name || '',
    sets: (block?.sets || []).map(set => ({
      reps: set?.reps,
      distance_m: set?.distance_m,
      stroke: set?.stroke || 'FR',
      intensity: set?.intensity,
      rest_s: set?.rest_s,
      leave_at: set?.leave_at
    }))
  }));

  function calcTotal(){
    return blocks.reduce((total, block) => (
      total + (block.sets || []).reduce((sum, set) => sum + (set.reps || 0) * (set.distance_m || 0), 0)
    ), 0);
  }

  function updateTotal(){
    const totalEl = el.querySelector('[data-total]');
    if(totalEl) totalEl.textContent = `Gesamt: ${calcTotal()} m`;
  }

  function render(){
    el.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'flex flex-wrap items-start justify-between gap-4';
    head.innerHTML = `
      <div>
        <h3 class="text-xl font-semibold text-slate-100">Blöcke &amp; Sets</h3>
        <p class="${mutedTextClass}">Strukturiere den Ablauf deiner Einheit.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="${mutedTextClass}" data-total>Gesamt: ${calcTotal()} m</span>
        <button type="button" class="${buttonPrimaryClass} add-block">+ Block</button>
      </div>
    `;
    el.appendChild(head);

    head.querySelector('.add-block').addEventListener('click', ()=>{
      blocks.push({ name: 'Neuer Block', sets: [] });
      render();
    });

    blocks.forEach((block, index)=>{
      const wrap = document.createElement('div');
      wrap.className = `${subtleCardClass} space-y-4`;
      wrap.dataset.block = String(index);

      const sets = block.sets || [];
      const rows = sets.length ? sets.map((set, sIndex)=>`
        <tr class="hover:bg-slate-900/40" data-set="${sIndex}">
          <td class="${tableCellClass}">${sIndex+1}</td>
          <td class="${tableCellClass}"><input class="${inputInlineClass} reps w-20 text-sm" type="number" min="1" value="${set.reps ?? ''}" placeholder="z. B. 8"></td>
          <td class="${tableCellClass}"><input class="${inputInlineClass} dist w-24 text-sm" type="number" min="25" step="25" value="${set.distance_m ?? ''}" placeholder="z. B. 50"></td>
          <td class="${tableCellClass}">
            <select class="${selectInlineClass} stroke w-28 text-sm">
              ${['FR','BA','BR','FL','IM','DRILL'].map(v=>`<option ${set.stroke===v?'selected':''} value="${v}">${v}</option>`).join('')}
            </select>
          </td>
          <td class="${tableCellClass}"><input class="${inputInlineClass} intensity w-32 text-sm" value="${set.intensity ?? ''}" placeholder="EN1/EN2/TH..."></td>
          <td class="${tableCellClass}"><input class="${inputInlineClass} rest w-24 text-sm" type="number" min="0" value="${set.rest_s ?? ''}" placeholder="z. B. 20"></td>
          <td class="${tableCellClass}"><input class="${inputInlineClass} leave w-24 text-sm" value="${set.leave_at ?? ''}" placeholder="@1:00"></td>
          <td class="${tableCellClass}"><button type="button" class="${buttonSecondarySmallClass} remove-set">−</button></td>
        </tr>
      `).join('') : `<tr><td class="${tableCellClass} text-center text-slate-400" colspan="8">Noch keine Sets hinzugefügt.</td></tr>`;

      wrap.innerHTML = `
        <div class="flex flex-wrap items-center gap-3">
          <input class="${inputInlineClass} block-name flex-1 min-w-[180px]" value="${block.name || ''}" placeholder="Blockname (z. B. Warm-up)">
          <div class="flex flex-wrap gap-2">
            <button type="button" class="${buttonSmallClass} add-set">+ Set</button>
            <button type="button" class="${buttonSecondarySmallClass} remove-block">Entfernen</button>
          </div>
        </div>
        <div class="${tableWrapperClass}">
          <table class="${tableClass}">
            <thead>
              <tr>
                <th class="${tableHeadCellClass}">#</th>
                <th class="${tableHeadCellClass}">Wdh</th>
                <th class="${tableHeadCellClass}">Distanz (m)</th>
                <th class="${tableHeadCellClass}">Stil</th>
                <th class="${tableHeadCellClass}">Intensität</th>
                <th class="${tableHeadCellClass}">Pause (s)</th>
                <th class="${tableHeadCellClass}">Abgang</th>
                <th class="${tableHeadCellClass}">Aktion</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">${rows}</tbody>
          </table>
        </div>
      `;

      el.appendChild(wrap);

      wrap.querySelector('.block-name').addEventListener('input', (e)=>{
        block.name = e.target.value;
      });

      wrap.querySelector('.add-set').addEventListener('click', ()=>{
        block.sets = block.sets || [];
        block.sets.push({ reps: 1, distance_m: 25, stroke: 'FR' });
        render();
      });

      wrap.querySelector('.remove-block').addEventListener('click', ()=>{
        blocks.splice(index, 1);
        render();
      });

      wrap.querySelectorAll('tbody tr[data-set]').forEach(tr => {
        const sIndex = parseInt(tr.dataset.set, 10);
        const set = block.sets[sIndex];
        tr.querySelector('.remove-set')?.addEventListener('click', ()=>{
          block.sets.splice(sIndex,1);
          render();
        });
        tr.querySelector('.reps')?.addEventListener('input', (e)=>{ set.reps = intOrUndef(e.target.value); updateTotal(); });
        tr.querySelector('.dist')?.addEventListener('input', (e)=>{ set.distance_m = intOrUndef(e.target.value); updateTotal(); });
        tr.querySelector('.stroke')?.addEventListener('change', (e)=>{ set.stroke = e.target.value; });
        tr.querySelector('.intensity')?.addEventListener('input', (e)=>{ set.intensity = strOrUndef(e.target.value); });
        tr.querySelector('.rest')?.addEventListener('input', (e)=>{ set.rest_s = intOrUndef(e.target.value); });
        tr.querySelector('.leave')?.addEventListener('input', (e)=>{ set.leave_at = strOrUndef(e.target.value); });
      });
    });

    updateTotal();
  }

  render();

  function collect(){
    return blocks.map(block => ({
      name: block.name || '',
      sets: (block.sets || []).map(set => ({
        reps: set.reps,
        distance_m: set.distance_m,
        stroke: set.stroke || 'FR',
        intensity: set.intensity,
        rest_s: set.rest_s,
        leave_at: set.leave_at
      }))
    }));
  }

  function intOrUndef(v){ const n = parseInt(v || ''); return Number.isFinite(n) ? n : undefined; }
  function strOrUndef(v){ return (v && v.trim().length) ? v.trim() : undefined; }

  function validate(){
    const errors = [];
    const data = collect();
    data.forEach((block, bi)=>{
      if(!block.name) errors.push(`Block ${bi+1}: Name fehlt`);
      (block.sets || []).forEach((set, si)=>{
        if(!Number.isFinite(set.reps) || set.reps < 1) errors.push(`Block ${bi+1} Set ${si+1}: Wdh fehlt/ungültig`);
        if(!Number.isFinite(set.distance_m) || (set.distance_m % 25) !== 0) errors.push(`Block ${bi+1} Set ${si+1}: Distanz muss Vielfaches von 25 sein`);
        if(set.leave_at && !/^@\d{1,2}:\d{2}$/.test(set.leave_at)) errors.push(`Block ${bi+1} Set ${si+1}: Abgang-Format @m:ss`);
      });
    });
    return { ok: errors.length === 0, errors };
  }

  return { el, getValue: collect, validate };
}
