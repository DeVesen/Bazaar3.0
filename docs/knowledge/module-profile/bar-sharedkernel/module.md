# BAR.SharedKernel

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.SharedKernel/BAR.SharedKernel.csproj` → compiled into every module and into BAR.Host
**Purpose:** Gemeinsame Basistypen und Cross-Cutting-Infrastruktur, die alle Abteilungen der Voranmelde-App teilen, ohne dass eine Abteilung von einer anderen abhängen muss.
**Identity:** Das Fundament unter allen `BAR.Modules.*`-Projekten — kein eigenes fachliches Modul, sondern das, was ein modularer Monolith braucht, damit die Module trotzdem etwas Gemeinsames haben (dotnet-modulith-bridge).
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- Basistypen: `EntityId`, `IClock`, `IUnitOfWork`, `DomainException`
- Outbox-basierte Domain-/Integration-Event-Infrastruktur: `IDomainEvent`, `IHasDomainEvents`, `IDomainEventDispatcher`/`DomainEventDispatcher`, `IIntegrationEventHandler<T>`, `OutboxMessage`
- Nicht zuständig: keine fachliche Logik, keine Persistenz-Implementierung (die liegt je Modul in dessen Infrastructure-Layer)

## Consumed By
- `BAR.Host` — direct (project reference)
- `BAR.Modules.Export` — direct
- `BAR.Modules.MasterData`, `BAR.Modules.MasterData.Contracts` — direct
- `BAR.Modules.Operations`, `BAR.Modules.Operations.Contracts` — direct
- `BAR.Modules.Registration`, `BAR.Modules.Registration.Contracts` — direct
- `BAR.Modules.SellerManagement`, `BAR.Modules.SellerManagement.Contracts` — direct
- `BAR.Application.UnitTests`, `BAR.Domain.UnitTests` — direct, test

## Public Surface
Exportierte Typen unter `EntityId.cs`, `Events/*`, `Exceptions/DomainException.cs`, `IClock.cs`, `IUnitOfWork.cs` — kein separates Contracts-Projekt, da diese Typen selbst schon der öffentliche Vertrag sind.

## Talks To
- Keine ausgehenden Abhängigkeiten außer dem .NET BCL — echter Leaf-Node der Solution.

## Structure
Flache Struktur ohne Application/Domain/Infrastructure-Trennung (dafür zu klein): `Events/`, `Exceptions/`, plus lose Dateien im Root.

## Notes
- Integration-Event-Pattern (Outbox + `IIntegrationEventHandler<T>`) wird konkret von Registration genutzt, um auf `BrandRenamed`/`CategoryRenamed` aus MasterData zu reagieren — siehe `bar-modules-registration`.
