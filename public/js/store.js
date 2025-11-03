
/**
 * IndexedDB Store + Background Queue for offline POSTs.
 */
const DB_NAME = 'swimdox';
const DB_VERSION = 1;
let dbp;

function openDB(){
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore('cache.sessions', { keyPath: 'id' });
      db.createObjectStore('cache.athletes', { keyPath: 'id' });
      db.createObjectStore('queue.requests', { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

export async function cachePut(store, value){
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheGetAll(store){
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function queueRequest(method, path, body){
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue.requests', 'readwrite');
    tx.objectStore('queue.requests').add({ method, path, body, ts: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}


export async function queueAll(){
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue.requests', 'readonly');
    const req = tx.objectStore('queue.requests').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function queueClear(){
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue.requests', 'readwrite');
    tx.objectStore('queue.requests').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
