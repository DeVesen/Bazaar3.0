---
id: BPROJ-S06
status: draft
depends-on: [BPROJ-S01, BPROJ-S02]
---

# Story: Test- und Architektur-Test-Setup

## Ziel

Ein Entwickler richtet die Testinfrastruktur beider Seiten ein — Jest für das Angular-Frontend, xUnit für das .NET-Backend — und ergänzt ein Architektur-Testprojekt, das die hexagonale Abhängigkeitsrichtung automatisiert prüft.

## Kontext

Ohne Testinfrastruktur im Setup-Epic würde jedes fachliche Epic sein eigenes Test-Setup mitbringen — oder keins.

Der Architektur-Test schließt die Lücke, die der Compiler offen lässt: Projektreferenzen ([BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-2) verhindern eine falsche Richtung *zwischen* Projekten, aber nicht, dass eine Domain-Klasse Serialisierungs- oder Web-Annotationen trägt, ein Handler direkt einen `DbContext` erwartet oder ein Repository-Interface außerhalb von `Domain/Ports/` landet. [`spec.md`](../../../spec.md) Abschnitt 7.0.1 fordert dieses Projekt ausdrücklich.

## Scope

**In Scope:** Jest + `jest-preset-angular` im Frontend, xUnit v3 + FluentAssertions + Moq im Backend, Testprojekt-Struktur, `Bazaar.Architecture.Tests` mit NetArchTest, ein Beispieltest je Ebene als lauffähiger Nachweis.

**Out of Scope:** Fachliche Tests (entstehen mit dem jeweiligen Epic), E2E-Tests (Playwright/Cypress — bewusst nicht im MVP), CI-Pipeline.

## Voraussetzungen an die Testumgebung

Testcontainers startet echte Container. Ohne die folgenden Voraussetzungen schlagen die
Integrationstests fehl — nicht mit einem Testfehler, sondern beim Aufbau der Umgebung:

| Voraussetzung | Anforderung | Wirkung, wenn sie fehlt |
|---|---|---|
| **Docker-Daemon** | läuft und ist für den ausführenden Benutzer erreichbar | `dotnet test` scheitert beim Start des Postgres-Containers, keine Testausführung |
| **Image `postgres:18-alpine`** | wird beim ersten Lauf gezogen | erster Testlauf braucht Netzzugang; danach liegt es im lokalen Cache |
| **Freie Ports** | Testcontainers wählt selbst zufällige Host-Ports | keine Kollision mit dem Dev-Container aus BPROJ-S03, weil dieser auf 5432 liegt und Testcontainers 5432 nicht belegt |

Dieselbe PostgreSQL-Major wie in Entwicklung und Betrieb — sonst testet man gegen ein
anderes Datenbankverhalten als das ausgelieferte (BPROJ-S03).

**Unit- und Architektur-Tests brauchen kein Docker.** Nur `Bazaar.Api.IntegrationTests` ist
betroffen; `Bazaar.Domain.UnitTests`, `Bazaar.Application.UnitTests` und
`Bazaar.Architecture.Tests` laufen ohne. Wer ohne Docker arbeitet, kann diese drei Projekte
einzeln ausführen.

## Test-Struktur

```
frontend/
└── src/app/**/<name>.spec.ts        ← co-located neben dem Testobjekt

backend/
├── Bazaar.Domain.UnitTests/         ← Aggregate, Domain-Services (ohne Mocks)
├── Bazaar.Application.UnitTests/    ← Handler gegen gemockte Ports
├── Bazaar.Api.IntegrationTests/     ← WebApplicationFactory, echte Endpoints
└── Bazaar.Architecture.Tests/       ← NetArchTest-Regeln
```

Testprojekte spiegeln die Produktionsstruktur 1:1. Namensschema der Testmethoden: `<Methode>_<Situation>_<Erwartung>`, Aufbau strikt Arrange-Act-Assert.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL im Frontend Jest mit `jest-preset-angular` konfigurieren; `npm test` SHALL die `.spec.ts`-Dateien ausführen (kein Karma).
- [ ] **AC-2** — THE SYSTEM SHALL im Backend die Testprojekte `Bazaar.Domain.UnitTests`, `Bazaar.Application.UnitTests` und `Bazaar.Api.IntegrationTests` mit xUnit v3, FluentAssertions und Moq anlegen und in `Bazaar.sln` aufnehmen.
- [ ] **AC-3** — THE SYSTEM SHALL `Bazaar.Api.IntegrationTests` über `WebApplicationFactory` gegen die echte Endpoint-Registrierung testen; die Datenbank SHALL dabei über einen PostgreSQL-Container (Testcontainers, Image **`postgres:18-alpine`** wie in [BPROJ-S03](BPROJ-S03-docker-compose-setup.md)) bereitgestellt werden, nicht über einen In-Memory-Provider.
- [ ] **AC-3b** — IF kein erreichbarer Docker-Daemon vorhanden ist, THEN SHALL der Testlauf mit einer Meldung abbrechen, die Docker als Ursache nennt — nicht mit einem unspezifischen Verbindungsfehler.
- [ ] **AC-4** — THE SYSTEM SHALL ein Projekt `Bazaar.Architecture.Tests` mit NetArchTest anlegen.
- [ ] **AC-5** — THE SYSTEM SHALL folgende Architektur-Regeln als Tests prüfen: (a) Typen in `Bazaar.Domain` haben keine Abhängigkeit auf `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore` oder `System.Text.Json`; (b) Typen in `Bazaar.Application` haben keine Abhängigkeit auf `Bazaar.Infrastructure`; (c) Repository- und Query-Interfaces liegen ausschließlich in `Bazaar.Domain.Ports`.
- [ ] **AC-6** — WHEN eine Architektur-Regel verletzt wird, THEN SHALL `dotnet test` mit Fehler abbrechen und den verletzenden Typnamen nennen.
- [ ] **AC-7** — THE SYSTEM SHALL je Ebene einen lauffähigen Beispieltest enthalten (Frontend: eine Komponente; Domain: eine Entität; Api: `GET /health`), damit die Infrastruktur nachweisbar funktioniert.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | Angular-Projekt muss existieren, bevor Jest konfiguriert werden kann |
| BPROJ-S02 | Die vier Backend-Projekte müssen existieren, bevor Architektur-Regeln sie prüfen können |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #testing #jest #xunit #netarchtest #testcontainers #setup #hexagonal
