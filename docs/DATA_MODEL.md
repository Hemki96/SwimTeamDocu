
# Datenmodell

## Kerndateien (JSON)
- `athletes.json` — Athletenstammdaten
- `teams.json` — Teams/Zuordnung
- `sessions/*.json` — Session-Grunddaten (Blöcke/Sets)
- `attendance/*.jsonl` — Anwesenheitsupdates je Session
- `events.jsonl` — Ereignisse/Verletzungen
- `media.json` — Medien-Metadaten
- `index/*` — abgeleitete Indizes

## Session-Beispiel
```json
{
  "id":"S-2025-11-03-TEAM-A-01",
  "teamId":"TEAM-A",
  "date":"2025-11-03",
  "time":"17:30",
  "location":"Hallenbad Siegburg",
  "poolLength_m":25,
  "coach":"C. Hemker",
  "status":"completed",
  "blocks":[{"name":"Warm-up","sets":[{"reps":4,"distance_m":200,"stroke":"FR","intensity":"EN1","rest_s":20}]}],
  "notesCoach":"Fokus Delfin-Beinschlag"
}
```
