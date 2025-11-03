
# Architektur (Vanilla Frontend + Node.js Backend)

## Frontend
- Reines HTML/CSS/JS (ES-Module)
- Router (hash-based), Module in `public/js`
- PWA: Service Worker `public/js/sw.js`, IndexedDB in `public/js/store.js`
- Charts: Canvas 2D

## Backend
- Node.js eigener HTTP-Server (`server/server.js`)
- REST-API unter `/api/*`
- Dateispeicherung (atomare Writes) unter `data/`
- Aggregationsjobs (ACWR/CSS/Heatmaps) in `server/lib/analytics`

## Datenfluss
Import → Validierung → Upsert → Aggregation → Snapshots → Analysen/Reports
