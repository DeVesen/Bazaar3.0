---
id: VPROJ-S05
status: draft
depends-on: [VPROJ-S01, VPROJ-S02]
---

# Story: Test- und Architektur-Test-Setup

## Ziel

Ein Entwickler richtet die Testinfrastruktur beider Seiten ein — **Vitest** für das Angular-Frontend, xUnit für das .NET-Backend — und ergänzt ein Architektur-Testprojekt, das die hexagonale
Abhängigkeitsrichtung automatisiert prüft.

## Kontext

Ohne Testinfrastruktur im Setup-Epic würde jedes fachliche Epic sein eigenes Test-Setup
mitbringen — oder keins. Der Architektur-Test schließt die Lücke, die der Compiler offen
lässt: Projektreferenzen (VPROJ-S02 AC-2) verhindern eine falsche Richtung *zwischen*
Projekten, aber nicht, dass eine Domain-Klasse Serialisierungs- oder Web-Annotationen
trägt oder ein Handler direkt einen `DbContext` erwartet.

## Scope

**In Scope:** Vitest im Frontend, xUnit v3 + Moq
im Backend, Testprojekt-Struktur, `BAR.Architecture.Tests` mit NetArchTest, ein
Beispieltest je Ebene als lauffähiger Nachweis.

**Out of Scope:** Fachliche Tests (entstehen mit dem jeweiligen Epic), E2E-Tests
(Playwright/Cypress — bewusst nicht im MVP), CI-Pipeline.

## Voraussetzungen an die Testumgebung

Testcontainers startet echte Container. Ohne die folgenden Voraussetzungen schlagen die
Integrationstests fehl — nicht mit einem Testfehler, sondern beim Aufbau der Umgebung:

| Voraussetzung | Anforderung | Wirkung, wenn sie fehlt |
|---|---|---|
| **Docker-Daemon** | läuft und ist für den ausführenden Benutzer erreichbar | `dotnet test` scheitert beim Start des Postgres-Containers, keine Testausführung |
| **Image `postgres:18-alpine`** | wird beim ersten Lauf gezogen | erster Testlauf braucht Netzzugang; danach liegt es im lokalen Cache |
| **Freie Ports** | Testcontainers wählt selbst zufällige Host-Ports | keine Kollision mit dem Dev-Container aus VPROJ-S03, weil dieser auf 5432 liegt und Testcontainers 5432 nicht belegt |

Dieselbe PostgreSQL-Major wie in Entwicklung und Betrieb — sonst testet man gegen ein
anderes Datenbankverhalten als das ausgelieferte (VPROJ-S03).

**Unit- und Architektur-Tests brauchen kein Docker.** Nur `BAR.Host.IntegrationTests` ist
betroffen; `BAR.Domain.UnitTests`, `BAR.Application.UnitTests` und
`BAR.Architecture.Tests` laufen ohne. Wer ohne Docker arbeitet, kann diese drei Projekte
einzeln ausführen.

## Test-Struktur

```
frontend/
└── src/app/**/<name>.spec.ts        ← co-located neben dem Testobjekt

backend/
├── global.json                        ← test.runner = Microsoft.Testing.Platform
└── tests/
    ├── BAR.Domain.UnitTests/          ← Aggregate, Domain-Services (ohne Mocks)
    ├── BAR.Application.UnitTests/     ← Handler gegen gemockte Ports
    ├── BAR.Host.IntegrationTests/     ← WebApplicationFactory, echte Endpoints
    └── BAR.Architecture.Tests/        ← NetArchTest-Regeln
```

Testprojekte spiegeln die Produktionsstruktur 1:1, liegen aber gesammelt unter `tests/` —
sonst stehen sie zwischen den Produktionsprojekten und die Solution-Wurzel wird unlesbar.
Namensschema der Testmethoden: `<Methode>_<Situation>_<Erwartung>`, Aufbau strikt
Arrange-Act-Assert.

### Test-Runner: Microsoft.Testing.Platform, nicht VSTest

xUnit v3 (`xunit.v3`) bringt Microsoft.Testing.Platform 2.x mit, und das unterstützt den
VSTest-Pfad unter dem .NET-10-SDK nicht mehr. Ohne Umschaltung bricht `dotnet test` mit
*„Testing with VSTest target is no longer supported by Microsoft.Testing.Platform on
.NET 10 SDK and later"* ab. Daraus folgt:

| Punkt | Festlegung |
|---|---|
| Umschaltung | `global.json` auf `backend/`-Ebene mit `{ "test": { "runner": "Microsoft.Testing.Platform" } }` |
| Nicht ausreichend | `<TestingPlatformDotnetTestSupport>` — das ist der .NET-9-Weg und greift unter SDK 10 nicht |
| Nicht ausreichend | `dotnet.config` mit `[dotnet.test.runner]` — praktisch erprobt, wirkt hier nicht |
| Entfallene Pakete | `Microsoft.NET.Test.Sdk`, `xunit.runner.visualstudio`, `coverlet.collector` — alle drei sind VSTest |
| Coverage | falls später nötig, über `Microsoft.Testing.Extensions.CodeCoverage`, nicht coverlet |
| Testprojekte | brauchen `<OutputType>Exe</OutputType>` — gesetzt in `Directory.Build.props` |

**Kein Testprojekt ohne Test.** MTP wertet „Zero tests ran" als Fehlschlag. Ein
Testprojekt entsteht daher erst, wenn es einen echten Test aufnehmen kann — ein
Platzhaltertest, der nichts prüft, ist die schlechtere Wahl. Konkret: `BAR.Application.UnitTests`
entsteht mit dem ersten Handler (Epic_Login), nicht bereits in dieser Story.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL im Frontend Vitest über den `@angular/build:unit-test`-Builder konfigurieren; `npm test` SHALL die `.spec.ts`-Dateien ausführen (kein Karma, kein Jest).
- [ ] **AC-2** — THE SYSTEM SHALL im Backend unter `tests/` die Projekte `BAR.Domain.UnitTests` und `BAR.Host.IntegrationTests` mit xUnit v3 anlegen und in `BAR.slnx` aufnehmen. `BAR.Application.UnitTests` (zusätzlich mit Moq) SHALL erst mit dem ersten Handler entstehen — siehe Abschnitt Test-Runner.
- [ ] **AC-2b** — THE SYSTEM SHALL `dotnet test` über `global.json` auf Microsoft.Testing.Platform umschalten und **keines** der VSTest-Pakete (`Microsoft.NET.Test.Sdk`, `xunit.runner.visualstudio`, `coverlet.collector`) referenzieren.
- [ ] **AC-3** — THE SYSTEM SHALL `BAR.Host.IntegrationTests` über `WebApplicationFactory` gegen die echte Endpoint-Registrierung testen; die Datenbank SHALL dabei über einen PostgreSQL-Container (Testcontainers, Image **`postgres:18-alpine`** wie in [VPROJ-S03](VPROJ-S03-docker-compose-setup.md)) bereitgestellt werden, nicht über In-Memory-Provider.
- [ ] **AC-3b** — IF kein erreichbarer Docker-Daemon vorhanden ist, THEN SHALL der Testlauf mit einer Meldung abbrechen, die Docker als Ursache nennt — nicht mit einem unspezifischen Verbindungsfehler.
- [ ] **AC-4** — THE SYSTEM SHALL ein Projekt `BAR.Architecture.Tests` mit NetArchTest anlegen.
- [ ] **AC-5** — THE SYSTEM SHALL folgende Architektur-Regeln als Tests prüfen: (a) Typen in `BAR.Domain` haben keine Abhängigkeit auf `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore` oder `System.Text.Json`; (b) Typen in `BAR.Application` haben keine Abhängigkeit auf `BAR.Infrastructure`; (c) Repository- und Query-Interfaces liegen ausschließlich in `BAR.Domain.Ports`; (d) in `BAR.Infrastructure` endet kein Typ auf `Handler` — die zugelassene Referenz `Infrastructure` → `Application` (spec.md 10.0.1) darf kein Einfallstor für Anwendungslogik werden.
- [ ] **AC-6** — WHEN eine Architektur-Regel verletzt wird, THEN SHALL `dotnet test` mit Fehler abbrechen und den verletzenden Typnamen nennen.
- [ ] **AC-7** — THE SYSTEM SHALL je Ebene einen lauffähigen Beispieltest enthalten (Frontend: eine Komponente; Domain: eine Entität; Host: `GET /health`), damit die Infrastruktur nachweisbar funktioniert.
- [ ] **AC-8** — THE SYSTEM SHALL `<InternalsVisibleTo Include="BAR.Host.IntegrationTests" />` in `BAR.Host.csproj` setzen; ohne das erreicht `WebApplicationFactory<Program>` die implizite `Program`-Klasse der Top-Level-Statements nicht.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt muss existieren, bevor Jest konfiguriert werden kann |
| VPROJ-S02 | Die vier Backend-Projekte müssen existieren, bevor Architektur-Regeln sie prüfen können |

## Tags & Piles

**Tags:** #testing #jest #xunit #netarchtest #testcontainers #setup #hexagonal
