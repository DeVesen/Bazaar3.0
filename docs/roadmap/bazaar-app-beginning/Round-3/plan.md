---
round: Round-3
status: geplant
---

# Plan: Round 3 — EF Core & Datenbankanbindung

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

Aus [Round-2/plan.md](../Round-2/plan.md) vorhanden:

- Vier-Projekt-Schnitt `Bazaar.Domain`/`.Application`/`.Infrastructure`/`.Api` mit
  compiler-erzwungener Referenzrichtung, `Directory.Build.props`
  (`TargetFramework=net10.0`, `Nullable=enable`, …).
- `Bazaar.Api/Features/Public/HealthEndpoints.cs` mit `GET /health` →
  `Results.Ok(new HealthResponse("healthy"))`, ohne DB-Prüfung — **wird in Round-3
  erweitert** (s. o.).
- `Bazaar.Api/ExceptionHandling/DomainExceptionHandler.cs`,
  `Bazaar.Domain/Exceptions/` (`DomainException`, `NotFoundException`,
  `ConflictException`, `UnauthorizedException`, `ForbiddenException`).
- `Bazaar.Infrastructure/Persistence/` existiert bereits als leeres Verzeichnis
  (`.gitkeep`, Round-2/plan.md Schritt 4).
- JWT-Bearer und CORS bereits registriert in `Program.cs` (Round-2/plan.md Schritte 8–9)
  — Round-3 fügt EF-Core-Registrierung in derselben Datei hinzu, ändert daran nichts.

## Implementationsplan

### 1. NuGet-Paket

```
dotnet add Bazaar.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add Bazaar.Api package Microsoft.EntityFrameworkCore.Design
```

`Microsoft.EntityFrameworkCore.Design` nur in `Bazaar.Api` (Startprojekt für
`dotnet ef`), nicht in `Bazaar.Infrastructure` — vermeidet Design-Time-Abhängigkeiten in
der Bibliothek, die zur Laufzeit ausgeliefert wird.

### 2. `BazaarDbContext` (AC-2, AC-4b)

`Bazaar.Infrastructure/Persistence/BazaarDbContext.cs`:

```csharp
public sealed class BazaarDbContext(DbContextOptions<BazaarDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BazaarDbContext).Assembly);
    }
}
```

`Bazaar.Infrastructure/Persistence/Configurations/` als Zielordner für künftige
`IEntityTypeConfiguration<T>`-Klassen (leer, `.gitkeep`) — `ApplyConfigurationsFromAssembly`
sammelt sie automatisch ein, sobald fachliche Epics welche anlegen.

Registrierung in `Program.cs`:

```csharp
builder.Services.AddDbContext<BazaarDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings__DefaultConnection is missing.");
    options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3));
});
```

`GetConnectionString("DefaultConnection")` liest exakt `ConnectionStrings__DefaultConnection`
(Standard-Env-Var-Mapping von `IConfiguration`) — kein Klartext in `appsettings.json`
(AC-2).

### 3. Erste leere Migration (AC-3, AC-6)

```
dotnet ef migrations add InitialCreate --project Bazaar.Infrastructure --startup-project Bazaar.Api
```

Voraussetzung: lokale Postgres-Instanz erreichbar (s. Reihenfolge-Hinweis oben) und
`ConnectionStrings__DefaultConnection` in `Bazaar.Api/appsettings.Development.json`
bzw. per Env gesetzt, da `dotnet ef` zur Design-Zeit denselben Connection String nutzt.
Migration muss leer sein — kein `modelBuilder`-Aufruf vor dem ersten Aggregate erzeugt
Tabellenänderungen.

### 4. Start-Sequenz: Warten + Migrieren (AC-4, AC-5, AC-5b, AC-5c)

`Program.cs`, nach `builder.Build()`, vor `app.Run()`:

```csharp
await ApplyMigrationsAsync(app);

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BazaarDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (!await WaitForDatabaseAsync(dbContext, logger))
    {
        Environment.Exit(1);
        return;
    }

    var pending = (await dbContext.Database.GetPendingMigrationsAsync()).FirstOrDefault() ?? "unbekannt";
    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Migration {Migration} failed: {Message}", pending, ex.Message);
        Environment.Exit(1);
    }
}
```

`WaitForDatabaseAsync` 1:1 nach dem Muster aus
[`BAR.Host/Program.cs`](../../../../src/advance-registration/backend/BAR.Host/Program.cs)
Zeilen 203–235 (10 Versuche, Wartezeit ab 1 s verdoppelnd bis max. 15 s, Gesamtdeckel
60 s, Log ohne Passwort über `dbContext.Database.GetDbConnection().DataSource`/
`.Database`).

`MigrateAsync()` läuft **unabhängig von der Environment** (AC-4) — kein
`if (IsDevelopment())` darum.

### 5. Health-Check statt statischer Antwort (AC-9, ersetzt Round-2 Schritt 10)

```
dotnet add Bazaar.Api package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore
```

`Program.cs`: `builder.Services.AddHealthChecks().AddDbContextCheck<BazaarDbContext>();`

`Bazaar.Api/Features/Public/HealthEndpoints.cs` — `MapGet("/health", ...)` durch
`MapHealthChecks` ersetzen:

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        var status = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy";
        await ctx.Response.WriteAsync($$"""{"status":"{{status}}"}""");
    }
}).AllowAnonymous();
```

`HealthResponse`-Record aus Round-2 entfällt (wird durch den Health-Checks-eigenen
Report ersetzt); `WithName("GetHealth")` kann auf `MapHealthChecks` nicht gesetzt werden
und entfällt ersatzlos.

### 6. Repository-Muster als Vorlage (kein konkretes Repository)

`Bazaar.Domain/Ports/README.md` (oder Kommentar an prominenter Stelle) dokumentiert die
Konvention für die fachlichen Epics: ein Interface pro Aggregate in `Domain/Ports/`,
Implementierung in `Bazaar.Infrastructure/Persistence/Repositories/`, kein
`IRepository<T>`, kein `IQueryable` über die Portgrenze. Keine Code-Artefakte, da es noch
kein Aggregate gibt — reine Konvention, damit das erste fachliche Epic sie nicht neu
erfindet.

### 7. Execution-Strategy-Hinweis (AC-8, Vorbereitung)

Kommentar/Dokumentationszeile an `BazaarDbContext` oder in
`Bazaar.Infrastructure/Persistence/README.md`: jede selbst geöffnete Transaktion **muss**
`Database.CreateExecutionStrategy().ExecuteAsync(...)` verwenden, sobald
`EnableRetryOnFailure` aktiv ist — betrifft die fünf Transaktions-Endpoints (`intake`,
`release`, `sales`, `settlement`, `import`), die erst in fachlichen Epics entstehen. Kein
Code in Round-3, nur die Regel für spätere Rounds hinterlegt.

### 8. Verifikation

- Lokale Wegwerf-Postgres starten (s. o.), `ConnectionStrings__DefaultConnection` setzen.
- `dotnet ef migrations list --project Bazaar.Infrastructure --startup-project Bazaar.Api`
  → nur `InitialCreate` (AC-6).
- `dotnet run --project Bazaar.Api` bei laufender DB → `GET /health` → `200
  {"status":"healthy"}` (AC-9).
- DB stoppen, App neu starten → Abbruch mit Exit-Code ≠ 0 nach ~60 s, Log zeigt
  Host/Port/DB-Name, kein Passwort (AC-5b).
- DB laufen lassen, aber Verbindung während `MigrateAsync()` kappen (z. B. Netzwerk kurz
  trennen) → falls das nicht reproduzierbar ist, ersatzweise Review-Nachweis über
  `try/catch` um `MigrateAsync()` mit Log + `Environment.Exit(1)` (AC-5c).
- DB laufen lassen, App starten, DB danach stoppen → `GET /health` → `503`
  `{"status":"unhealthy"}` (AC-9, zweiter Zweig).

## Reihenfolge

1 → 2 → 3 sequenziell (Paket, Context, erste Migration setzen aufeinander auf). 4 hängt
von 2 ab, 5 kann parallel zu 4 entstehen (beide ändern `Program.cs`, aber unabhängige
Abschnitte), 6 und 7 sind reine Doku-Schritte, jederzeit möglich, 8 abschließend nach
1–5.
