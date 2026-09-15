# BAR.Modules.Export

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.Export/BAR.Modules.Export.csproj` → kompiliert in den BAR.Host-Prozess
**Purpose:** Reine Read-Komposition über drei Module (Sellers, Articles, Brands/Categories) zum Bazaar-Export — ersetzt den früheren SQL-Join gegen eine gemeinsame DbContext.
**Identity:** Einziges Modul ohne eigenes Schema und ohne eigenes `.Contracts`-Projekt — es hat nichts zu exportieren, was ein anderes Modul konsumieren müsste.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- `GetExportQueryHandler`: kombiniert `ISellerManagementModuleApi.GetAllSellersForExportAsync`, `IRegistrationModuleApi.GetArticlesForExportAsync`, optional `IMasterDataModuleApi.GetAllBrandNamesAsync`/`GetAllCategoryNamesAsync`
- Fachregel §11.7: nur Verkäufer mit mindestens einem Artikel werden exportiert; Verkäufertyp-Name wird mitgegeben, aber nicht die Konditionswerte (die Haupt-App löst Provision/Gebühr selbst über den Namen auf)
- Nicht zuständig: kein eigenes Schema, keine eigene Persistenz

## Consumed By
- `BAR.Host` — direct only (kein anderes Modul referenziert Export)

## Public Surface
Kein `.Contracts`-Projekt — `GetExportQueryHandler` wird direkt aus `BAR.Modules.Export.Application` von Host aufgerufen (registriert über `AddExportModule()`).

## Talks To
- `BAR.SharedKernel`
- `BAR.Modules.SellerManagement.Contracts`, `BAR.Modules.Registration.Contracts`, `BAR.Modules.MasterData.Contracts` — alle drei einseitig konsumierend, keine Rückrufe

## Structure
Nur `Application/{ExportResponse,GetExportQueryHandler}.cs` + `Infrastructure/DependencyInjection.cs` — kein Domain-, kein Infrastructure/Persistence-Layer.

## Notes
- Modulith-Sicht: ein Modul kann bewusst "nur lesend, ohne eigenes Schema" sein, wenn seine gesamte Existenzberechtigung eine Query-Komposition ist.
