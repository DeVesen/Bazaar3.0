---
id: VPROJ-S03
status: draft
depends-on: [VPROJ-S01, VPROJ-S02]
---

# Story: Docker Compose Setup

## Ziel

Ein Entwickler startet die gesamte Umgebung (Frontend, Backend, PostgreSQL) mit einem einzigen Befehl — entweder gegen lokal gebaute Images oder gegen die auf Docker Hub veröffentlichten Images (`devesen/bazaar-advance-registration-backend`, `devesen/bazaar-advance-registration-frontend`, gebaut von `.github/workflows/advance-registration-docker.yml`). Die Container-Konfiguration ist kompatibel mit Azure Container Apps (Umgebungsvariablen, Health-Checks).

## Kontext

Die Voranmelde-App wird in der Cloud betrieben. Das Docker-Compose-Setup spiegelt die Cloud-Struktur wider: Environment-Variablen statt Konfig-Dateien, Health-Checks für alle Services, kein Port-Hardcoding außer in `.env`. `compose.yaml` zieht die veröffentlichten Docker-Hub-Images statt lokal zu bauen — Vorteil: identischer Stand wie das, was die GitHub Action published; Nachteil: lokale Codeänderungen erfordern erst einen neuen Push/Build, bevor sie im Compose-Setup sichtbar werden.

## Scope

**In Scope:** `compose.yaml` mit drei Services (frontend, api, db) auf Basis der Docker-Hub-Images, Environment-Variablen für Ports, Connection String und JWT-Secret, Volume für PostgreSQL-Daten, Health-Check-Abhängigkeit (backend wartet auf db). Zusätzlich `compose.db-only.yaml` für den Fall, dass nur PostgreSQL gebraucht wird (z. B. Backend läuft per `dotnet run` gegen eine separate DB) — Standard-Port `5432`, sonst identische `db`-Definition.

**Out of Scope:** Azure Container Apps-Deployment-Konfiguration (bicep/yaml), SSL-Terminierung. Der Build- und Publish-Teil der CI/CD-Pipeline (Docker-Images bauen + auf Docker Hub veröffentlichen) ist mittlerweile per `.github/workflows/advance-registration-docker.yml` umgesetzt; das eigentliche Deployment/Ausrollen auf die Zielumgebung bleibt Out of Scope.

## UI-Spezifikation

```
Services (compose.yaml):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  frontend    │────▶│     api      │────▶│     db       │
│ (nginx,      │     │ (Docker-Hub- │     │ (postgres)   │
│  Docker-Hub- │     │  Image,      │     │              │
│  Image)      │     │  Production) │     │              │
│ :6891        │     │ :6890        │     │ :6892        │
└──────────────┘     └──────────────┘     └──────────────┘
```

Ports sind frei gewählt (nicht die App-Standardports 4200/5001/5432), um Kollisionen mit
parallel laufenden lokalen Dev-Instanzen (`ng serve`, `dotnet run`) zu vermeiden. Intern
kommuniziert das Frontend über den Nginx-Reverse-Proxy im Container immer mit `api:8080` —
der Host-Port von `api` spielt für die Frontend→Backend-Kommunikation keine Rolle, nur für
direkten Zugriff von außen (Postman o. ä.).

## Festlegungen zum `db`-Service

| Festlegung | Wert | Warum |
|---|---|---|
| Image | `postgres:18-alpine` | Major gepinnt, nicht `latest` — sonst wandert die Datenbank unter der Anwendung weg, und ein Major-Sprung bedeutet Dump und Restore |
| Datenbank | `bar` | |
| Benutzer | `bar` | |
| Volume | `bar-db-data` | benannt, nicht anonym — sonst nach `docker compose down` nicht wiederzufinden |
| Port | `6892:5432` (in `compose.db-only.yaml`: `5432:5432`) | frei gewählt in `compose.yaml`, um Kollision mit einer parallel laufenden lokalen Postgres zu vermeiden; `compose.db-only.yaml` nutzt den Standard-Port, weil sie gezielt als einzige lokale DB-Instanz gedacht ist |

**Health-Check:**

| Feld | Wert |
|---|---|
| `test` | `pg_isready -U bar -d bar` |
| `interval` | `5s` |
| `timeout` | `3s` |
| `retries` | `10` |
| `start_period` | `10s` |

**Beide Apps der Suite fahren dieselbe PostgreSQL-Major.** Derselbe Wert steht verbindlich in [BPROJ-S03](../../../../bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S03-docker-compose-setup.md) — wird er hier geändert, gehört er dort mit geändert. Unterschiedliche Majors bedeuten unterschiedliche Dump-Formate; der Datenweg zwischen den Apps läuft zwar über einen JSON-Export und nicht über einen Datenbank-Dump, aber im Zweifel kopiert doch jemand einen.

Stand der Prüfung: PostgreSQL 18 ist die aktuelle stabile Major (Docker Hub, 2026-08-18; 19 existiert nur als `19beta3`).

## Lokale Entwicklung ohne Docker Compose

Im Devcontainer läuft der Backend-Prozess teils direkt per `dotnet run` (Profil `http`,
`http://localhost:5001`) gegen eine eigene, bereits laufende Devcontainer-PostgreSQL statt gegen
den `db`-Service dieser Story. Datenbank und Benutzer sind identisch (`bar`/`bar`).

Der Port ist mittlerweile ebenfalls identisch (`5432`): `compose.yaml` mappt `db` seit dem
Umstieg auf freie Ports (siehe UI-Spezifikation oben) auf Host-Port `6892` statt `5432` —
die ursprüngliche Kollision mit einer host-seitigen PostgreSQL auf `5432`, die den
Devcontainer früher auf Port `5433` ausweichen ließ, besteht dadurch nicht mehr. Wer die
reine `compose.db-only.yaml` nutzt (Standard-Port `5432`), muss weiterhin darauf achten,
nicht gleichzeitig eine andere lokale Postgres auf `5432` laufen zu haben.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `compose.yaml` unter `src/advance-registration/` bereitstellen, die die Services `frontend`, `api` und `db` definiert; `db` SHALL das Image `postgres:18-alpine` verwenden.
- [ ] **AC-2** — WHEN `docker compose up` ausgeführt wird, THEN SHALL alle drei Services starten und `GET http://localhost:6890/health` mit HTTP 200 antworten.
- [ ] **AC-3** — THE SYSTEM SHALL den Service `api` so konfigurieren, dass er erst startet, wenn `db` als `healthy` gilt (PostgreSQL `pg_isready`-Health-Check).
- [ ] **AC-4** — THE SYSTEM SHALL alle Secrets (DB-Passwort, JWT-Secret, Connection String) ausschließlich über Environment-Variablen oder eine `.env`-Datei (gitignored) einlesen.
- [ ] **AC-5** — THE SYSTEM SHALL ein Docker-Volume für PostgreSQL-Daten definieren, sodass Daten zwischen `docker compose down` und `up` erhalten bleiben.
- [ ] **AC-6** — IF `docker compose down` ausgeführt wird, THEN SHALL die Daten im Volume erhalten bleiben; `docker compose down -v` entfernt sie explizit.
- [ ] **AC-7** — THE SYSTEM SHALL eine `.env.example`-Datei mit Platzhaltern für alle erforderlichen Environment-Variablen bereitstellen (`POSTGRES_PASSWORD`, `JWT_SIGNING_KEY`; optional `CORS_ALLOWED_ORIGIN`, nur nötig wenn Frontend und Backend auf unterschiedlichen Origins laufen statt über den Nginx-Reverse-Proxy).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt muss existieren, um den Frontend-Container bauen zu können |
| VPROJ-S02 | .NET-Projekt muss existieren, um den Backend-Container bauen zu können |

## Tags & Piles

**Tags:** #docker #docker-compose #setup #postgresql #azure #devenv
