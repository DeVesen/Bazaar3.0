---
id: BPROJ-S03
status: draft
depends-on: [BPROJ-S01, BPROJ-S02]
---

# Story: Docker Compose Setup

## Ziel

Ein Entwickler startet die gesamte lokale Entwicklungsumgebung (Angular Dev-Server, .NET API, PostgreSQL) mit einem einzigen Befehl über Docker Compose.

## Kontext

Die Haupt-App läuft im LAN auf einem lokalen Server. Docker Compose ermöglicht ein reproduzierbares lokales Dev-Setup und bildet gleichzeitig die spätere Produktivumgebung ab. Angular wird im Dev-Modus mit Hot-Reload betrieben.

## Scope

**In Scope:** `docker-compose.yml` mit drei Services (frontend, backend, db), Environment-Variablen für Ports und Connection String, Volume für PostgreSQL-Daten, Health-Check-Abhängigkeit (backend wartet auf db).

**Out of Scope:** CI/CD, Production-Build-Image, SSL/TLS-Terminierung (folgt in [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md)).

## UI-Spezifikation

```
Services:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  frontend    │────▶│   backend    │────▶│     db       │
│ (ng serve)   │     │ (dotnet run) │     │ (postgres)   │
│ :4200        │     │ :5000        │     │ :5432        │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.yml` im Projekt-Root bereitstellen, die die Services `frontend`, `backend` und `db` definiert.
- [ ] **AC-2** — WHEN `docker compose up` ausgeführt wird, THEN SHALL alle drei Services starten und `GET http://localhost:5000/health` mit HTTP 200 antworten.
- [ ] **AC-3** — THE SYSTEM SHALL den Service `backend` so konfigurieren, dass er erst startet, wenn `db` als `healthy` gilt (PostgreSQL `pg_isready`-Health-Check).
- [ ] **AC-4** — THE SYSTEM SHALL alle Secrets (DB-Passwort, Connection String) ausschließlich über Environment-Variablen oder eine `.env`-Datei (gitignored) einlesen.
- [ ] **AC-5** — THE SYSTEM SHALL ein Docker-Volume für PostgreSQL-Daten definieren, sodass Daten zwischen `docker compose down` und `up` erhalten bleiben.
- [ ] **AC-6** — IF `docker compose down` ausgeführt wird, THEN SHALL die Daten im Volume erhalten bleiben; `docker compose down -v` entfernt sie explizit.
- [ ] **AC-7** — THE SYSTEM SHALL eine `.env.example`-Datei mit Platzhaltern für alle erforderlichen Environment-Variablen bereitstellen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | Angular-Projekt muss existieren, um den Frontend-Container bauen zu können |
| BPROJ-S02 | .NET-Projekt muss existieren, um den Backend-Container bauen zu können |

## Tags & Piles

**Tags:** #docker #docker-compose #setup #postgresql #devenv
