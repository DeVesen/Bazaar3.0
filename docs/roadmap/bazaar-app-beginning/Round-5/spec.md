---
round: Round-5
status: geklärt
---

# Spec: Round 5 — Test- und Architektur-Test-Setup

## Fein-Spezifikation

### Ziel

Testinfrastruktur beider Seiten, lauffähig mit je einem Beispieltest als Nachweis:
Frontend-Testrunner, xUnit-v3-Testprojekte (`Domain.UnitTests`, `Application.UnitTests`,
`Api.IntegrationTests`) mit Testcontainers-PostgreSQL, `Bazaar.Architecture.Tests` mit
NetArchTest. Keine fachlichen Testfälle, keine E2E-Tests, keine CI-Pipeline.

### Abweichung von round.md/BPROJ-S06: Vitest statt Jest

Bereits in [Round-1/plan.md](../Round-1/plan.md) mit dem Nutzer abgestimmt (2026-09-17):
Die Haupt-App spiegelt den Test-Ansatz der Referenz-App
([`src/advance-registration/frontend/BAR.App`](../../../../src/advance-registration/frontend/BAR.App))
und nutzt **Vitest** über Angular 22s eingebauten Test-Builder
(`@angular/build:unit-test`), nicht Jest/`jest-preset-angular` wie in round.md und
BPROJ-S06 wörtlich beschrieben. Round-1 hat dafür bereits `vitest` und `jsdom` als
Dev-Dependency installiert (Round-1/plan.md Schritt 3) — Round-5 richtet darauf nur noch
den Beispieltest ein, keine weitere Paketinstallation nötig.

`spec.md` §7.0 (Tech-Stack-Tabelle: „Jest") und BPROJ-S06 AC-1 sind damit ebenfalls
veraltet — gehören zum selben, in Round-1/plan.md vermerkten Doku-Abgleich (nicht Teil
dieses Rounds).

**Backend-Testframework bleibt unverändert:** xUnit v3 + Moq, wie in round.md und
BPROJ-S06 gefordert — hier keine Abweichung, die Referenz-App bestätigt exakt dieses
Setup.

### Übernommene Muster aus der Referenz-App

[`src/advance-registration/backend/tests`](../../../../src/advance-registration/backend/tests)
ist direkt strukturell übertragbar (gleiches `.csproj`-Grundgerüst, gleiche
NetArchTest-/Testcontainers-Pakete), trotz unterschiedlicher Architektur-Achse
(Modulith vs. Hexagonal):

- **`.csproj`-Muster** (`xunit.v3`, `Microsoft.Testing.Platform.MSBuild`,
  `<Using Include="Xunit" />`) 1:1 aus
  [`BAR.Architecture.Tests.csproj`](../../../../src/advance-registration/backend/tests/BAR.Architecture.Tests/BAR.Architecture.Tests.csproj)
  und
  [`BAR.Host.IntegrationTests.csproj`](../../../../src/advance-registration/backend/tests/BAR.Host.IntegrationTests/BAR.Host.IntegrationTests.csproj)
  übernehmbar — nur `NetArchTest.Rules` bzw. `Testcontainers.PostgreSql` +
  `Microsoft.AspNetCore.Mvc.Testing` + `Moq` je nach Projekt.
- **`PostgresWebApplicationFactory`-Pattern**
  ([`HealthEndpointTests.cs`](../../../../src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/HealthEndpointTests.cs)
  Zeilen 1–31): `WebApplicationFactory<Program>` + `IAsyncLifetime`, startet einen
  `PostgreSqlContainer` (`postgres:18-alpine`, identisch zu Round-4/BPROJ-S03) und
  überschreibt `ConnectionStrings:DefaultConnection` per `UseSetting` — **1:1
  übernehmbar**, nur Namespace `Bazaar.Api.IntegrationTests` statt `BAR.Host...`.
- **`DependencyDirectionTests`-Pattern**
  ([`DependencyDirectionTests.cs`](../../../../src/advance-registration/backend/tests/BAR.Architecture.Tests/DependencyDirectionTests.cs)):
  Struktur (Types.InAssembly().Should().NotHaveDependencyOnAny(...)) übernehmbar, Inhalt
  **deutlich einfacher**, da die Haupt-App hexagonal mit einem Hexagon (kein Modulith) ist
  — keine Modul-Paar-Prüfung (`ModulePairs`), keine `.Contracts`-Grenze. Nur die drei
  Regeln aus BPROJ-S06 AC-5 (a)–(c), s. Implementationsplan Schritt 6.

### Akzeptanzkriterien

Wie in [BPROJ-S06](../../../requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S06-test-und-architektur-setup.md)
AC-1 bis AC-7, mit AC-1 angepasst gemäß obiger Vitest-Abweichung: „THE SYSTEM SHALL im
Frontend Angulars eingebauten Test-Builder (`@angular/build:unit-test`, Vitest) nutzen;
`npm test` SHALL die `.spec.ts`-Dateien ausführen (kein Karma, kein Jest)."

### Bewusst nicht in diesem Round

Fachliche Testfälle, E2E-Tests (Playwright/Cypress), CI-Pipeline.

