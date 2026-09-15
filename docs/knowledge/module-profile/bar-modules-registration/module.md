# BAR.Modules.Registration

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.Registration/BAR.Modules.Registration.csproj` → kompiliert in den BAR.Host-Prozess
**Purpose:** Kernstück der Voranmelde-App — verwaltet Artikel der Verkäufer und die Nummernkreis-Allokation (Number Blocks), inklusive der Vergabe fortlaufender Artikelnummern.
**Identity:** Größtes der 5 Fach-Module; einziges Modul mit eigenen Integration-Event-Handlern (reagiert auf MasterData-Events).
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- Artikel-CRUD, Nummernblock-Reservierung/-Zuteilung, Nummernkreis-Allokator
- `EventHandlers/`: reagiert auf `BrandRenamed`/`CategoryRenamed` aus MasterData
- Nicht zuständig: kennt Verkäufer-Stammdaten nicht selbst (fragt SellerManagement), kennt Nummernkreis-Konfiguration nicht selbst (fragt Operations)

## Consumed By
- `BAR.Host` — direct (DI-Registrierung `AddRegistrationModule`, Endpoints)
- `BAR.Application.UnitTests`, `BAR.Domain.UnitTests` — direct, test

## Public Surface
Kein eigener Vertrag über die Modulgrenze — Vertrag ist `IRegistrationModuleApi` in `bar-modules-registration-contracts`.

## Talks To
- `BAR.SharedKernel`
- `BAR.Modules.Registration.Contracts` (implementiert dessen Interface)
- `BAR.Modules.Operations.Contracts`, `BAR.Modules.MasterData.Contracts`, `BAR.Modules.SellerManagement.Contracts` — bidirektional, lazy per `IServiceProvider`
- Konsumiert Integration Events aus `BAR.Modules.MasterData.Contracts.Events` (`BrandRenamed`, `CategoryRenamed`)

## Structure
`Application/Articles/{Create,Update,Delete,GetAll,GetById,GetMine,GetNextNumber}/`, `Application/Blocks/{Delete,GetForSeller,GetMine,NextFree,Reserve}/`, `Application/Blocks/AllocateInitialBlocksService.cs`, `Application/EventHandlers/`, `Domain/Articles/{Article,ArticleNumberAllocator}.cs`, `Domain/NumberBlocks/{NumberBlock,NumberBlockAllocator}.cs`, `Domain/Exceptions/NumberBlockExceptions.cs`, `Infrastructure/Persistence/*` inkl. eigener `ArticleQueries` als Read-Port.

## Notes
- Lazy-Resolution-Muster wie die anderen 3 Fach-Module — vermeidet DI-Konstruktionszyklus.
- `AllocateInitialBlocksAsync` wird explizit für SellerManagement (Register/CreateSeller) mit Retry-bei-Überlappung dokumentiert — steht als Code-Kommentar in `IRegistrationModuleApi`.
