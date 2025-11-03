
import { queueAll, queueClear } from './store.js';

async function drain(){
  try{
    const items = await queueAll();
    if(!items.length) return;
    for(const it of items){
      await fetch(it.path, {
        method: it.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(it.body || {})
      });
    }
    await queueClear();
    console.log('[sync] queued requests flushed:', items.length);
  }catch(e){
    console.warn('[sync] failed:', e);
  }
}

window.addEventListener('online', drain);
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible' && navigator.onLine) drain();
});

// initial attempt
if (navigator.onLine) drain();
