---
round: Round-2
status: geplant
---

# Plan: Round 2 — .NET Minimal API Backend anlegen

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

Keine — Round-2 kann parallel zu Round-1 laufen (round.md, Abschnitt „Voraussetzung").
`src/bazaar-app/backend/` existiert im Repo noch nicht.

## Implementationsplan

### 1. Solution und vier Projekte anlegen

```
mkdir src/bazaar-app/backend && cd src/bazaar-app/backend
dotnet new sln -n Bazaar
dotnet new classlib -n Bazaar.Domain -o Bazaar.Domain
dotnet new classlib -n Bazaar.Application -o Bazaar.Application
dotnet new classlib -n Bazaar.Infrastructure -o Bazaar.Infrastructure
dotnet new webapi -n Bazaar.Api -o Bazaar.Api --use-controllers false
dotnet sln add Bazaar.Domain Bazaar.Application Bazaar.Infrastructure Bazaar.Api
```

`--use-controllers false`: Minimal-API-Endpoints, keine `[ApiController]`-Klassen (AC-1,
BPROJ-S02 Projektstruktur).

### 2. Projektreferenzen (AC-2)

```
dotnet add Bazaar.Application reference Bazaar.Domain
dotnet add Bazaar.Infrastructure reference Bazaar.Domain Bazaar.Application
dotnet add Bazaar.Api reference Bazaar.Domain Bazaar.Application Bazaar.Infrastructure
```

`Bazaar.Domain.csproj` bleibt ohne jedes NuGet-Paket (Prüfung in Schritt 9).

### 3. `Directory.Build.props` (zentral, analog Referenz-App)

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <GenerateDocumentationFile>false</GenerateDocumentationFile>
  </PropertyGroup>
  <PropertyGroup Condition="$(MSBuildProjectName.Contains('Tests'))">
    <IsPackable>false</IsPackable>
    <OutputType>Exe</OutputType>
    <TestingPlatformDotnetTestSupport>true</TestingPlatformDotnetTestSupport>
  </PropertyGroup>
</Project>
```

Einzelne `.csproj`-Dateien setzen `TargetFramework` danach nicht mehr selbst.

### 4. Verzeichnisstruktur je Projekt (AC-3)

```
Bazaar.Domain/Ports/                      ← Repository-/Query-Interfaces (leer, .gitkeep)
Bazaar.Application/                        ← Feature-Ordner entstehen mit den fachlichen Epics
Bazaar.Infrastructure/Persistence/         ← DbContext folgt in BPROJ-S04 (.gitkeep)
Bazaar.Api/Features/Public/                ← HealthEndpoints
Bazaar.Api/Filters/                        ← ValidationFilter<TRequest>
Bazaar.Api/ExceptionHandling/              ← DomainExceptionHandler
```

### 5. Domain-Exception-Hierarchie (Grundlage für AC-4)

`Bazaar.Domain/Exceptions/`:

```csharp
public abstract class DomainException(string message, string errorCode) : Exception(message)
{
    public string ErrorCode { get; } = errorCode;
}
public sealed class NotFoundException(string message, string errorCode = "not_found") : DomainException(message, errorCode);
public sealed class ConflictException(string message, string errorCode = "conflict") : DomainException(message, errorCode);
public sealed class UnauthorizedException(string message, string errorCode = "unauthorized") : DomainException(message, errorCode);
public sealed class ForbiddenException(string message, string errorCode = "forbidden") : DomainException(message, errorCode);
```

Keine Paketreferenz nötig — reines BCL, damit `Bazaar.Domain` frei von EF Core/ASP.NET
bleibt (AC-2).

### 6. `DomainExceptionHandler` (AC-4)

`Bazaar.Api/ExceptionHandling/DomainExceptionHandler.cs`, analog
[Referenz](../../../../src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs),
aber ohne app-spezifischen Sonderfall (kein `ArticleNumberConflictException`-Zweig):

```csharp
public sealed class DomainExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is not DomainException domainException) return false;

        var status = domainException switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ForbiddenException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var problem = new ProblemDetails { Status = status, Title = domainException.Message };
        problem.Extensions["errorCode"] = domainException.ErrorCode;

        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(problem, contentType: "application/problem+json", cancellationToken: ct);
        return true;
    }
}
```

Registrierung: `builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddProblemDetails();` und `app.UseExceptionHandler();`.

### 7. `ValidationFilter<TRequest>` (AC-5)

```
dotnet add Bazaar.Api package FluentValidation
```

`Bazaar.Api/Filters/ValidationFilter.cs`: generischer `IEndpointFilter<TRequest>`, der
`IValidator<TRequest>` aus DI zieht, bei Fehlern `Results.ValidationProblem(errors)`
liefert (Dictionary-Key = englischer DTO-Feldname). Noch kein konkreter `IValidator<T>`
registriert — reines Grundgerüst, wie in round.md gefordert.

### 8. JWT-Bearer + Autorisierung (AC-8)

```
dotnet add Bazaar.Api package Microsoft.AspNetCore.Authentication.JwtBearer
```

`JwtOptions`-Record (Issuer, Audience, SigningKey) aus `appsettings.json`/Env, Bindung
analog [Referenz](../../../../src/advance-registration/backend/BAR.Host/Program.cs)
Zeilen 62–79 — `MapInboundClaims = false`, `TokenValidationParameters` aus `JwtOptions`.
Kein `AddPolicy("admin", ...)` in Round-2 — Rollen/Policies entstehen mit Epic_Login,
sobald es konkrete Claims gibt; hier nur `AddAuthentication().AddJwtBearer()`.

### 9. CORS (AC-6)

Nur unter `if (builder.Environment.IsDevelopment())`:

```csharp
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(o => o.AddPolicy("bazaar-dev", p =>
        p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
}
...
if (app.Environment.IsDevelopment())
{
    app.UseCors("bazaar-dev");
}
```

Kein Policy-Objekt wird in `Production` überhaupt erzeugt (AC-6 verlangt explizit: keine
Policy registriert, nicht nur ungenutzt).

### 10. `/health`-Endpoint (AC-7, AC-9)

`Bazaar.Api/Features/Public/HealthEndpoints.cs`, analog
[Referenz](../../../../src/advance-registration/backend/BAR.Host/Features/Public/HealthEndpoints.cs),
ohne DB-Prüfung (Kommentar im Code: DB-Erweiterung folgt in BPROJ-S04):

```csharp
public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new HealthResponse("healthy")))
            .WithName("GetHealth")
            .AllowAnonymous();
        return app;
    }
}
public sealed record HealthResponse(string Status);
```

### 11. Konfiguration (AC-10)

`appsettings.json` mit Platzhaltern für `Jwt:Issuer`/`Jwt:Audience`/`Jwt:SigningKey`
(leer/Dev-Defaults in `appsettings.Development.json`, produktiv ausschließlich über
Environment-Variablen `Jwt__Issuer` etc. — kein Secret im Repo). Port über
`ASPNETCORE_URLS`/`launchSettings.json`, kein Hardcode in `Program.cs`.

### 12. Verifikation

- `dotnet build` — muss durchlaufen, `Bazaar.Domain.csproj` ohne EF Core/ASP.NET-Paket
  (Sichtprüfung der `.csproj`, AC-2).
- `dotnet run --project Bazaar.Api` → `curl http://localhost:5000/health` → `200
  {"status":"healthy"}` (AC-9).
- Manueller Check: geschützter Dummy-Endpoint (temporär, danach entfernen) liefert `401`
  ohne Bearer-Token — Nachweis, dass `AddAuthentication`/`AddAuthorization` tatsächlich
  greifen.
- Development-Start: CORS-Header bei `OPTIONS`-Preflight von `localhost:4200` vorhanden;
  Production-Start (`ASPNETCORE_ENVIRONMENT=Production`): keine `Access-Control-*`-Header.

## Reihenfolge

1–4 sequenziell (Projektgerüst), 5–7 und 8–9 können parallel erarbeitet werden (beide
hängen nur von 1–4 ab), 10 hängt von 6 ab (nutzt `IExceptionHandler`-Registrierung
indirekt nicht, aber von der Api-Projektstruktur aus 4), 11 begleitend zu 8, 12
abschließend.
