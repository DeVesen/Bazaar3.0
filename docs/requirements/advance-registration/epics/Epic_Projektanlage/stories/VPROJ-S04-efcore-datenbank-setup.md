---
id: VPROJ-S04
status: draft
depends-on: [VPROJ-S02, VPROJ-S03]
---

# Story: EF Core & Datenbank-Setup

## Ziel

Ein Entwickler richtet Entity Framework Core mit PostgreSQL ein, erstellt den `BazaarDbContext`, legt die erste leere Migration an und stellt sicher, dass Migrations bei jedem Start der App zuverlässig angewendet werden.

## Kontext

Alle Entitäten der Voranmelde-App (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen, Nummernblöcke) verwenden EF Core mit PostgreSQL. Der Cloud-Betrieb erfordert, dass Migrations sowohl lokal als auch in Azure Container Apps zuverlässig angewendet werden.

## Scope

**In Scope:** `Npgsql.EntityFrameworkCore.PostgreSQL` installieren, `BazaarDbContext` anlegen, Connection String aus Environment lesen, erste leere Migration `InitialCreate`, `MigrateAsync()` beim App-Start samt Wartelogik, `EnableRetryOnFailure`, Readiness-Endpoint.

**Verortung (Hexagonal, siehe VPROJ-S02):** `BazaarDbContext`, Migrations, Entity-Konfigurationen und Repository-Implementierungen liegen ausschließlich in `Bazaar.Infrastructure`. Die Entity-Klassen selbst liegen in `Bazaar.Domain` und tragen **keine** EF-Attribute — das Mapping passiert per Fluent API in `Infrastructure/Persistence/Configurations/` (`IEntityTypeConfiguration<T>` je Aggregate).

**Out of Scope:** Fachliche Entitäten (folgen in den jeweiligen Epics), Seed-Daten, Datenbankschema für User/Auth (folgt in Epic_Login).

---

## Genau eine Replica

`MigrateAsync()` bei jedem Start setzt voraus, dass **ein einziger Prozess** migriert. Azure Container Apps skaliert standardmäßig; zwei gleichzeitig startende Replicas würden beide migrieren, und EF Core hat **keinen** eingebauten Migrations-Lock.

**Deshalb: `minReplicas: 1`, `maxReplicas: 1`.**

Begründung: Die App bedient in der Voranmeldephase eine zweistellige Zahl von Verkäufern. Horizontale Skalierung löst hier kein Problem, das existiert, kostet aber genau diese Konsistenzgarantie. Der Deployment-Wert gehört in die Container-Apps-Konfiguration (dort out of scope, siehe VPROJ-S03) — die **Anforderung** steht hier, weil sie eine Bedingung der Migrationsstrategie ist, nicht eine Betriebsvorliebe.

Soll später skaliert werden, muss die Migration **aus dem App-Start heraus** in einen eigenen Deployment-Schritt wandern. Das ist eine eigene Entscheidung mit eigenem Artefakt, kein Nebeneffekt einer Skalierungseinstellung.

---

## Startvorgang

### Warten auf die Datenbank

Retry um `MigrateAsync()`: **10 Versuche**, Wartezeit ab 1 s verdoppelnd bis maximal 15 s, insgesamt höchstens **60 Sekunden**.

Im Cloud-Betrieb ist der Fall wahrscheinlicher als lokal: Ein managed PostgreSQL kann während eines Failovers für Sekunden nicht erreichbar sein, und ein Deployment startet den Container ohne Rücksicht darauf. Lokal greift zusätzlich der Compose-Health-Gate (`depends_on: condition: service_healthy`, VPROJ-S03) — in der Cloud gibt es diese Ebene nicht.

### Zwei Abbruchgründe, zwei Meldungen

| Fall | Verhalten |
|---|---|
| **Datenbank nicht erreichbar** (nach Ablauf der Wartezeit) | Abbruch mit Exit-Code ≠ 0, Log nennt Host, Port und Datenbankname — **ohne** Passwort |
| **Migration schlägt inhaltlich fehl** (Spalte existiert, Constraint verletzt, halb angewendet) | Abbruch mit Exit-Code ≠ 0, Log nennt den Namen der fehlgeschlagenen Migration und die Datenbankmeldung |

Bei fehlgeschlagener Migration nimmt die App **keine** Anfragen an. Ein Backend mit unklarem Schema produziert Datenfehler, die niemand mehr auseinandersortiert.

### Transiente Fehler im Betrieb

`EnableRetryOnFailure(3)` ist aktiviert — im Cloud-Betrieb der Normalfall, nicht die Ausnahme.

**Die Pflicht, die daraus folgt:** Sobald eine Execution Strategy aktiv ist, wirft EF Core bei jeder **selbst geöffneten** Transaktion eine Ausnahme, wenn sie nicht in `strategy.ExecuteAsync(...)` eingeschlossen ist. Diese App hat mehrere solche Transaktionen — Artikel anlegen samt Blockvergabe ([`api/articles.md`](../../../api/articles.md), [`api/blocks.md`](../../../api/blocks.md)), Refresh-Token-Rotation ([`api/auth.md`](../../../api/auth.md)), Namensänderung mit Kaskade ([`api/master-data.md`](../../../api/master-data.md)).

**Sonderfall Nummernblock-Vergabe:** Sie enthält eine **fachliche** Wiederholung — bei Verstoß gegen den Exclusion-Constraint wird die Suche einmal mit dem aktuellen Stand erneuert ([`api/blocks.md`](../../../api/blocks.md) Abschnitt 6). Diese Wiederholung liegt **innerhalb** der Strategy-Ausführung, nicht darum herum.

Andernfalls würde der Constraint-Verstoß als transienter Fehler behandelt und der ganze Vorgang blind wiederholt, statt die Suche zu erneuern. Ein Constraint-Verstoß ist kein Netzwerkproblem — er ist die Antwort auf ein Rennen, das man verloren hat.

---

## Liveness und Readiness getrennt

| Endpoint | Prüft | Antwort | Verwendung in Container Apps |
|---|---|---|---|
| `GET /health` | nur den Prozess | immer `200` · `{ "status": "healthy" }` | **Liveness**-Probe |
| `GET /health/ready` | Prozess **und** Datenbankverbindung | `200` bzw. `503` · `{ "status": "unhealthy" }` | **Readiness**-Probe |

**`/health` darf die Datenbank nicht prüfen.** Eine fehlgeschlagene Liveness-Probe führt zum **Neustart** des Containers. Bei einem Datenbank-Ausfall würde die Plattform also endlos Container neu starten — das behebt den Ausfall nicht, es verlängert ihn.

Die Readiness-Probe ist der richtige Ort: Sie nimmt die Instanz aus dem Verkehr, ohne sie zu töten, und holt sie zurück, sobald die Datenbank wieder antwortet.

Umsetzung über `AddHealthChecks()` mit zwei Tags — `AddDbContextCheck<BazaarDbContext>()` nur im Readiness-Satz. Kein Eigenbau.

**Bewusste Abweichung von der Haupt-App:** Dort prüft `/health` die Datenbank mit, weil es keine Plattform gibt, die daraus Neustarts ableitet — im LAN schaut ein Mensch hin. Hier entscheidet eine Probe über Neustarts.

---

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL `Npgsql.EntityFrameworkCore.PostgreSQL` als NuGet-Paket **in `Bazaar.Infrastructure`** installieren und den DbContext über eine `AddInfrastructure()`-Extension in `Program.cs` registrieren (`Bazaar.Api` referenziert Npgsql nicht direkt).
- [ ] **AC-2** — THE SYSTEM SHALL einen `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, der den Connection String **ausschließlich** aus `ConnectionStrings__DefaultConnection` liest.
- [ ] **AC-3** — THE SYSTEM SHALL eine erste Migration mit dem Namen `InitialCreate` im Projekt `Bazaar.Infrastructure` anlegen (`dotnet ef migrations add InitialCreate -p Bazaar.Infrastructure -s Bazaar.Api`); die Migration enthält keine Tabellenänderungen (leerer Stand).
- [ ] **AC-4** — WHEN die App startet (unabhängig von der Umgebung), THEN SHALL `dbContext.Database.MigrateAsync()` automatisch ausgeführt werden.
- [ ] **AC-4b** — THE SYSTEM SHALL das Deployment auf **genau eine Replica** festlegen (`minReplicas: 1`, `maxReplicas: 1`), solange die Migration beim App-Start läuft.
- [ ] **AC-5** — WHEN die App startet und die Datenbank noch nicht erreichbar ist, THEN SHALL das System den Verbindungsaufbau bis zu 10-mal wiederholen (Wartezeit ab 1 s verdoppelnd, maximal 15 s je Versuch, insgesamt höchstens 60 Sekunden), bevor es abbricht.
- [ ] **AC-5b** — IF die Datenbank nach Ablauf der Wartezeit nicht erreichbar ist, THEN SHALL die App mit Exit-Code ≠ 0 abbrechen und Host, Port und Datenbankname im Log nennen — **ohne** Passwort.
- [ ] **AC-5c** — IF eine Migration inhaltlich fehlschlägt, THEN SHALL die App mit Exit-Code ≠ 0 abbrechen, den Namen der fehlgeschlagenen Migration samt Datenbankmeldung loggen und **keine** Anfragen annehmen.
- [ ] **AC-6** — WHEN `dotnet ef migrations list` ausgeführt wird, THEN SHALL `InitialCreate` als einzige Migration in der Liste erscheinen.
- [ ] **AC-7** — THE SYSTEM SHALL `EnableRetryOnFailure(3)` für den Npgsql-Provider konfigurieren.
- [ ] **AC-8** — THE SYSTEM SHALL jede selbst geöffnete Transaktion über die Execution Strategy ausführen (`strategy.ExecuteAsync(...)`); ein direkt geöffneter `BeginTransaction`-Aufruf ohne Strategy SHALL nicht vorkommen.
- [ ] **AC-8b** — THE SYSTEM SHALL die fachliche Wiederholung der Nummernblock-Suche **innerhalb** der Strategy-Ausführung halten, sodass ein Exclusion-Constraint-Verstoß nicht als transienter Fehler behandelt wird.
- [ ] **AC-9** — THE SYSTEM SHALL `GET /health` ohne Datenbankprüfung bereitstellen (immer `200`) und `GET /health/ready` mit Datenbankprüfung (`503` bei fehlender Verbindung).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S02 | .NET-Projekt muss existieren, bevor EF Core eingerichtet werden kann |
| VPROJ-S03 | Der `db`-Container muss laufen und erreichbar sein, damit die Migration angewendet werden kann |

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #efcore #postgresql #migration #datenbank #setup #cloud #readiness
