---
id: BPROJ-S03
status: draft
depends-on: []
---

# Story: Docker Compose Setup (Entwicklungs-Datenbank)

## Ziel

Ein Entwickler startet die PostgreSQL-Datenbank der Entwicklungsumgebung mit einem einzigen Befehl und arbeitet an Frontend und Backend direkt auf dem Host.

## Kontext

**In Compose läuft nur die Datenbank.** Frontend und Backend laufen auf dem Host — `ng serve` und `dotnet watch`.

Der Zweck von Compose ist hier die reproduzierbare **Datenbank**, nicht die reproduzierbare Entwicklungsumgebung. Wer an dieser App arbeitet, hat Node und das .NET-SDK ohnehin installiert ([BPROJ-S01](BPROJ-S01-angular-projekt-anlegen.md), [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) setzen beides voraus). Frontend und Backend in Container zu stecken würde bedeuten:

- Bind-Mounts für den Quellcode, plus einen Sonderweg für `node_modules`, damit der Host-Mount die Installation im Container nicht überschreibt
- File-Watching über die Dateisystemgrenze — auf Windows je nach Setup träge bis unzuverlässig
- schlechteres Debugging: Breakpoints und Hot-Reload gehen über die Containergrenze, nicht direkt

Gewonnen wäre nichts, weil der Editor auf dem Host bleibt. Der **Insel-Betrieb** ist davon unberührt: Dort laufen alle Teile im Container, weil dort niemand entwickelt ([BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md)).

Ein zweiter Grund: `dotnet ef migrations` und `dotnet ef database update` laufen vom Host. Der Datenbank-Port muss also ohnehin veröffentlicht sein.

## Scope

**In Scope:** `docker-compose.yml` mit einem Service `db`, gepinnte Image-Version, benanntes Volume, Health-Check, `.env` und `.env.example` mit allen Variablen der App.

**Out of Scope:** Container für Frontend und Backend, CI/CD, Production-Images und SSL/TLS-Terminierung (alles in [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md)).

## Aufbau

```
Host                                  Docker
┌────────────────────────┐            ┌──────────────────────┐
│ ng serve      :4200    │            │  db (postgres:18)    │
│ dotnet watch  :5000    │──────────▶ │  :5432 veröffentlicht│
│ dotnet ef …            │──────────▶ │  Volume bazaar-db-data│
└────────────────────────┘            └──────────────────────┘
```

| Festlegung | Wert | Warum |
|---|---|---|
| Image | `postgres:18-alpine` | Major gepinnt, nicht `latest` — sonst wandert die Datenbank unter der Anwendung weg, und ein Major-Sprung bedeutet Dump und Restore |
| Datenbank | `bazaar` | |
| Benutzer | `bazaar` | |
| Volume | `bazaar-db-data` | benannt, nicht anonym — sonst ist es nach `docker compose down` nicht wiederzufinden |
| Port | `5432:5432` | wird vom Host aus für `dotnet ef` und das Backend gebraucht |

**Health-Check:**

| Feld | Wert |
|---|---|
| `test` | `pg_isready -U bazaar -d bazaar` |
| `interval` | `5s` |
| `timeout` | `3s` |
| `retries` | `10` |
| `start_period` | `10s` |

Zusammen rund 60 Sekunden Geduld — genug für einen kalten Start auf einem langsamen Rechner, kurz genug, dass ein echter Fehler nicht minutenlang als „startet noch" erscheint.

## Environment-Variablen

`.env` ist gitignored, `.env.example` liegt im Repository und enthält alle Schlüssel mit Platzhaltern.

| Variable | Zweck | Verbindliche Quelle |
|---|---|---|
| `POSTGRES_PASSWORD` | Datenbank-Passwort | diese Story |
| `ConnectionStrings__DefaultConnection` | Verbindung des Backends | [BPROJ-S04](BPROJ-S04-efcore-datenbank-setup.md) |
| `Jwt__Issuer` · `Jwt__Audience` · `Jwt__Secret` | Token-Parameter | [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-8 |
| `SEED_ADMIN_USER` · `SEED_ADMIN_PASSWORD` | erstes Admin-Konto beim Erststart | [Epic_Login](../../Epic_Login/epic.md) Abschnitt 4 |
| `LOCAL_HOSTNAME` | Hostname im Insel-Betrieb | [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md) |

Die Liste steht hier vollständig, weil sonst beim ersten Start auffällt, dass der Seed-Admin nicht angelegt werden kann — und niemand weiß, warum. Neue Variablen späterer Stories werden hier ergänzt.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.yml` im Projekt-Root bereitstellen, die **ausschließlich** den Service `db` mit dem Image `postgres:18-alpine` definiert.
- [ ] **AC-2** — WHEN `docker compose up -d` ausgeführt wird, THEN SHALL die Datenbank auf `localhost:5432` erreichbar sein und der Health-Check nach höchstens 60 Sekunden `healthy` melden.
- [ ] **AC-3** — THE SYSTEM SHALL den Health-Check mit `pg_isready -U bazaar -d bazaar` und den Werten aus Abschnitt „Aufbau" konfigurieren.
- [ ] **AC-4** — THE SYSTEM SHALL alle Secrets ausschließlich über `.env` einlesen; `.env` SHALL in `.gitignore` stehen und **nicht** im Repository liegen.
- [ ] **AC-5** — THE SYSTEM SHALL ein benanntes Volume `bazaar-db-data` für die Datenbankdateien verwenden.
- [ ] **AC-6** — IF `docker compose down` ausgeführt wird, THEN SHALL die Daten im Volume erhalten bleiben; `docker compose down -v` entfernt sie explizit.
- [ ] **AC-7** — THE SYSTEM SHALL eine `.env.example` mit **allen** Variablen aus Abschnitt „Environment-Variablen" als Platzhalter bereitstellen.
- [ ] **AC-8** — THE SYSTEM SHALL **keine** Container für Frontend oder Backend definieren; beide laufen in der Entwicklung auf dem Host.

## Abhängigkeiten

Keine. Die Datenbank kann vor Frontend und Backend stehen — sie braucht keines von beiden.

Umgekehrt setzt [BPROJ-S04](BPROJ-S04-efcore-datenbank-setup.md) diese Story voraus: Ohne laufende Datenbank lässt sich keine Migration anwenden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #docker #docker-compose #setup #postgresql #devenv
