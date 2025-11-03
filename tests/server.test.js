import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createApp } from '../server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupServer(t, options = {}) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'swimteam-'));
  const server = createApp({
    dataDir: tmpRoot,
    publicDir: path.join(__dirname, '..', 'public'),
    seed: false,
    ...options,
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => new Promise((resolve) => server.close(resolve)));
  t.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

  return { baseUrl, dataDir: tmpRoot };
}

test('GET /api/athletes returns stored athletes', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const athletes = [
    { id: 'A-1', name: 'Test Athlete', birthYear: 2011, gender: 'f', teams: ['TEAM-1'], consents: { media: false } },
  ];
  fs.writeFileSync(path.join(dataDir, 'athletes.json'), JSON.stringify(athletes, null, 2));

  const res = await fetch(`${baseUrl}/api/athletes`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, athletes);
});

test('session listing filters by team', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const sessionsDir = path.join(dataDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(path.join(sessionsDir, 'S-1.json'), JSON.stringify({ id: 'S-1', teamId: 'TEAM-1', date: '2024-01-01' }, null, 2));
  fs.writeFileSync(path.join(sessionsDir, 'S-2.json'), JSON.stringify({ id: 'S-2', teamId: 'TEAM-2', date: '2024-01-02' }, null, 2));

  const res = await fetch(`${baseUrl}/api/sessions?teamId=TEAM-1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.map((s) => s.id), ['S-1']);
});

test('session patch updates unlocked sessions and blocks locked ones', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const sessionFile = path.join(dataDir, 'sessions', 'S-9.json');
  fs.writeFileSync(sessionFile, JSON.stringify({ id: 'S-9', teamId: 'TEAM-1', status: 'planned' }, null, 2));

  let res = await fetch(`${baseUrl}/api/sessions/S-9`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed', notesCoach: 'Nice work' }),
  });
  assert.equal(res.status, 200);
  const patched = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
  assert.equal(patched.status, 'completed');
  assert.equal(patched.notesCoach, 'Nice work');

  fs.writeFileSync(sessionFile, JSON.stringify({ id: 'S-9', teamId: 'TEAM-1', status: 'locked' }, null, 2));
  res = await fetch(`${baseUrl}/api/sessions/S-9`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' }),
  });
  assert.equal(res.status, 423);
});

test('session import preview and commit reports correct stats', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const sessionsDir = path.join(dataDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(path.join(sessionsDir, 'S-1.json'), JSON.stringify({ id: 'S-1', teamId: 'TEAM-1', status: 'planned' }, null, 2));

  const previewRes = await fetch(`${baseUrl}/api/import/sessions?preview=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { id: 'S-1', teamId: 'TEAM-1', date: '2024-03-01' },
      { id: 'S-2', teamId: 'TEAM-1', date: '2024-03-02' },
    ]),
  });
  assert.equal(previewRes.status, 200);
  const previewBody = await previewRes.json();
  assert.equal(previewBody.preview, true);
  assert.equal(previewBody.stats.duplicates, 1);
  assert.equal(previewBody.stats.created, 0);
  assert.equal(previewBody.stats.updated, 0);

  const commitRes = await fetch(`${baseUrl}/api/import/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [
      { id: 'S-1', teamId: 'TEAM-1', date: '2024-03-01', status: 'planned' },
      { id: 'S-2', teamId: 'TEAM-1', date: '2024-03-02', status: 'planned' },
    ] }),
  });
  assert.equal(commitRes.status, 200);
  const commitBody = await commitRes.json();
  assert.equal(commitBody.stats.updated, 1);
  assert.equal(commitBody.stats.created, 1);
  const stored = JSON.parse(fs.readFileSync(path.join(sessionsDir, 'S-2.json'), 'utf-8'));
  assert.equal(stored.id, 'S-2');
  assert.equal(stored.teamId, 'TEAM-1');
});

test('attendance endpoint persists JSONL and analytics aggregates data', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const sessionsDir = path.join(dataDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(path.join(sessionsDir, 'S-100.json'), JSON.stringify({
    id: 'S-100',
    teamId: 'TEAM-AN',
    blocks: [
      { sets: [{ reps: 4, distance_m: 50 }, { reps: 2, distance_m: 100 }] },
    ],
  }, null, 2));

  const attendanceRes = await fetch(`${baseUrl}/api/sessions/S-100/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { athleteId: 'A-1', status: 'present' },
      { athleteId: 'A-2', status: 'partial' },
      { athleteId: 'A-3', status: 'absent' },
    ]),
  });
  assert.equal(attendanceRes.status, 200);

  const analyticsRes = await fetch(`${baseUrl}/api/analytics/team/TEAM-AN`);
  assert.equal(analyticsRes.status, 200);
  const analytics = await analyticsRes.json();
  assert.equal(analytics.sessions, 1);
  assert.equal(analytics.estimated_distance_m, (4 * 50) + (2 * 100));
  assert.equal(analytics.attendance_rate, 2 / 3);
});

test('reports endpoint can render HTML output', async (t) => {
  const { baseUrl, dataDir } = await setupServer(t);
  const sessionsDir = path.join(dataDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(path.join(sessionsDir, 'S-200.json'), JSON.stringify({
    id: 'S-200',
    teamId: 'TEAM-R',
    date: '2024-05-01',
    time: '18:00',
    location: 'Main Pool',
    status: 'planned',
    blocks: [],
  }, null, 2));

  const res = await fetch(`${baseUrl}/api/reports?format=html&teamId=TEAM-R`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  const text = await res.text();
  assert.match(text, /TEAM-R/);
  assert.match(text, /2024-05-01/);
});

test('rules endpoint stores and retrieves plain text', async (t) => {
  const { baseUrl } = await setupServer(t);

  let res = await fetch(`${baseUrl}/api/rules`);
  assert.equal(res.status, 200);
  const initial = await res.text();
  assert.equal(initial, '');

  const yaml = 'minimum_age: 8\nmax_team_size: 12\n';
  res = await fetch(`${baseUrl}/api/rules`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: yaml,
  });
  assert.equal(res.status, 200);

  res = await fetch(`${baseUrl}/api/rules`);
  assert.equal(res.status, 200);
  const stored = await res.text();
  assert.equal(stored, yaml);
});
