
# REST-API (Auszug)

## Auth
- POST `/api/auth/login`
- POST `/api/auth/logout`

## Import
- POST `/api/import/sessions?preview=true`
- POST `/api/import/sessions` (commit)

## Sessions
- GET `/api/sessions?teamId&from&to&status`
- GET `/api/sessions/:id`
- PATCH `/api/sessions/:id`
- POST `/api/sessions/:id/lock`

## Attendance
- POST `/api/sessions/:id/attendance`

## Events
- POST `/api/sessions/:id/events`
- GET `/api/sessions/:id/events`

## Analytics
- GET `/api/analytics/athlete/:athleteId?from&to`
- GET `/api/analytics/team/:teamId?from&to`
- GET `/api/analytics/heatmap?teamId&metric&bucket`

## Reports
- GET `/api/reports?scope=team|athlete&period=weekly|monthly&format=pdf|csv`

## Media
- POST `/api/media/upload`
- GET `/api/media/:id`
