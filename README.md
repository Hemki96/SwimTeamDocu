
# Swim Training Docs (Vanilla JS + Node.js)

**Stand:** 2025-11-03 • **Lizenz:** MIT

Web-Anwendung zur Trainingsdokumentation für Schwimmmannschaften – Frontend in **reinem HTML/CSS/JS**, Backend in **Node.js** mit **JSON-Dateispeicherung** (optional SQLite-Upgrade).

## Schnellstart

```bash
# 1) Abhängigkeiten
npm install

# 2) Entwicklung starten (Server + statische Files)
npm run dev

# 3) Öffnen
http://localhost:3000
```

## Features (MVP + Erweiterungen)
- JSON-Import mit Preview/Schema-Validierung
- Trainingskalender & Session-Editor
- Anwesenheit (present/partial/absent), RPE, Session-Load
- Ereignisse (Injury/Incident) mit Maßnahmen
- Analysen (Athlet/Team), Heatmaps
- PWA/Offline (Service Worker, IndexedDB + Background Sync)
- Reports (PDF/CSV)
- Erweiterungen: Mapping-Assistent, Lenex/XML, Delta-Import, QR/NFC-Check-in, CSS/ACWR, Rule-Engine, Media mit Zeitstempeln u.v.m.

## Repos & Ordner
Siehe `docs/ARCHITECTURE.md` und Struktur unten.
```
swim-training-docs-app/
  public/         # HTML/CSS/JS (Vanilla)
  server/         # Node HTTP + REST
  data/           # JSON-Speicher (dev)
  docs/           # Spezifikation, Architekturen, Leitfäden
  tools/          # Skripte, Seeds
```

## Sicherheit/DSGVO
- Session-Cookies (HttpOnly), CSRF-Token
- Team-basierte RBAC
- Medical-Scope verschlüsselt
- Athleten-Datenexport/-löschung (ZIP)
Mehr unter `docs/SECURITY_DSGVO.md`.


## PWA/Offline
- Service Worker (`public/js/sw.js`) & Manifest (`public/manifest.webmanifest`)
- IndexedDB (`public/js/store.js`) für Cache & Queue

## Nützliche Skripte
- `tools/backup.sh` — ZIP-Backup von `data/`


## Neue/erweiterte Funktionen
- Session-Detailseite (`#/session/:id`) inkl. Blöcke/Sets & Button „Zur Anwesenheit“
- Attendance-POSTs werden bei Offline automatisch in eine Queue gelegt (IndexedDB) und bei Konnektivität synchronisiert
- Analytics-Demo pro Team, Dashboard „Heute“


### PDF-Report testen
- HTML Vorschau: `http://localhost:3000/api/reports?scope=team&period=weekly&teamId=TEAM-A&format=html`
- PDF: `http://localhost:3000/api/reports?scope=team&period=weekly&teamId=TEAM-A`
> Hinweis: Für PDF-Rendering wird `puppeteer` benötigt (`npm install` lädt Chromium).

### Session-Editor
- Route: `#/session-edit/:id`
- Speichert via `PATCH /api/sessions/:id` (Fallback: `_method=PATCH` per POST + Offline-Queue)


### Komfort-Set-Editor
- Visueller Editor für Blöcke/Sets (Add/Remove, Validierung, Gesamtmeter-Anzeige)
- Datei: `public/js/ui/components/setEditor.js`
- Eingebunden in `#/session-edit/:id`

### KPI-Reports mit Charts
- Report-Vorlage erweitert um **KPIs** (Sessions, Gesamtmeter, Anwesenheitsquote, Stil-Verteilung)
- Einfache **Canvas-Diagramme** (Balken/Pie) ohne externe Bibliotheken
- Server reichert Template mit `DATA_JSON` an


### Athleten-Monatsreport (Trendgrafiken)
- HTML: `http://localhost:3000/api/reports?scope=athlete&period=monthly&athleteId=A-101&month=2025-11&format=html`
- PDF:  `http://localhost:3000/api/reports?scope=athlete&period=monthly&athleteId=A-101&month=2025-11`
