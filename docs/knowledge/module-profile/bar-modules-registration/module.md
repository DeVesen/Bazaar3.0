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
- **DB-Exclusion-Constraint `CK_number_block_no_overlap`** (GIST auf `int4range(from_number, to_number + 1)`, benötigt `btree_gist`-Extension) ist seit 2026-09-15 tatsächlich in der DB vorhanden (Migration `AddNumberBlockOverlapExclusion`). War in [`api/blocks.md`](../../../requirements/advance-registration/api/blocks.md) §6 seit längerem als Race-Condition-Backstop dokumentiert, fehlte aber in der ersten Migration — `NumberBlockRepository.IsExclusionViolation`/`NumberBlockOverlapException` waren bereits darauf vorbereitet, liefen ins Leere.
- **`RegistrationModuleApi.DeleteAllForSellerAsync` sequenziell, nicht `Task.WhenAll`:** `ArticleRepository` und `NumberBlockRepository` teilen sich denselben `RegistrationDbContext` (eine Connection, nicht thread-safe) — parallele `ExecuteDeleteAsync`-Aufrufe warfen sporadisch `NpgsqlOperationInProgressException` beim Verkäufer-/Profil-Löschen.
- **`ArticleRepository.DetachTracked`-Pattern:** Nach einem `ExecuteUpdateAsync`-Bulk-Update (schreibt direkt in die DB, am ChangeTracker vorbei) muss die Detach-Filterung nach dem **alten** Wert suchen, nicht dem neuen — die im Tracker gecachte Instanz hält zu dem Zeitpunkt noch den Vorher-Zustand. Filter auf den neuen Wert matcht nie, stale Entity bleibt im Identity-Map-Cache hängen (betraf `RenameBrandAsync`/`RenameCategoryAsync`).
