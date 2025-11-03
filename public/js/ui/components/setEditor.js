
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
  el.className = 'set-editor';

  function renderBlockRow(block, bIndex){
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <input class="block-name" value="${block.name||''}" placeholder="Blockname (z. B. Warm-up)" style="flex:1">
        <button class="btn btn-small add-set">+ Set</button>
        <button class="btn btn-small remove-block">Entfernen</button>
      </div>
      <table style="margin-top:8px">
        <thead><tr><th>#</th><th>Wdh</th><th>Distanz (m)</th><th>Stil</th><th>Intensität</th><th>Pause (s)</th><th>Abgang (@m:ss)</th><th>Aktion</th></tr></thead>
        <tbody></tbody>
      </table>
    `;
    const tbody = wrap.querySelector('tbody');

    function renderSetRow(set, sIndex){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sIndex+1}</td>
        <td><input type="number" class="reps" min="1" value="${set.reps??''}" placeholder="z. B. 8" style="width:80px"></td>
        <td><input type="number" class="dist" min="25" step="25" value="${set.distance_m??''}" placeholder="z. B. 50" style="width:100px"></td>
        <td>
          <select class="stroke">
            ${['FR','BA','BR','FL','IM','DRILL'].map(v=>`<option ${set.stroke===v?'selected':''} value="${v}">${v}</option>`).join('')}
          </select>
        </td>
        <td><input class="intensity" value="${set.intensity??''}" placeholder="EN1/EN2/TH/VO2/SP1..."></td>
        <td><input type="number" class="rest" min="0" value="${set.rest_s??''}" placeholder="z. B. 20" style="width:100px"></td>
        <td><input class="leave" value="${set.leave_at??''}" placeholder="@1:00" style="width:100px"></td>
        <td><button class="btn btn-small remove-set">−</button></td>
      `;
      tr.querySelector('.remove-set').addEventListener('click', ()=>{
        block.sets.splice(sIndex,1);
        refresh();
      });
      tbody.appendChild(tr);
    }

    // initial sets
    (block.sets||[]).forEach((s,i)=>renderSetRow(s,i));

    wrap.querySelector('.add-set').addEventListener('click', ()=>{
      block.sets = block.sets || [];
      block.sets.push({ reps: 1, distance_m: 25, stroke: 'FR' });
      refresh();
    });
    wrap.querySelector('.remove-block').addEventListener('click', ()=>{
      blocks.splice(bIndex,1);
      refresh();
    });

    return wrap;
  }

  let blocks = JSON.parse(JSON.stringify(initial||[]));

  function refresh(){
    el.innerHTML = "";
    const head = document.createElement('div');
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';
    head.style.gap = '8px';
    head.innerHTML = `
      <h3 style="margin:8px 0">Blöcke & Sets</h3>
      <div style="display:flex;gap:8px">
        <button class="btn add-block">+ Block</button>
        <span id="total" class="muted"></span>
      </div>
    `;
    el.appendChild(head);

    blocks.forEach((b, idx)=>{
      const blockEl = renderBlockRow(b, idx);
      el.appendChild(blockEl);
      // render its sets now
      const tbody = blockEl.querySelector('tbody');
      (b.sets||[]).forEach((s,i)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i+1}</td>
          <td><input type="number" class="reps" min="1" value="${s.reps??''}" style="width:80px"></td>
          <td><input type="number" class="dist" min="25" step="25" value="${s.distance_m??''}" style="width:100px"></td>
          <td>
            <select class="stroke">
              ${['FR','BA','BR','FL','IM','DRILL'].map(v=>`<option ${s.stroke===v?'selected':''} value="${v}">${v}</option>`).join('')}
            </select>
          </td>
          <td><input class="intensity" value="${s.intensity??''}"></td>
          <td><input type="number" class="rest" min="0" value="${s.rest_s??''}" style="width:100px"></td>
          <td><input class="leave" value="${s.leave_at??''}" placeholder="@1:00" style="width:100px"></td>
          <td><button class="btn btn-small remove-set">−</button></td>
        `;
        tr.querySelector('.remove-set').addEventListener('click', ()=>{
          b.sets.splice(i,1);
          refresh();
        });
        tbody.appendChild(tr);
      });

      // keep block name two-way binding
      blockEl.querySelector('.block-name').addEventListener('input', (e)=>{
        b.name = e.target.value;
      });
    });

    head.querySelector('.add-block').addEventListener('click', ()=>{
      blocks.push({ name: 'Neuer Block', sets: [] });
      refresh();
    });

    // total meters
    const total = blocks.reduce((m,b)=>m+(b.sets||[]).reduce((x,s)=>x+(s.reps||0)*(s.distance_m||0),0),0);
    head.querySelector('#total').textContent = `Gesamt: ${total} m`;
  }

  refresh();

  function collect(){
    // read back values from DOM into blocks
    const cards = el.querySelectorAll('.card');
    let bi = 0;
    for(const card of cards){
      const nameInput = card.querySelector('.block-name');
      if (!nameInput) continue;
      const b = blocks[bi++];
      b.name = nameInput.value || '';
      const rows = card.querySelectorAll('tbody tr');
      b.sets = [];
      rows.forEach(r=>{
        b.sets.push({
          reps: intOrUndef(r.querySelector('.reps')?.value),
          distance_m: intOrUndef(r.querySelector('.dist')?.value),
          stroke: r.querySelector('.stroke')?.value || 'FR',
          intensity: strOrUndef(r.querySelector('.intensity')?.value),
          rest_s: intOrUndef(r.querySelector('.rest')?.value),
          leave_at: strOrUndef(r.querySelector('.leave')?.value)
        });
      });
    }
    return blocks;
  }

  function intOrUndef(v){ const n = parseInt(v||''); return Number.isFinite(n)?n:undefined; }
  function strOrUndef(v){ return (v && v.trim().length) ? v.trim() : undefined; }

  function validate(){
    const errors = [];
    const blocks = collect();
    blocks.forEach((b, bi)=>{
      if(!b.name) errors.push(`Block ${bi+1}: Name fehlt`);
      (b.sets||[]).forEach((s, si)=>{
        if(!Number.isFinite(s.reps) || s.reps < 1) errors.push(`Block ${bi+1} Set ${si+1}: Wdh fehlt/ungültig`);
        if(!Number.isFinite(s.distance_m) || (s.distance_m % 25) !== 0) errors.push(`Block ${bi+1} Set ${si+1}: Distanz muss Vielfaches von 25 sein`);
        if(s.leave_at && !/^@\d{1,2}:\d{2}$/.test(s.leave_at)) errors.push(`Block ${bi+1} Set ${si+1}: Abgang-Format @m:ss`);
      });
    });
    return { ok: errors.length===0, errors };
  }

  return { el, getValue: collect, validate };
}
