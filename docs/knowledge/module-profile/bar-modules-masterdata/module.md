# BAR.Modules.MasterData

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.MasterData/BAR.Modules.MasterData.csproj` → kompiliert in den BAR.Host-Prozess
**Purpose:** Verwaltet die Stammdaten der Voranmelde-App — Marken, Kategorien und Verkäufer-Typen (inkl. deren Konditionen: Provisionssatz, Artikelgebühr).
**Identity:** Eines von 5 Fach-Modulen (Abteilungen) im modularen Monolithen; einziges Modul mit eigenem Schema für Katalogdaten.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- CRUD für Brands, Categories, SellerTypes
- Liefert Verkäufertyp-Konditionen und Namenslisten an andere Module (siehe `bar-modules-masterdata-contracts`)
- Nicht zuständig: kennt keine Artikel/Verkäufer selbst — In-Use-Prüfungen beim Löschen fragt es bei Registration/SellerManagement an

## Consumed By
- `BAR.Host` — direct (DI-Registrierung `AddMasterDataModule`, Endpoints)
- `BAR.Application.UnitTests` — direct, test

## Public Surface
Kein eigener öffentlicher Vertrag über die Modulgrenze — der Vertrag ist `IMasterDataModuleApi` im separaten `bar-modules-masterdata-contracts`-Projekt.

## Talks To
- `BAR.SharedKernel`
- `BAR.Modules.MasterData.Contracts` (implementiert dessen Interface)
- `BAR.Modules.Registration.Contracts`, `BAR.Modules.SellerManagement.Contracts`, `BAR.Modules.Operations.Contracts` — bidirektionale Contracts-Abhängigkeit; Aufrufe zur Laufzeit lazy über `IServiceProvider.GetRequiredService<T>()`, nicht per Konstruktor-Injection (vermeidet DI-Konstruktionszyklus, siehe Notes)

## Structure
`Application/Catalog/{Brands,Categories}/{Create,Update,Delete,GetAll}`, `Application/SellerTypes/{...}`, `Application/MasterDataModuleApi.cs` (Facade-Implementierung), `Domain/Catalog/{Brand,Category}.cs`, `Domain/SellerTypes/SellerType.cs`, `Domain/Ports/*Repository`, `Infrastructure/Persistence/*` (EF Core, eigene Migrationshistorie).

## Notes
- `MasterDataModuleApi` löst Handler über `IServiceProvider` statt Konstruktor auf, weil eine bidirektionale Contracts-Abhängigkeit auf SellerManagement/Registration/Operations sonst einen DI-Konstruktionszyklus erzeugen würde — Rationale steht als XML-Doc-Kommentar direkt im Code.
