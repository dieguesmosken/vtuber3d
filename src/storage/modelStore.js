// Guarda o último modelo carregado no navegador (IndexedDB), para não precisar escolher o arquivo
// toda vez — útil na Browser Source do OBS. Nada sai do seu computador.
const DB = 'vtuber3d';
const STORE = 'kv';
const KEY = 'model';

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveModel(file) {
  try { await run('readwrite', (s) => s.put({ blob: file, name: file.name }, KEY)); }
  catch (e) { console.warn('Não foi possível salvar o modelo no navegador.', e); }
}

export async function loadSavedModel() {
  try { return (await run('readonly', (s) => s.get(KEY))) ?? null; }
  catch { return null; }
}

export async function clearSavedModel() {
  try { await run('readwrite', (s) => s.delete(KEY)); } catch { /* ignora */ }
}
