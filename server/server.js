
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import { parse as parseCookie } from 'cookie';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_DIR = path.join(__dirname, '..', 'data');

function send(res, code, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(payload);
}
function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const type = ext === '.html' ? 'text/html' :
               ext === '.css'  ? 'text/css'  :
               ext === '.js'   ? 'application/javascript' :
               ext === '.json' ? 'application/json' :
               'application/octet-stream';
  fs.createReadStream(filePath).on('error', () => send(res, 404, { error: 'Not found' }))
    .once('open', () => res.writeHead(200, { 'Content-Type': type }))
    .pipe(res);
}

function serveStatic(req, res) {
  let pathname = url.parse(req.url).pathname;
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, pathname);
  if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }
  return false;
}

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return fallback; }
}
function writeJSONAtomic(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}

// Seed minimal data if missing
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(path.join(DATA_DIR, 'teams.json'))) {
  writeJSONAtomic(path.join(DATA_DIR, 'teams.json'), [{ id: 'TEAM-A', name: '1. Mannschaft', clubId: 'CLUB-1', coachUserIds: ['U-1'] }]);
}
if (!fs.existsSync(path.join(DATA_DIR, 'athletes.json'))) {
  writeJSONAtomic(path.join(DATA_DIR, 'athletes.json'), [{ id: 'A-101', name: 'Lias Kühne', birthYear: 2010, gender: 'm', teams: ['TEAM-A'], consents: { media: true, analytics: true } }]);
}
fs.mkdirSync(path.join(DATA_DIR, 'sessions'), { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'attendance'), { recursive: true });

const server = http.createServer(async (req, res) => {
  // Static
  if (req.method === 'GET' && serveStatic(req, res) !== false) return;

  // Basic routing
  const { pathname, query } = url.parse(req.url, true);
  if (req.method === 'POST' && query._method) req.method = String(query._method).toUpperCase();


// API: list athletes (stub)
if (req.method === 'GET' && pathname === '/api/athletes') {
  const list = readJSON(path.join(DATA_DIR, 'athletes.json'), []);
  return send(res, 200, list);
}

// API: simple analytics (demo aggregation)
if (req.method === 'GET' && pathname.startsWith('/api/analytics/team/')) {
  const teamId = pathname.split('/').pop();
  const files = fs.readdirSync(path.join(DATA_DIR, 'sessions')).filter(f => f.endsWith('.json'));
  const sessions = files.map(f => readJSON(path.join(DATA_DIR, 'sessions', f), null)).filter(Boolean).filter(s=>s.teamId===teamId);
  // naive distance estimate
  let dist = 0;
  for(const s of sessions){
    for(const b of (s.blocks||[])){
      for(const set of (b.sets||[])){
        dist += (set.reps||0) * (set.distance_m||0);
      }
    }
  }
  const attendanceFiles = fs.readdirSync(path.join(DATA_DIR, 'attendance'));
  let present = 0, total = 0;
  for(const fpath of attendanceFiles){
    const sid = path.basename(fpath, '.jsonl');
    const sess = sessions.find(s=>s.id===sid);
    if(!sess) continue;
    const lines = fs.readFileSync(path.join(DATA_DIR,'attendance',fpath),'utf-8').trim().split('\n').filter(Boolean);
    lines.forEach(line=>{
      try{ const o = JSON.parse(line); total++; if(o.status==='present'||o.status==='partial') present++; }catch{}
    });
  }
  const rate = total ? present/total : 0;
  return send(res, 200, { teamId, sessions: sessions.length, estimated_distance_m: dist, attendance_rate: rate });
}

// API: rules get/put (stored as YAML string in data/rules.yaml)
if (req.method === 'GET' && pathname === '/api/rules') {
  const file = path.join(DATA_DIR, 'rules.yaml');
  const text = fs.existsSync(file) ? fs.readFileSync(file,'utf-8') : '';
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  return res.end(text);
}
if (req.method === 'PUT' && pathname === '/api/rules') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const file = path.join(DATA_DIR, 'rules.yaml');
    fs.writeFileSync(file, body ?? '', 'utf-8');
    return send(res, 200, { ok: true });
  });
  return;
}

  // API: list sessions (very basic)
  if (req.method === 'GET' && pathname === '/api/sessions') {
    const teamId = query.teamId;
    const files = fs.readdirSync(path.join(DATA_DIR, 'sessions')).filter(f => f.endsWith('.json'));
    const sessions = files.map(f => readJSON(path.join(DATA_DIR, 'sessions', f), null)).filter(Boolean);
    const filtered = teamId ? sessions.filter(s => s.teamId === teamId) : sessions;
    return send(res, 200, filtered);
  }

  
// API: get session by id
  if (req.method === 'GET' && pathname.startsWith('/api/sessions/') && pathname.split('/').length === 4) {
    const id = pathname.split('/')[3];
    const file = path.join(DATA_DIR, 'sessions', `${id}.json`);
    if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' });
    const sjson = readJSON(file, null);
    return send(res, 200, sjson);
  }

  // API: update session by id (PATCH)
  if (req.method === 'PATCH' && pathname.startsWith('/api/sessions/') && pathname.split('/').length === 4) {
    const id = pathname.split('/')[3];
    const file = path.join(DATA_DIR, 'sessions', `${id}.json`);
    if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' });
    const current = readJSON(file, null);
    if (current.status === 'locked') return send(res, 423, { error: 'Session locked' });
    try {
      const body = await parseBody(req);
      const updated = { ...current, ...body, id: current.id };
      writeJSONAtomic(file, updated);
      return send(res, 200, { ok: true, id, version: Date.now() });
    } catch (e) {
      return send(res, 400, { error: 'Invalid JSON', details: String(e) });
    }
  }

  // API: create/import sessions (simplified commit)

  if (req.method === 'POST' && pathname === '/api/import/sessions') {
    try {
      const body = await parseBody(req);
      const preview = (query.preview === 'true');
      const items = Array.isArray(body) ? body : (body.items || []);
      const stats = { created: 0, updated: 0, duplicates: 0 };
      const results = [];
      for (const raw of items) {
        const id = raw.sessionId || raw.id || ('S-' + nanoid(8));
        const file = path.join(DATA_DIR, 'sessions', `${id}.json`);
        const exists = fs.existsSync(file);
        results.push({ id, exists });
        if (!preview) {
          writeJSONAtomic(file, {
            id,
            teamId: raw.teamId,
            date: raw.date,
            time: raw.time,
            location: raw.location,
            poolLength_m: raw.poolLength_m || 25,
            coach: raw.coach || '',
            status: raw.status || 'planned',
            blocks: raw.blocks || [],
            notesCoach: raw.notesCoach || ''
          });
          exists ? stats.updated++ : stats.created++;
        } else if (exists) {
          stats.duplicates++;
        }
      }
      return send(res, 200, { preview, stats, results });
    } catch (e) {
      return send(res, 400, { error: 'Invalid JSON', details: String(e) });
    }
  }

  // API: attendance (append JSONL per session)
  if (req.method === 'POST' && pathname.startsWith('/api/sessions/') && pathname.endsWith('/attendance')) {
    const id = pathname.split('/')[3];
    const file = path.join(DATA_DIR, 'attendance', `${id}.jsonl`);
    try {
      const list = await parseBody(req);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const fd = fs.openSync(file, 'a');
      for (const entry of list) {
        fs.writeSync(fd, JSON.stringify(entry) + '\n');
      }
      fs.closeSync(fd);
      return send(res, 200, { updated: list.length, warnings: [] });
    } catch (e) {
      return send(res, 400, { error: 'Invalid JSON', details: String(e) });
    }
  }


// API: reports (PDF via puppeteer)
if (req.method === 'GET' && pathname === '/api/reports') {
  const qs = query;
  const scope = qs.scope || 'team';
  const period = qs.period || 'weekly';
  const teamId = qs.teamId;

  const files = fs.readdirSync(path.join(DATA_DIR, 'sessions')).filter(f => f.endsWith('.json'));
  const sessions = files.map(f => readJSON(path.join(DATA_DIR, 'sessions', f), null)).filter(Boolean);
  const teamSessions = teamId ? sessions.filter(s => s.teamId === teamId) : sessions;

  const tplPath = path.join(__dirname, 'templates', 'report-team-week.html');
  const tpl = fs.readFileSync(tplPath, 'utf-8');
  const rows = teamSessions.map(s => `<tr><td>${s.date}</td><td>${s.time||''}</td><td>${s.location||''}</td><td>${s.status||''}</td><td>${(s.blocks||[]).reduce((m,b)=>m+(b.sets||[]).reduce((x,st)=>x+(st.reps||0)*(st.distance_m||0),0),0)}</td></tr>`).join('');
  const html = tpl.replace('{{TEAM}}', teamId || 'Alle Teams').replace('{{PERIOD}}', period).replace('{{ROWS}}', rows || '');

  if ((qs.format || 'pdf') === 'html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="report-${scope}-${period}.pdf"` });
    return res.end(pdf);
  } catch (e) {
    return send(res, 501, { error: 'PDF generator not available', details: String(e) });
  }
}

// Fallback

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
