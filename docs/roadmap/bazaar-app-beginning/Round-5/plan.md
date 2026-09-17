---
round: Round-5
status: geplant
---

# Plan: Round 5 — Test- und Architektur-Test-Setup

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-1/plan.md](../Round-1/plan.md): `src/bazaar-app/frontend/`, `vitest` + `jsdom`
  bereits als Dev-Dependency installiert (Schritt 3), Karma/Jasmine-Reste laut Schritt 9
  bereits entfernt — Round-5 muss diese Bereinigung **nicht** wiederholen, nur den
  `test`-Builder in `angular.json` auf `@angular/build:unit-test` setzen, falls Round-1
  das noch nicht final abgeschlossen hat (gegenprüfen).
- [Round-2/plan.md](../Round-2/plan.md): Vier-Projekt-Schnitt
  `Bazaar.Domain`/`.Application`/`.Infrastructure`/`.Api`, `Directory.Build.props` mit
  zentralem `TargetFramework=net10.0` — Testprojekte erben davon automatisch, sobald sie
  im selben Verzeichnisbaum liegen (`Directory.Build.props` gilt für alle
  Unterordner der `backend/`-Solution).
- [Round-3/plan.md](../Round-3/plan.md): `BazaarDbContext`,
  `ConnectionStrings__DefaultConnection`, `MigrateAsync()` beim Start (relevant für
  `PostgresWebApplicationFactory` — der Testcontainer-Connection-String muss vor dem
  ersten Request durchlaufen, damit Migrations greifen, analog Referenz-Kommentar in
  `HealthEndpointTests.cs`).
- [Round-4/plan.md](../Round-4/plan.md): `postgres:18-alpine` als Entwicklungs-Image
  (BPROJ-S03) — identische Major-Version für `Testcontainers.PostgreSql` in AC-3
  verbindlich.

## Implementationsplan

### 1. Frontend: Test-Builder aktivieren (AC-1, angepasst)

In `angular.json` (Projekt `bazaar-app`, Abschnitt `architect`):

```json
"test": {
  "builder": "@angular/build:unit-test"
}
```

Prüfen, ob Round-1 dies bereits gesetzt hat (Round-1/plan.md Schritt 9 erwähnt
Vitest-Umstellung nur allgemein) — falls nicht, hier nachholen. Kein zusätzliches
`vitest.config.ts` nötig (Referenz-App kommt ganz ohne aus, Konfiguration läuft über
`angular.json`).

### 2. Frontend: Beispieltest (AC-7)

`src/app/app.spec.ts` neben der generierten `AppComponent` (co-located, wie in der
Test-Struktur-Tabelle von BPROJ-S06 gefordert):

```typescript
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('creates the app', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

`npm test` muss grün sein.

### 3. Backend: Testprojekte anlegen (AC-2)

```
cd src/bazaar-app/backend
mkdir tests
dotnet new xunit3 -n Bazaar.Domain.UnitTests -o tests/Bazaar.Domain.UnitTests
dotnet new xunit3 -n Bazaar.Application.UnitTests -o tests/Bazaar.Application.UnitTests
dotnet new xunit3 -n Bazaar.Api.IntegrationTests -o tests/Bazaar.Api.IntegrationTests
dotnet new xunit3 -n Bazaar.Architecture.Tests -o tests/Bazaar.Architecture.Tests
dotnet sln add tests/Bazaar.Domain.UnitTests tests/Bazaar.Application.UnitTests tests/Bazaar.Api.IntegrationTests tests/Bazaar.Architecture.Tests
```

Referenzen:

```
dotnet add tests/Bazaar.Domain.UnitTests reference Bazaar.Domain
dotnet add tests/Bazaar.Application.UnitTests reference Bazaar.Application
dotnet add tests/Bazaar.Application.UnitTests package Moq
dotnet add tests/Bazaar.Api.IntegrationTests reference Bazaar.Api
dotnet add tests/Bazaar.Api.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/Bazaar.Api.IntegrationTests package Testcontainers.PostgreSql
dotnet add tests/Bazaar.Architecture.Tests reference Bazaar.Domain
dotnet add tests/Bazaar.Architecture.Tests reference Bazaar.Application
dotnet add tests/Bazaar.Architecture.Tests reference Bazaar.Infrastructure
dotnet add tests/Bazaar.Architecture.Tests reference Bazaar.Api
dotnet add tests/Bazaar.Architecture.Tests package NetArchTest.Rules
```

`.csproj`-Grundgerüst je Testprojekt danach gegen
[`BAR.Architecture.Tests.csproj`](../../../../src/advance-registration/backend/tests/BAR.Architecture.Tests/BAR.Architecture.Tests.csproj)
prüfen — `IsPackable=false`/`TestingPlatformDotnetTestSupport=true` kommen bereits aus
der zentralen `Directory.Build.props` (Round-2/plan.md Schritt 3), nicht erneut je
Testprojekt setzen.

### 4. `InternalsVisibleTo` für `Bazaar.Api.IntegrationTests` (falls nötig)

Nur erforderlich, falls `Program` intern bleibt (Top-Level-Statements). Analog
[`BAR.Host.csproj`](../../../../src/advance-registration/backend/BAR.Host/BAR.Host.csproj)
Zeilen 15–19: `Bazaar.Api.csproj` um
`<InternalsVisibleTo Include="Bazaar.Api.IntegrationTests" />` ergänzen, falls
`WebApplicationFactory<Program>` sonst nicht kompiliert.

### 5. `PostgresWebApplicationFactory` + Beispieltest (AC-3, AC-3b, AC-7)

`Bazaar.Api.IntegrationTests/PostgresWebApplicationFactory.cs`, 1:1 übernommen aus
[Referenz](../../../../src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/HealthEndpointTests.cs)
Zeilen 1–31 (Namespace anpassen, `postgres:18-alpine` beibehalten):

```csharp
public sealed class PostgresWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18-alpine").Build();

    public async ValueTask InitializeAsync() => await _postgres.StartAsync();

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("ConnectionStrings:DefaultConnection", _postgres.GetConnectionString());

    public override async ValueTask DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await base.DisposeAsync();
    }
}
```

Beispieltest `HealthEndpointTests.cs` gegen `GET /health` (AC-7, Api-Ebene):

```csharp
public class HealthEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public HealthEndpointTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetHealth_WhenDatabaseReachable_ReturnsHealthy()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
```

**AC-3b (Docker-Daemon-Fehler):** Testcontainers wirft bei fehlendem Docker-Daemon
bereits von sich aus eine aussagekräftige `DotNet.Testcontainers.Exceptions.*`-Ausnahme
mit Docker als genannter Ursache — kein Zusatzcode nötig, nur in einem README-Hinweis
(`tests/README.md` oder Kommentar an der Factory) dokumentieren, dass ein
`TestcontainersException` beim Start auf einen fehlenden/unerreichbaren Docker-Daemon
hindeutet (Nachweis in Schritt 9 durch bewusstes Stoppen von Docker vor einem Testlauf).

### 6. `Bazaar.Architecture.Tests` — drei Regeln (AC-4, AC-5, AC-6)

Deutlich schlanker als die Referenz (kein Modulith, ein Hexagon):

```csharp
public class DependencyDirectionTests
{
    private static readonly Assembly DomainAssembly = typeof(SomeMarkerType).Assembly; // Platzhalter bis erstes Aggregate existiert
    private static readonly Assembly ApplicationAssembly = typeof(SomeApplicationMarker).Assembly;

    [Fact]
    public void Domain_HasNoDependencyOnFrameworks()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should().NotHaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "System.Text.Json")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Application_HasNoDependencyOnInfrastructure()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should().NotHaveDependencyOn("Bazaar.Infrastructure")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void RepositoryPorts_LiveInDomainPorts()
    {
        var result = Types.InAssembly(DomainAssembly)
            .That().HaveNameEndingWith("Repository").And().AreInterfaces()
            .Should().ResideInNamespace("Bazaar.Domain.Ports")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
```

**Wichtig — Marker-Typ-Problem:** `Bazaar.Domain` und `Bazaar.Application` enthalten in
Round-5 noch **keine** fachlichen Typen (erste Aggregate kommen erst mit den fachlichen
Epics) — `typeof(SomeMarkerType).Assembly` braucht einen echten Anker. Lösung: einen
neutralen Marker (z. B. `internal static class AssemblyMarker {}`) in `Bazaar.Domain`
und `Bazaar.Application` anlegen, ausschließlich zu diesem Zweck, oder — vorzugswürdig —
`Assembly.Load("Bazaar.Domain")` / `Assembly.Load("Bazaar.Application")` per Namen
verwenden, damit kein Wegwerf-Typ im Produktionscode landet, der später wieder entfernt
werden müsste. Diesen Punkt beim Schreiben des Tests entscheiden (Empfehlung:
`Assembly.Load`, da BPROJ-S06 „Beispieltest je Ebene" nicht „Beispieltyp je Ebene"
verlangt).

Die vierte Referenz-Regel („Repository- und Query-Interfaces ausschließlich in
`Domain.Ports`") ist AC-5(c) bereits abgedeckt — kein weiterer Test nötig.

**Nicht übernommen aus der Referenz:** `ModulePairs`-Theorie und
`Module_Always_OnlyReferencesOtherModulesContracts` — diese Regeln gehören zur
Modulith-Architektur der Voranmelde-App und haben in der hexagonalen Haupt-App (ein
Bounded Context, keine `.Contracts`-Grenze) keine Entsprechung.

### 7. Domain- und Application-Beispieltest (AC-7)

Da noch keine fachlichen Typen existieren, genügt laut BPROJ-S06 „ein lauffähiger
Beispieltest je Ebene" — für Domain/Application in Round-5 ein **triviales**
Platzhalter-Fact (z. B. `Assert.True(true)` mit Kommentar „wird durch das erste
fachliche Aggregate ersetzt"), NICHT Teil der dauerhaften Testbasis, sondern reiner
Nachweis, dass `dotnet test` beide Projekte tatsächlich erreicht und ausführt. Erstes
fachliches Epic ersetzt diese Platzhalter durch echte Tests.

### 8. `Bazaar.sln`-Ordnerstruktur

Solution Folders `tests/` in `Bazaar.sln` anlegen (`dotnet sln add` mit `--solution-folder
tests` je Testprojekt), damit die IDE-Ansicht Produktions- und Testprojekte trennt —
kosmetisch, aber Konvention aus der Referenz-App übernommen.

### 9. Verifikation

- `npm test` (Frontend) — grün, `App`-Testfall läuft über Vitest (AC-1, AC-7).
- `dotnet test tests/Bazaar.Architecture.Tests` — läuft ohne Docker, alle drei Regeln
  grün (AC-4, AC-5).
- Bewusster Architektur-Verstoß (temporär: ein Repository-Interface außerhalb
  `Domain.Ports` anlegen) → `dotnet test` schlägt fehl, nennt den Typnamen → danach
  wieder entfernen (AC-6, Nachweis).
- `dotnet test tests/Bazaar.Domain.UnitTests tests/Bazaar.Application.UnitTests` — läuft
  ohne Docker (BPROJ-S06 „Voraussetzungen an die Testumgebung").
- Docker-Daemon stoppen, `dotnet test tests/Bazaar.Api.IntegrationTests` ausführen →
  Fehlermeldung nennt Docker als Ursache (AC-3b) — danach Docker wieder starten und
  regulär grün laufen lassen (AC-3, AC-7).

## Reihenfolge

1–2 (Frontend) unabhängig von 3–8 (Backend), beide Stränge parallelisierbar. Innerhalb
Backend: 3 → 4 → 5 sequenziell (Api.IntegrationTests-Projekt muss vor der Factory
stehen), 6–7 unabhängig von 5, aber nach 3, 8 jederzeit nach 3, 9 abschließend nach
allem.
