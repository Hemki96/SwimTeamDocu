
# Umfassende To-do-Liste / Projekt-Backlog

## Sprint 0 – Setup & Basis
- [ ] Node-Server Grundgerüst (`server/server.js`), statische Auslieferung `public/`
- [ ] Routing `/api/*` (Sessions, Attendance, Import – Platzhalter)
- [ ] JSON-Store (atomare Writes), Indexer, Backup-Rotation
- [ ] Auth (Login/Logout), CSRF-Token, Cookie-Setup
- [ ] RBAC Guard (Admin/HeadCoach/Coach/Analyst/Athlete)
- [ ] Seeds: `data/users.json`, `data/teams.json`, `data/athletes.json`

## Sprint 1 – Frontend-Shell
- [ ] `public/index.html` Layout + Navigation
- [ ] CSS Basisthema (Light/Dark), Komponenten (Form, Table, Tile)
- [ ] Router (hash-based), Views (Dashboard, Kalender, Session, Athlet, Team, Import, Analytics, Regeln)
- [ ] `api.js` (Fetch-Wrapper mit CSRF, ETag), `store.js` (IndexedDB + Queue)

## Sprint 2 – Import & Sessions
- [ ] Import-UI (Drag&Drop, Preview, Fehlerliste)
- [ ] API: `/api/import/sessions?preview=true` & Commit
- [ ] Sessionliste & Kalender (Woche/Monat)
- [ ] Session-Detail (Blöcke/Sets, Statuswechsel, Lock)

## Sprint 3 – Attendance & RPE
- [ ] Attendance-Massen-Eingabe (Kiosk), Teilnahmetyp/Gründe, Check-in/out
- [ ] API: `/api/sessions/:id/attendance`
- [ ] Offline-Queue & SW Background Sync
- [ ] RPE-Erfassung, Session-Load Anzeige

## Sprint 4 – Events/Media
- [ ] Ereignisse incl. Maßnahmen und Medical-Scope
- [ ] Media-Upload + Vorschaubilder, Zeitstempel-Tags
- [ ] API-/UI-Listen für Events/Media

## Sprint 5 – Analytics (Basis)
- [ ] Athlet-KPIs (Distanz, Zonen, RPE-Trend)
- [ ] Team-KPIs (Anwesenheit, Volumen/Intensität)
- [ ] Heatmap (weekday×hour), Snapshots (nightly)

## Sprint 6 – Reports & Exporte
- [ ] PDF-Templates (Team-Woche, Athlet-Monat) via Puppeteer
- [ ] CSV/JSON Exporte, Signatur (Hash + Metadaten)

## Sprint 7 – Erweiterte Analytik & Regeln
- [ ] CSS/Pace-Zonen, ACWR (7/28) mit Warnschwellen
- [ ] Rule-Engine (YAML) + UI, Teams/Slack-Webhooks
- [ ] Cohorts & Coach-Vergleich

## Sprint 8 – Import-Erweiterungen
- [ ] Mapping-Assistent GUI + Vorlagen
- [ ] Lenex/XML, CSV (RPE), GPX/TCX
- [ ] Delta-Import (Hashes)

## Sprint 9 – DSGVO & Hardening
- [ ] Athlet-Export/Löschung (ZIP)
- [ ] Audit-Logs, Rate Limiting, Security Headers
- [ ] Performance-Tuning & e2e-Tests
