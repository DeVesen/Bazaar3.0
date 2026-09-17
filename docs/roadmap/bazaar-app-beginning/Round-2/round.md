# Round 2 — .NET Minimal API Backend anlegen

## Liefert

Das lauffähige Backend-Grundgerüst der Haupt-App im hexagonalen Vier-Projekt-Schnitt —
noch ohne Fachlichkeit, ohne Endpoints außer einem Health-Check.

## Umfang

- .NET-10-Solution unter `src/bazaar-app/backend/` mit vier Projekten und
  compiler-erzwungener Abhängigkeitsrichtung:
  - `Bazaar.Domain` — referenziert nichts.
  - `Bazaar.Application` — referenziert `Domain`.
  - `Bazaar.Infrastructure` — referenziert `Domain`, `Application`.
  - `Bazaar.Api` — referenziert alle drei (Minimal-API-Endpoints, Filter,
    `IExceptionHandler`).
- Grundgerüst für den globalen `IExceptionHandler`, der Domain-Exceptions auf
  `ProblemDetails` (RFC 9457) abbildet — noch ohne konkrete Domain-Exceptions.
- Grundgerüst für den generischen FluentValidation-Endpoint-Filter (`400` mit
  `errors`-Dictionary) — noch ohne konkrete Validatoren.
- Grundkonfiguration JWT-Bearer-Middleware (Schema, Token-Validierungsparameter) —
  noch ohne konkrete Login-Logik.
- CORS-Konfiguration, ausschließlich in Development aktiv.

## Nicht enthalten

- EF Core / Datenbankanbindung (eigenes Häppchen).
- Konkrete Domain-Entities, Handler, Endpoints — die entstehen mit den fachlichen Epics.
- Docker-Containerisierung.

## Referenzen

- [Epic_Projektanlage](../../requirements/bazaar-app/epics/Epic_Projektanlage/epic.md) (Story BPROJ-S02)
- [spec.md §7.0.1](../../requirements/bazaar-app/spec.md) (Architektur)

## Voraussetzung

Keine — kann parallel zu Round 1 laufen.
