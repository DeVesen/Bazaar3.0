# BAR.Modules.MasterData.Contracts

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.MasterData.Contracts/BAR.Modules.MasterData.Contracts.csproj`
**Purpose:** Der einzige erlaubte Zugriffspunkt auf das MasterData-Modul — definiert `IMasterDataModuleApi`, DTOs und Integration Events. Host und andere Module dürfen nur gegen dieses Projekt kompilieren, nie gegen `BAR.Modules.MasterData` selbst.
**Identity:** Contracts-Projekt im dotnet-modulith-bridge-Muster — der stabile Vertrag vor der Implementierung.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- `IMasterDataModuleApi`: Brands/Categories/SellerTypes CRUD + Cross-Modul-Abfragen
- DTOs: `BrandDto`, `CategoryDto`, `SellerTypeDto`, `SellerTypeConditionsDto`
- Integration Events: `BrandRenamed`, `CategoryRenamed`

## Consumed By
- `BAR.Host` — direct (DI-Registrierung + Endpoints)
- `BAR.Modules.Export` — direct (`GetAllBrandNamesAsync`/`GetAllCategoryNamesAsync` für Export-Filter)
- `BAR.Modules.Operations` — direct (`SellerTypeExistsAsync` für Settings-Validierung)
- `BAR.Modules.Registration` — direct (konsumiert `BrandRenamed`/`CategoryRenamed` Events, In-Use-Check-Gegenstück)
- `BAR.Modules.SellerManagement` — direct (`GetSellerTypeConditionsAsync` für Verkäufer-Konditionen)
- `BAR.Modules.MasterData` — direct (implementiert das Interface)

## Public Surface
`IMasterDataModuleApi`:
- Brands/Categories/SellerTypes: `GetAll*Async`, `Create*Async`, `Update*Async`, `Delete*Async`
- `GetSellerTypeConditionsAsync(sellerTypeId)` — für SellerManagement/Operations/Export
- `SellerTypeExistsAsync(sellerTypeId)` — für Operations (Settings-Validierung `DefaultTypeId`)
- `GetAllBrandNamesAsync` / `GetAllCategoryNamesAsync` — für Export

## Talks To
- `BAR.SharedKernel`

## Structure
`IMasterDataModuleApi.cs` im Root, `MasterData/*Dto.cs`, `SellerTypes/SellerTypeDto.cs`, `Events/{BrandRenamed,CategoryRenamed}.cs`.

## Notes
- Jede Cross-Modul-Methode trägt einen XML-Doc-Kommentar, der den aufrufenden Konsumenten benennt ("For Export:", "For Operations:") — direkt im Code als Konsumenten-Dokumentation, sehr verlässliche Quelle für diesen Abschnitt.
