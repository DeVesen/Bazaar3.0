---
id: VPROJ-S03
status: draft
depends-on: [VPROJ-S01, VPROJ-S02]
---

# Story: Docker Compose Setup

## Ziel

Ein Entwickler startet die gesamte lokale Entwicklungsumgebung (Angular Dev-Server, .NET API, PostgreSQL) mit einem einzigen Befehl. Die Container-Konfiguration ist kompatibel mit Azure Container Apps (Umgebungsvariablen, Health-Checks).

## Kontext

Die Voranmelde-App wird in der Cloud betrieben. Das lokale Docker-Compose-Setup spiegelt die Cloud-Struktur wider: Environment-Variablen statt Konfig-Dateien, Health-Checks für alle Services, kein Port-Hardcoding außer in `.env`.

## Scope

**In Scope:** `docker-compose.yml` mit drei Services (frontend, backend, db), Environment-Variablen für Ports, Connection String und JWT-Secret, Volume für PostgreSQL-Daten, Health-Check-Abhängigkeit (backend wartet auf db).

**Out of Scope:** Azure Container Apps-Deployment-Konfiguration (bicep/yaml), SSL-Terminierung, CI/CD-Pipeline.

## UI-Spezifikation

```
Services:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  frontend    │────▶│   backend    │────▶│     db       │
│ (ng serve)   │     │ (dotnet run) │     │ (postgres)   │
│ :4200        │     │ :5001        │     │ :5432        │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.yml` im Projekt-Root bereitstellen, die die Services `frontend`, `backend` und `db` definiert.
- [ ] **AC-2** — WHEN `docker compose up` ausgeführt wird, THEN SHALL alle drei Services starten und `GET http://localhost:5001/health` mit HTTP 200 antworten.
- [ ] **AC-3** — THE SYSTEM SHALL den Service `backend` so konfigurieren, dass er erst startet, wenn `db` als `healthy` gilt (PostgreSQL `pg_isready`-Health-Check).
- [ ] **AC-4** — THE SYSTEM SHALL alle Secrets (DB-Passwort, JWT-Secret, Connection String) ausschließlich über Environment-Variablen oder eine `.env`-Datei (gitignored) einlesen.
- [ ] **AC-5** — THE SYSTEM SHALL ein Docker-Volume für PostgreSQL-Daten definieren, sodass Daten zwischen `docker compose down` und `up` erhalten bleiben.
- [ ] **AC-6** — IF `docker compose down` ausgeführt wird, THEN SHALL die Daten im Volume erhalten bleiben; `docker compose down -v` entfernt sie explizit.
- [ ] **AC-7** — THE SYSTEM SHALL eine `.env.example`-Datei mit Platzhaltern für alle erforderlichen Environment-Variablen bereitstellen (inkl. `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `CORS_ALLOWED_ORIGIN`).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt muss existieren, um den Frontend-Container bauen zu können |
| VPROJ-S02 | .NET-Projekt muss existieren, um den Backend-Container bauen zu können |

## Tags & Piles

**Tags:** #docker #docker-compose #setup #postgresql #azure #devenv
