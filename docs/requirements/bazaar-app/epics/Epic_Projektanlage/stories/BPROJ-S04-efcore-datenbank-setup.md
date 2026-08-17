---
id: BPROJ-S04
status: draft
depends-on: [BPROJ-S02, BPROJ-S03]
---

# Story: EF Core & Datenbank-Setup

## Ziel

Ein Entwickler richtet Entity Framework Core mit PostgreSQL ein, erstellt den `BazaarDbContext`, legt die erste leere Migration an und stellt sicher, dass Migrations bei jedem Start der App automatisch angewendet werden.

## Kontext

Alle Entitäten der Haupt-App (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen, Benutzer) verwenden EF Core mit PostgreSQL. Die erste Migration ist leer und dient als sauberer Startpunkt — Entitäten kommen in den jeweiligen fachlichen Epics.

EF Core lebt ausschließlich in `Bazaar.Infrastructure` (siehe [`spec.md`](../../../spec.md) Abschnitt 7.0.1); der `BazaarDbContext` liegt in `Bazaar.Infrastructure/Persistence/`. Die Entities selbst tragen keine EF-Attribute, das Mapping läuft per Fluent API über `IEntityTypeConfiguration<T>` je Aggregate.

Migrations werden **bei jedem Start** angewendet, nicht nur in Development. Der Produktivbetrieb ist ein LAN-Server ohne Internetzugang und ohne anwesenden Entwickler — dort führt niemand `dotnet ef database update` von Hand aus. Da es genau einen Backend-Prozess gibt (Monolith, keine Replicas), entfallen die üblichen Gegenargumente gegen Auto-Migrate: kein Race zwischen parallelen Instanzen, kein Zero-Downtime-Deployment.

## Scope

**In Scope:** `Npgsql.EntityFrameworkCore.PostgreSQL` installieren, `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, Connection String aus Environment lesen, erste leere Migration `InitialCreate`, `MigrateAsync()` bei jedem App-Start samt Wartelogik, `EnableRetryOnFailure`, Datenbankprüfung im Health-Endpoint.

**Out of Scope:** Fachliche Entitäten (folgen in den jeweiligen Epics), Seed-Daten. Das Anlegen des Seed-Admins gehört zu [Epic_Login](../../Epic_Login/epic.md), nicht hierher — es ist Fachlogik, keine Infrastruktur.

---

## Startvorgang

### Warten auf die Datenbank — zwei Ebenen

| Ebene | Aufgabe |
|---|---|
| **Compose** (`depends_on: condition: service_healthy`) | Regelfall im Insel-Betrieb: Das Backend startet erst, wenn `db` gesund meldet |
| **Retry in der App** um `MigrateAsync()` | Auffangnetz: 10 Versuche, Wartezeit ab 1 s verdoppelnd bis maximal 15 s, insgesamt höchstens **60 Sekunden** |

Beide Ebenen, weil sie verschiedene Fälle abdecken. Der Compose-Gate greift nur beim gemeinsamen Start — nicht, wenn die Datenbank später kurz weg ist, und nicht, wenn ein Entwickler das Backend auf dem Host startet, während der Container noch hochfährt.

Ohne Wartelogik stirbt das Backend im ersten Versuch, `restart: unless-stopped` startet es neu, und beim zweiten oder dritten Mal klappt es. Das funktioniert, sieht im Log aber wie ein Fehler aus und verzögert den Start unnötig.

Der `depends_on`-Eintrag gehört ins Insel-Overlay → [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md).

### Zwei Abbruchgründe, zwei Meldungen

| Fall | Verhalten |
|---|---|
| **Datenbank nicht erreichbar** (nach Ablauf der Wartezeit) | Abbruch mit Exit-Code ≠ 0, Log nennt Host, Port und Datenbankname aus dem Connection String — **ohne Passwort** |
| **Migration schlägt inhaltlich fehl** (Spalte existiert, Constraint verletzt, halb angewendet) | Abbruch mit Exit-Code ≠ 0, Log nennt den Namen der fehlgeschlagenen Migration und die Datenbankmeldung |

**Bei fehlgeschlagener Migration serviert die App nicht** — kein „läuft halb weiter". Ein Backend, das mit unklarem Schema Anfragen annimmt, produziert Datenfehler, die niemand mehr auseinandersortiert; ein Backend, das nicht startet, ist ein sichtbares Problem mit einer Log-Zeile.

### Transiente Fehler im Betrieb

`EnableRetryOnFailure(3)` ist aktiviert: Ein Kassenvorgang, der wegen eines einzelnen Netzwerk-Schluckaufs im LAN scheitert, während der Kunde wartet, ist teurer als die Disziplin, die das kostet.

**Die Disziplin, die es kostet:** Sobald eine Execution Strategy aktiv ist, wirft EF Core bei jeder **selbst geöffneten** Transaktion eine Ausnahme, wenn sie nicht in `strategy.ExecuteAsync(...)` eingeschlossen ist. Das betrifft alle fünf Transaktions-Endpoints dieser App — `intake`, `release`, `sales`, `settlement`, `import` ([`api/cross-cutting.md`](../../../api/cross-cutting.md) Abschnitt „Transaktions-Vorgänge"). Sie **müssen** die Execution Strategy verwenden.

Der Hinweis steht hier, weil der Konflikt sonst erst beim ersten `POST /api/sales` auffällt — zur Laufzeit, mit einer Ausnahme, die nichts über ihre Ursache sagt.

---

## Health-Endpoint

`GET /health` prüft die Datenbankverbindung **mit**:

| Zustand | Antwort |
|---|---|
| Datenbank erreichbar | `200` · `{ "status": "healthy" }` |
| Datenbank nicht erreichbar | `503` · `{ "status": "unhealthy" }` |

Umsetzung über `AddHealthChecks().AddDbContextCheck<BazaarDbContext>()` — kein Eigenbau. Der Endpoint bleibt ohne Auth und ohne `/api`-Präfix.

Grund: Ein Endpoint, der `healthy` meldet, während die Datenbank fehlt, ist im Insel-Betrieb die einzige Stelle, an der jemand nachsieht — und würde dort das Falsche sagen. Nebennutzen: Der Compose-Health-Check des Backend-Containers kann denselben Endpoint verwenden, statt einen zweiten Weg zu erfinden.

Das ändert [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-7, wo `/health` als statische Antwort beschrieben war.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL `Npgsql.EntityFrameworkCore.PostgreSQL` als NuGet-Paket in `Bazaar.Infrastructure` installieren und den Kontext in `Program.cs` registrieren.
- [ ] **AC-2** — THE SYSTEM SHALL einen `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, der den Connection String ausschließlich aus `ConnectionStrings__DefaultConnection` liest.
- [ ] **AC-3** — THE SYSTEM SHALL eine erste Migration mit dem Namen `InitialCreate` anlegen; die Migration enthält keine Tabellenänderungen (leerer Stand).
- [ ] **AC-4** — WHEN die App startet, THEN SHALL `dbContext.Database.MigrateAsync()` unabhängig von der Environment automatisch ausgeführt werden, sodass die DB auf dem aktuellen Migrations-Stand ist.
- [ ] **AC-4b** — THE SYSTEM SHALL das Entity-Mapping per Fluent API über `IEntityTypeConfiguration<T>` je Aggregate vornehmen; Entity-Klassen SHALL keine EF-Core-Attribute tragen.
- [ ] **AC-5** — WHEN die App startet und die Datenbank noch nicht erreichbar ist, THEN SHALL das System den Verbindungsaufbau bis zu 10-mal wiederholen (Wartezeit ab 1 s verdoppelnd, maximal 15 s je Versuch, insgesamt höchstens 60 Sekunden), bevor es abbricht.
- [ ] **AC-5b** — IF die Datenbank nach Ablauf der Wartezeit nicht erreichbar ist, THEN SHALL die App mit Exit-Code ≠ 0 abbrechen und Host, Port und Datenbankname im Log nennen — **ohne** Passwort.
- [ ] **AC-5c** — IF eine Migration inhaltlich fehlschlägt, THEN SHALL die App mit Exit-Code ≠ 0 abbrechen, den Namen der fehlgeschlagenen Migration samt Datenbankmeldung loggen und **keine** Anfragen annehmen.
- [ ] **AC-6** — WHEN `dotnet ef migrations list` ausgeführt wird, THEN SHALL `InitialCreate` als einzige Migration in der Liste erscheinen.
- [ ] **AC-7** — THE SYSTEM SHALL `EnableRetryOnFailure(3)` für den Npgsql-Provider konfigurieren.
- [ ] **AC-8** — THE SYSTEM SHALL jede selbst geöffnete Transaktion über die Execution Strategy ausführen (`strategy.ExecuteAsync(...)`); ein direkt geöffneter `BeginTransaction`-Aufruf ohne Strategy SHALL nicht vorkommen.
- [ ] **AC-9** — WHEN `GET /health` aufgerufen wird und die Datenbank erreichbar ist, THEN SHALL das System `200` mit `{ "status": "healthy" }` antworten; IF sie nicht erreichbar ist, THEN `503` mit `{ "status": "unhealthy" }`.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S02 | .NET-Projekt muss existieren, bevor EF Core eingerichtet werden kann |
| BPROJ-S03 | Der `db`-Container muss laufen und auf `localhost:5432` erreichbar sein — `dotnet ef` läuft vom Host |

## Tags & Piles

**Tags:** #efcore #postgresql #migration #datenbank #setup
