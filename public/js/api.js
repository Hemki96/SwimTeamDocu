
export async function apiGet(path){
  try{
    const r = await fetch(path, { credentials: 'same-origin' });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
import { queueRequest } from './store.js';
export async function apiPost(path, body){
  try{
    const r = await fetch(path, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body)
  });
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  }catch(e){
    // Offline/Fehler: queue for background sync
    await queueRequest('POST', path, body);
    return { queued: true };
  }
}
