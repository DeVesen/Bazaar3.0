# Bazaar.Application

**Kind:** library
**Artifact:** `src/bazaar-app/backend/Bazaar.Application/Bazaar.Application.csproj` → compiled into `Bazaar.Infrastructure` and `Bazaar.Api`
**Purpose:** Use-case layer — one Command+Validator+Handler group per application operation (CQRS-flavored, not full CQRS: reads are plain `Get*Handler`s, no separate read model beyond the `Ports` query interfaces already in Domain).
**Identity:** The "Application" hexagon ring — depends only on `Bazaar.Domain`, talks to persistence exclusively through `Ports` interfaces it doesn't implement.
**Maturity:** sketch (structure/grouping read directly from every filename; individual handler bodies not opened)
**Last updated:** 2026-10-15

## Responsibilities
- One folder per bounded capability area, each holding `*Command`, `*CommandValidator` (FluentValidation), `*Handler`: `Articles`, `ArticleImport`, `Auth` (Login/BootstrapAdmin/ChangePassword/CompleteSetup), `Brands`, `Categories`, `Import`, `Intake`, `Release`, `Sales`, `SellerTypes`, `Sellers`, `Settings`, `Settlement`, `Statistics`, `Users`
- `Auth/AdminBootstrapState` — the in-memory singleton tracking whether an admin exists (`Initialize`/`MarkAdminCreated`, also reset by `Bazaar.Infrastructure`'s `DatabaseResetService`)
- Not responsible for: HTTP concerns (status codes, routing — that's Api), persistence implementation (that's Infrastructure)

## Consumed By
- `Bazaar.Infrastructure` — direct (project reference; `IUnitOfWork`-style plumbing)
- `Bazaar.Api` — direct (project reference; every `*Handler` registered in `Program.cs` and called from an endpoint)
- `Bazaar.Application.UnitTests` — direct, test (project reference)
- `Bazaar.Architecture.Tests` — direct, test (project reference)

## Public Surface
Every `*Command`/`*Handler` class across the 15 folders listed above — these are what `Bazaar.Api`'s `Program.cs` registers 1:1 (every `AddScoped<XHandler>()` line corresponds to a class here).

## Talks To
- `Bazaar.Domain` — direct (only project reference in its `.csproj`), uses entities and calls through `Ports` interfaces
- `FluentValidation` (NuGet) — every `*CommandValidator`

## Structure
Flat: one directory per capability, no further nesting. Command/Validator/Handler is the fixed pattern.

## Notes
- `CompleteSetupHandler`/`CompleteSetupCommand`/`CompleteSetupCommandValidator` (`Auth/`) are the setup wizard's single atomic "create admin + seller types + brands + categories" call, added alongside the pre-existing `BootstrapAdminHandler` (which the wizard no longer calls but which stays for backward compatibility/tests).
- `Intake/`: `IntakeArticleLine.DeleteArticleNumber` (optional, `IntakeCommand.cs`) trägt den Renumber-Weg der Artikelannahme — `IntakeHandler` löscht in einem Vorab-Schritt innerhalb derselben Transaktion den alten vorregistrierten Artikel, bevor die umnummerierte Zeile gebucht wird; ein veralteter Kandidat (nicht vorhanden, fremder Verkäufer, schon freigegeben) wird still übersprungen; kollidiert die Zielnummer mit einem anderen eigenen vorregistrierten Artikel, gibt es `409` (`article.number_taken`) statt stillem Nachbuchen. Validator-Regel `DeleteArticleNumber > 0` (`IntakeCommandValidator.cs`). Commits `d0e960c`, `5101edc`, `b608ecf`.
- Sketch only — didn't verify whether every handler in fact stays free of direct Infrastructure/Api concerns; that's an assumption from the layering, not a read of every method body.
- `ArticleImport/` (2026-10-15, `ImportSellerArticlesHandler.cs` direkt gelesen): `ImportSellerArticlesHandler` importiert alle Zeilen einer Artikel-Datei als „Registriert“ für einen offenen Verkäufer, alles oder nichts. Datei lesen und Zeilen prüfen (`ArticleTableParser`, `ParsedArticleTable`) laufen außerhalb der Transaktion, die Prüfung vergebener Nummern und das Schreiben gemeinsam in einer Transaktion (Muster `IntakeHandler`). `MaxDataRows = 20_000`; Fehlertexte aus `ArticleImportErrorMessage`.
- `Settings/`: `GetPrintTextsHandler`/`UpdatePrintTextsHandler` (+ `UpdatePrintTextsCommandValidator`) halten die Freitexte der Belege; `Sellers/DeleteSellerHandler` löscht seit 2026-10-14 den Verkäufer samt Artikeln (Admin), sonst 409 `seller.has_articles`. Beide Punkte aus Dateinamen und Commit-Subjects abgeleitet, Handler-Körper nicht gelesen.
