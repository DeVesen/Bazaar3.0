# R02 — Nummernblock + Profil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nummernblöcke lesend fertig durchstechen (DB-Race-Schutz inklusive) und den Profil-Steckbrief (Tab 1) komplett neu bauen — Backend und Frontend.

**Architecture:** Bestehendes hexagonales Backend (BAR.Domain/BAR.Application/BAR.Infrastructure/BAR.Host) und Feature-First-Frontend (BAR.App) unverändert fortführen — keine neuen Schichten, nur neue Slices nach etabliertem Muster (siehe `RegisterCommandHandler`/`BlocksEndpoints`/`AuthApiService`).

**Tech Stack:** .NET 10 Minimal APIs, EF Core + Npgsql, FluentValidation, xUnit v3 + Moq; Angular 22 (standalone, signals, template-driven Forms mit `FormsModule`), PrimeNG 22, Vitest, `@zxing/library` (neu).

**Spec:** [docs/superpowers/specs/2026-09-09-r02-nummer-und-profil-design.md](../specs/2026-09-09-r02-nummer-und-profil-design.md)

## Global Constraints

- Sprache: Code/Kommentare/Commit-Messages englisch benannt, aber dieses Projekt kommentiert fachliche Begründungen auf Deutsch (siehe bestehender Code) — bei neuen Kommentaren diesem Stil folgen.
- `UsedCount` ist in R02 immer `0` (kein Artikel-Entity vorhanden) — mit kurzem Kommentar an der Stelle, kein stiller Platzhalter.
- `PUT /api/profile` ignoriert mitgesendete `email`/`sellerTypeId` stillschweigend, lehnt sie nicht mit `400` ab.
- Tab „Zugangsdaten" und „Löschen" der Profil-Seite sind in R02 nur angelegt und deaktiviert (Hinweistext „Verfügbar ab R07") — kein Formular, kein API-Aufruf dahinter.
- Keine Admin-Routen (`/api/blocks/next-free`, `/api/sellers/{id}/blocks`), keine automatische Blockerweiterung, keine `/api/profile/email`, `/api/profile/password`, `DELETE /api/profile` — alles spätere Roadmap-Schritte.
- Backend-Migrationsbefehl: `dotnet ef migrations add <Name> -p BAR.Infrastructure -s BAR.Host`, ausgeführt aus `src/advance-registration/backend`.
- xUnit-Tests nutzen `TestContext.Current.CancellationToken`, nicht `CancellationToken.None`.

---

## Backend

### Task 1: `BlockResult` um `NumberCount`/`UsedCount` erweitern

**Files:**
- Modify: `src/advance-registration/backend/BAR.Application/Blocks/GetMine/BlockResult.cs`
- Modify: `src/advance-registration/backend/BAR.Application/Blocks/GetMine/GetMyBlocksQueryHandler.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Blocks/GetMine/GetMyBlocksQueryHandlerTests.cs`

**Interfaces:**
- Produces: `BlockResult(string Id, string SellerId, int FromNumber, int ToNumber, int NumberCount, int UsedCount, DateTime AssignedAt)` — wird von `GetMyBlocksQueryHandler.HandleAsync` zurückgegeben, von `BlocksEndpoints.MapBlocksEndpoints` (unverändert) als JSON serialisiert.

- [ ] **Step 1: Test für die neuen Felder schreiben (ergänzt bestehende Testdatei)**

Ersetze den Inhalt von `tests/BAR.Application.UnitTests/Blocks/GetMine/GetMyBlocksQueryHandlerTests.cs`:

```csharp
using BAR.Application.Blocks.GetMine;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Blocks.GetMine;

public class GetMyBlocksQueryHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();

    [Fact]
    public async Task HandleAsync_SellerHasBlocks_ReturnsThemOrderedWithComputedCounts()
    {
        var block1 = NumberBlock.Assign("s1", 111, 10, DateTime.UtcNow);
        var block2 = NumberBlock.Assign("s1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([block1, block2]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Equal(2, result.Count);
        Assert.Equal(101, result[0].FromNumber);
        Assert.Equal(111, result[1].FromNumber);
        Assert.Equal(10, result[0].NumberCount);
        Assert.Equal(0, result[0].UsedCount);
    }

    [Fact]
    public async Task HandleAsync_NoBlocks_ReturnsEmptyList()
    {
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Empty(result);
    }
}
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen (Compile-Fehler: `NumberCount`/`UsedCount` existieren nicht)**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0` (aus `src/advance-registration/backend`)
Expected: Build-Fehler `'BlockResult' does not contain a constructor that takes 7 arguments` o.ä.

- [ ] **Step 3: `BlockResult` und Handler anpassen**

`BAR.Application/Blocks/GetMine/BlockResult.cs`:
```csharp
namespace BAR.Application.Blocks.GetMine;

public sealed record BlockResult(
    string Id, string SellerId, int FromNumber, int ToNumber,
    int NumberCount, int UsedCount, DateTime AssignedAt);
```

`BAR.Application/Blocks/GetMine/GetMyBlocksQueryHandler.cs`:
```csharp
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.GetMine;

public sealed class GetMyBlocksQueryHandler(INumberBlockRepository blocks)
{
    public async Task<IReadOnlyList<BlockResult>> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var result = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        return result
            .OrderBy(b => b.FromNumber)
            .Select(b => new BlockResult(
                b.Id, b.SellerId, b.FromNumber, b.ToNumber,
                NumberCount: b.ToNumber - b.FromNumber + 1,
                // UsedCount ist in R02 immer 0 - es gibt noch kein Artikel-Entity,
                // gegen das gezaehlt werden koennte (Epic_Meine_Artikel folgt spaeter).
                UsedCount: 0,
                b.AssignedAt))
            .ToList();
    }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Blocks/GetMine/BlockResult.cs src/advance-registration/backend/BAR.Application/Blocks/GetMine/GetMyBlocksQueryHandler.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Blocks/GetMine/GetMyBlocksQueryHandlerTests.cs
git commit -m "feat(bar-app): BlockResult liefert numberCount/usedCount"
```

---

### Task 2: PostgreSQL-Exclusion-Constraint auf `number_block`

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/<timestamp>_AddNumberBlockExclusionConstraint.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/<timestamp>_AddNumberBlockExclusionConstraint.Designer.cs` (von der Tooling generiert)
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/BarDbContextModelSnapshot.cs` (von der Tooling aktualisiert)
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/NumberBlockRepositoryTests.cs` (neu)

**Interfaces:**
- Konsumiert: `PostgresWebApplicationFactory` (bestehende Test-Fixture, siehe `SellerRepositoryTests.cs`), `INumberBlockRepository.AddAsync`.

- [ ] **Step 1: Leere Migration generieren**

Aus `src/advance-registration/backend` ausführen (kein Modelländerung in EF, daher leeres Up/Down als Startpunkt):

```bash
dotnet ef migrations add AddNumberBlockExclusionConstraint -p BAR.Infrastructure -s BAR.Host
```

- [ ] **Step 2: Migration mit raw SQL befüllen**

In der generierten `<timestamp>_AddNumberBlockExclusionConstraint.cs`:

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Infrastructure.Persistence.Migrations;

public partial class AddNumberBlockExclusionConstraint : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS btree_gist;");
        migrationBuilder.Sql("""
            ALTER TABLE number_block
                ADD CONSTRAINT ck_number_block_no_overlap
                EXCLUDE USING gist (int4range(from_number, to_number + 1) WITH &&);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE number_block DROP CONSTRAINT ck_number_block_no_overlap;");
    }
}
```

- [ ] **Step 3: Failing-Test schreiben (Constraint existiert noch nicht in einer frischen DB vor `dotnet ef database update`, aber `PostgresWebApplicationFactory` wendet Migrationen beim Start an — der Test schlägt also erst fehl, wenn die Migration fehlt oder falsch ist)**

Erstelle `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/NumberBlockRepositoryTests.cs`:

```csharp
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class NumberBlockRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public NumberBlockRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_OverlappingRangeForDifferentSeller_ThrowsOnExclusionConstraint()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
        var ct = TestContext.Current.CancellationToken;

        var first = NumberBlock.Assign(Guid.NewGuid().ToString("N")[..8], 5001, 10, DateTime.UtcNow);
        await repo.AddAsync(first, ct);

        var overlapping = NumberBlock.Assign(Guid.NewGuid().ToString("N")[..8], 5005, 10, DateTime.UtcNow);

        await Assert.ThrowsAsync<DbUpdateException>(() => repo.AddAsync(overlapping, ct));
    }
}
```

- [ ] **Step 4: Migration anwenden und Test laufen lassen**

```bash
dotnet ef database update -p BAR.Infrastructure -s BAR.Host
dotnet test tests/BAR.Host.IntegrationTests -f net10.0
```
Expected: PASS (`DbUpdateException` wird von der `EXCLUDE`-Constraint-Verletzung ausgelöst — Postgres meldet `23P01 exclusion_violation`, EF Core wrappt das in `DbUpdateException`).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/NumberBlockRepositoryTests.cs
git commit -m "feat(bar-app): Exclusion-Constraint gegen parallele Nummernblock-Vergabe"
```

---

### Task 3: `Seller.UpdateProfile` + `ISellerRepository.UpdateAsync`

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs`
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs` (ergänzen)

**Interfaces:**
- Produces: `Seller.UpdateProfile(string firstName, string lastName, string? address, string postalCode, string city, string phone): void` (wirft `ArgumentException` bei fehlenden Pflichtfeldern, wie `Register`).
- Produces: `ISellerRepository.UpdateAsync(Seller seller, CancellationToken ct): Task`.

- [ ] **Step 1: Failing-Test für `UpdateProfile` schreiben**

Ergänze `tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs` um:

```csharp
    [Fact]
    public void UpdateProfile_ValidData_UpdatesAllFields()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        seller.UpdateProfile("Anna-Maria", "Muster", "Hauptstr. 1", "76135", "Ettlingen", "0721 99999");

        Assert.Equal("Anna-Maria", seller.FirstName);
        Assert.Equal("Muster", seller.LastName);
        Assert.Equal("Hauptstr. 1", seller.Address);
        Assert.Equal("76135", seller.PostalCode);
        Assert.Equal("Ettlingen", seller.City);
        Assert.Equal("0721 99999", seller.Phone);
        Assert.Equal("anna@example.com", seller.Email);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void UpdateProfile_MissingRequiredField_Throws(string firstName, string lastName)
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateProfile(firstName, lastName, null, "76133", "Karlsruhe", "0721 12345"));
    }
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `dotnet test tests/BAR.Domain.UnitTests -f net10.0`
Expected: Build-Fehler `'Seller' does not contain a definition for 'UpdateProfile'`

- [ ] **Step 3: `Seller.UpdateProfile` implementieren**

`Seller.cs` — Properties von `private init` auf `private set` ändern (nur die fünf betroffenen + Email bleibt `private init`, da nicht über dieses Formular änderbar) und Methode ergänzen:

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.Sellers;

public sealed class Seller
{
    private Seller() { }

    public string Id { get; private init; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string? Address { get; private set; }
    public string PostalCode { get; private set; } = null!;
    public string City { get; private set; } = null!;
    public string Phone { get; private set; } = null!;
    public string Email { get; private init; } = null!;
    public string SellerTypeId { get; private init; } = null!;
    public bool IsAdmin { get; private init; }
    public string? PasswordHash { get; private set; }
    public string? InviteToken { get; private set; }
    public DateTime? InviteTokenExpiresAt { get; private set; }

    public static Seller Register(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId,
        string passwordHash, bool isAdmin = false)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email ist Pflicht.", nameof(email));
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("sellerTypeId ist Pflicht.", nameof(sellerTypeId));

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin, PasswordHash = passwordHash
        };
    }

    public void UpdateProfile(string firstName, string lastName, string? address, string postalCode, string city, string phone)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));

        FirstName = firstName;
        LastName = lastName;
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
    }
}
```

`ISellerRepository.cs`:
```csharp
namespace BAR.Domain.Ports;

public interface ISellerRepository
{
    Task<BAR.Domain.Sellers.Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<BAR.Domain.Sellers.Seller?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
    Task UpdateAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
}
```

`SellerRepository.cs` — `seller` ist über `GetByIdAsync` bereits vom selben (scoped) `BarDbContext` getrackt; das Speichern reicht mit `SaveChangesAsync`:
```csharp
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerRepository(BarDbContext dbContext) : ISellerRepository
{
    public Task<Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Email == email, cancellationToken);

    public Task<Seller?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task AddAsync(Seller seller, CancellationToken cancellationToken)
    {
        dbContext.Sellers.Add(seller);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task UpdateAsync(Seller seller, CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `dotnet test tests/BAR.Domain.UnitTests -f net10.0`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs
git commit -m "feat(bar-app): Seller.UpdateProfile Domain-Mutator"
```

---

### Task 4: `GetProfileQueryHandler` + `ProfileResult`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Profile/ProfileResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/GetProfile/GetProfileQueryHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/GetProfile/GetProfileQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `ISellerRepository.GetByIdAsync`, `ISellerTypeRepository.GetByIdAsync` (beide bereits vorhanden).
- Produces: `SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee)`, `ProfileResult(string Id, string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone, string Email, SellerTypeResult SellerType)` mit statischer Factory `ProfileResult.From(Seller, SellerType)`. Wird von Task 5 und Task 6 wiederverwendet.

- [ ] **Step 1: Failing-Test schreiben**

`tests/BAR.Application.UnitTests/Profile/GetProfile/GetProfileQueryHandlerTests.cs`:
```csharp
using BAR.Application.Profile.GetProfile;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Profile.GetProfile;

public class GetProfileQueryHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private GetProfileQueryHandler CreateHandler() => new(_sellers.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_ExistingSeller_ReturnsProfileWithResolvedSellerType()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        var sellerType = SellerType.Create("Standard", 15.0m, 0.5m);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(sellerType);

        var result = await CreateHandler().HandleAsync(seller.Id, TestContext.Current.CancellationToken);

        Assert.Equal("Anna", result.FirstName);
        Assert.Equal("anna@example.com", result.Email);
        Assert.Equal("Standard", result.SellerType.Name);
        Assert.Equal(15.0m, result.SellerType.CommissionRate);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => CreateHandler().HandleAsync("unknown", TestContext.Current.CancellationToken));
        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0`
Expected: Build-Fehler (`GetProfileQueryHandler` existiert nicht)

- [ ] **Step 3: `ProfileResult` und Handler implementieren**

`BAR.Application/Profile/ProfileResult.cs`:
```csharp
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;

namespace BAR.Application.Profile;

public sealed record SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record ProfileResult(
    string Id, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, SellerTypeResult SellerType)
{
    public static ProfileResult From(Seller seller, SellerType sellerType) => new(
        seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
        seller.City, seller.Phone, seller.Email,
        new SellerTypeResult(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee));
}
```

`BAR.Application/Profile/GetProfile/GetProfileQueryHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.GetProfile;

public sealed class GetProfileQueryHandler(ISellerRepository sellers, ISellerTypeRepository sellerTypes)
{
    public async Task<ProfileResult> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");
        var sellerType = await sellerTypes.GetByIdAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        return ProfileResult.From(seller, sellerType);
    }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Profile src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/GetProfile
git commit -m "feat(bar-app): GetProfileQueryHandler mit aufgeloestem SellerType"
```

---

### Task 5: `UpdateProfileCommandHandler` + Validator

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Profile/UpdateProfile/UpdateProfileCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/UpdateProfile/UpdateProfileCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/UpdateProfile/UpdateProfileCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/UpdateProfile/UpdateProfileCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ProfileResult`/`ProfileResult.From` (Task 4), `Seller.UpdateProfile` (Task 3), `ISellerRepository.UpdateAsync` (Task 3).
- Produces: `UpdateProfileCommand(string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone)`, `UpdateProfileCommandHandler.HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken ct): Task<ProfileResult>` — von Task 6 (Host-Endpoint) konsumiert.

- [ ] **Step 1: Failing-Test schreiben**

`tests/BAR.Application.UnitTests/Profile/UpdateProfile/UpdateProfileCommandHandlerTests.cs`:
```csharp
using BAR.Application.Profile.UpdateProfile;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Profile.UpdateProfile;

public class UpdateProfileCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private UpdateProfileCommandHandler CreateHandler() => new(_sellers.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_ValidCommand_UpdatesSellerAndReturnsProfile()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        var sellerType = SellerType.Create("Standard", 15.0m, 0.5m);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(sellerType);
        var command = new UpdateProfileCommand("Anna-Maria", "Muster", "Neue Str. 2", "76135", "Ettlingen", "0721 99999");

        var result = await CreateHandler().HandleAsync(seller.Id, command, TestContext.Current.CancellationToken);

        Assert.Equal("Anna-Maria", result.FirstName);
        Assert.Equal("Ettlingen", result.City);
        Assert.Equal("anna@example.com", result.Email);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var command = new UpdateProfileCommand("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345");

        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync("unknown", command, TestContext.Current.CancellationToken));
        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0`
Expected: Build-Fehler (`UpdateProfileCommand`/`UpdateProfileCommandHandler` existieren nicht)

- [ ] **Step 3: Command, Validator, Handler implementieren**

`BAR.Application/Profile/UpdateProfile/UpdateProfileCommand.cs`:
```csharp
namespace BAR.Application.Profile.UpdateProfile;

public sealed record UpdateProfileCommand(
    string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone);
```

`BAR.Application/Profile/UpdateProfile/UpdateProfileCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(c => c.FirstName).NotEmpty();
        RuleFor(c => c.LastName).NotEmpty();
        RuleFor(c => c.PostalCode).NotEmpty();
        RuleFor(c => c.City).NotEmpty();
        RuleFor(c => c.Phone).NotEmpty();
    }
}
```

`BAR.Application/Profile/UpdateProfile/UpdateProfileCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(ISellerRepository sellers, ISellerTypeRepository sellerTypes)
{
    public async Task<ProfileResult> HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        seller.UpdateProfile(command.FirstName, command.LastName, command.Address, command.PostalCode, command.City, command.Phone);
        await sellers.UpdateAsync(seller, cancellationToken);

        var sellerType = await sellerTypes.GetByIdAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        return ProfileResult.From(seller, sellerType);
    }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `dotnet test tests/BAR.Application.UnitTests -f net10.0`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Profile/UpdateProfile src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/UpdateProfile
git commit -m "feat(bar-app): UpdateProfileCommandHandler mit Pflichtfeld-Validierung"
```

---

### Task 6: Host-Endpoints + DI-Registrierung

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetProfileQueryHandler`, `UpdateProfileCommandHandler`, `UpdateProfileCommand`, `ValidationFilter<TRequest>` (bestehend).

- [ ] **Step 1: Failing-Test schreiben**

`tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Profile;

public class ProfileEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public ProfileEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetProfile_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/profile", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetProfile_AfterRegistration_ReturnsOwnProfileWithResolvedSellerType()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/profile", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<ProfilePayload>(TestContext.Current.CancellationToken);
        Assert.Equal("Anna", profile!.FirstName);
        Assert.NotNull(profile.SellerType);
    }

    [Fact]
    public async Task PutProfile_ValidBody_UpdatesAndIgnoresEmail()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile", new
        {
            firstName = "Anna-Maria", lastName = "Muster", address = "Neue Str. 2",
            postalCode = "76135", city = "Ettlingen", phone = "0721 99999",
            email = "sollte-ignoriert-werden@example.com"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<ProfilePayload>(TestContext.Current.CancellationToken);
        Assert.Equal("Ettlingen", profile!.City);
        Assert.NotEqual("sollte-ignoriert-werden@example.com", profile.Email);
    }

    [Fact]
    public async Task PutProfile_MissingRequiredField_Returns400()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile", new
        {
            firstName = "", lastName = "Muster", address = (string?)null,
            postalCode = "76135", city = "Ettlingen", phone = "0721 99999"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
    {
        var client = _factory.CreateClient();
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return client;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record SellerTypePayload(string Id, string Name, decimal CommissionRate, decimal ItemFee);
    private sealed record ProfilePayload(string Id, string FirstName, string City, string Email, SellerTypePayload SellerType);
}
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen (404, da Route nicht registriert)**

Run: `dotnet test tests/BAR.Host.IntegrationTests -f net10.0`
Expected: FAIL — `GetProfile_WithoutToken_Returns401` bekommt `404 NotFound` statt `401`.

- [ ] **Step 3: Endpoint, DI, Program.cs verdrahten**

`BAR.Host/Features/Profile/ProfileEndpoints.cs`:
```csharp
using System.Security.Claims;
using BAR.Application.Profile.GetProfile;
using BAR.Application.Profile.UpdateProfile;
using BAR.Host.Validation;

namespace BAR.Host.Features.Profile;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/profile", async (ClaimsPrincipal user, GetProfileQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPut("/api/profile", async (ClaimsPrincipal user, UpdateProfileCommand command, UpdateProfileCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, command, ct));
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateProfileCommand>>();

        return app;
    }
}
```

`BAR.Infrastructure/DependencyInjection.cs` — drei Zeilen ergänzen (plus `using`-Zeilen für `BAR.Application.Profile.GetProfile`/`BAR.Application.Profile.UpdateProfile`):
```csharp
        services.AddScoped<GetProfileQueryHandler>();
        services.AddScoped<UpdateProfileCommandHandler>();
        services.AddScoped<IValidator<UpdateProfileCommand>, UpdateProfileCommandValidator>();
```

`BAR.Host/Program.cs` — `using BAR.Host.Features.Profile;` ergänzen und nach `app.MapBlocksEndpoints();`:
```csharp
app.MapProfileEndpoints();
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `dotnet test tests/BAR.Host.IntegrationTests -f net10.0`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Profile src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile
git commit -m "feat(bar-app): GET/PUT /api/profile Endpoints"
```

---

## Frontend

### Task 7: Shared `qr-code`-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/qr-code/qr-code.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/qr-code/qr-code.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/package.json` (neue Abhängigkeit)

**Interfaces:**
- Produces: `QrCode` Standalone-Component, Selector `app-qr-code`, Inputs `value: string` (required), `size: number = 128`, `caption: string | null = null`, `errorCorrection: 'L'|'M'|'Q'|'H' = 'M'`. Wird von Task 9 (`VerkaeuferNummer`) konsumiert.

- [ ] **Step 1: Abhängigkeit installieren**

```bash
cd src/advance-registration/frontend/BAR.App && npm install @zxing/library
```

- [ ] **Step 2: Failing-Test schreiben**

`shared/qr-code/qr-code.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { QrCode } from './qr-code';

describe('QrCode', () => {
  let fixture: ComponentFixture<QrCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QrCode] }).compileComponents();
    fixture = TestBed.createComponent(QrCode);
  });

  it('renders an svg for a non-empty value', () => {
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
  });

  it('renders nothing for an empty value', () => {
    fixture.componentRef.setInput('value', '   ');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('shows the caption when set', () => {
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.componentRef.setInput('caption', 'a3f9c2d1');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('a3f9c2d1');
  });
});
```

- [ ] **Step 3: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false` (aus `BAR.App`)
Expected: FAIL — Modul `./qr-code` nicht gefunden.

- [ ] **Step 4: `QrCode`-Komponente implementieren**

`shared/qr-code/qr-code.ts`:
```ts
import { Component, computed, input } from '@angular/core';
import { BrowserQRCodeSvgWriter, EncodeHintType } from '@zxing/library';

const QUIET_ZONE_MODULES = 4;
const writer = new BrowserQRCodeSvgWriter();

@Component({
  selector: 'app-qr-code',
  template: `
    @if (svgMarkup(); as svg) {
      <div [style.width.px]="size()" [style.height.px]="size()" [innerHTML]="svg"></div>
      @if (caption()) {
        <p class="qr-code__caption">{{ caption() }}</p>
      }
    }
  `,
  styles: [`
    .qr-code__caption { font: 11px monospace; text-align: center; margin-top: 4px; }
  `]
})
export class QrCode {
  readonly value = input.required<string>();
  readonly size = input(128);
  readonly caption = input<string | null>(null);
  readonly errorCorrection = input<'L' | 'M' | 'Q' | 'H'>('M');

  readonly svgMarkup = computed<string | null>(() => {
    const value = this.value().trim();
    if (!value) return null;

    const hints = new Map<EncodeHintType, unknown>([
      [EncodeHintType.ERROR_CORRECTION, this.errorCorrection()],
      [EncodeHintType.MARGIN, QUIET_ZONE_MODULES]
    ]);
    const svg = writer.write(value, this.size(), this.size(), hints);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    return svg.outerHTML;
  });
}
```

- [ ] **Step 5: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/package.json src/advance-registration/frontend/BAR.App/package-lock.json src/advance-registration/frontend/BAR.App/src/app/shared/qr-code
git commit -m "feat(bar-app): shared qr-code Komponente (zxing)"
```

---

### Task 8: Shared `info-area`-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/info-area/info-area.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/info-area/info-area.spec.ts`

**Interfaces:**
- Produces: `InfoArea` Standalone-Component, Selector `app-info-area`, Inputs `type: 'success'|'error'|'warn'|'info'` (required), `message: string` (required). Wird von Task 13 (`ProfilePage`) für Fehler-Feedback konsumiert.

- [ ] **Step 1: Failing-Test schreiben**

`shared/info-area/info-area.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InfoArea } from './info-area';

describe('InfoArea', () => {
  let fixture: ComponentFixture<InfoArea>;

  beforeEach(async () => {
    vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => ({
      createOscillator: () => ({
        type: '',
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      }),
      destination: {},
      currentTime: 0
    })));

    await TestBed.configureTestingModule({ imports: [InfoArea] }).compileComponents();
    fixture = TestBed.createComponent(InfoArea);
  });

  it('renders the message with the type-specific icon', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.componentRef.setInput('message', 'Profil konnte nicht gespeichert werden');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('✗');
    expect(fixture.nativeElement.textContent).toContain('Profil konnte nicht gespeichert werden');
  });

  it('does not throw for type info (no tone)', () => {
    fixture.componentRef.setInput('type', 'info');
    fixture.componentRef.setInput('message', 'Hinweis');
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — Modul `./info-area` nicht gefunden.

- [ ] **Step 3: `InfoArea`-Komponente implementieren**

`shared/info-area/info-area.ts`:
```ts
import { Component, computed, effect, input } from '@angular/core';

export type InfoAreaType = 'success' | 'error' | 'warn' | 'info';

const ICONS: Record<InfoAreaType, string> = { success: '✓', error: '✗', warn: '⚠', info: 'ℹ' };

@Component({
  selector: 'app-info-area',
  template: `
    <div class="info-area info-area--{{ type() }}">
      <span class="info-area__icon">{{ icon() }}</span>
      <span class="info-area__message">{{ message() }}</span>
    </div>
  `,
  styles: [`
    .info-area { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 6px; font-weight: 700; }
    .info-area--success { background: #e3f6e8; color: #1e6b34; }
    .info-area--error { background: #fbe3e3; color: #8a1f1f; }
    .info-area--warn { background: #fdf3d8; color: #8a5a1f; }
    .info-area--info { background: #e3edfb; color: #1f4a8a; }
  `]
})
export class InfoArea {
  readonly type = input.required<InfoAreaType>();
  readonly message = input.required<string>();

  readonly icon = computed(() => ICONS[this.type()]);

  constructor() {
    effect(() => this.playTone(this.type()));
  }

  private playTone(type: InfoAreaType): void {
    if (type === 'info') return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.type = type === 'success' ? 'sine' : 'square';
    const [from, to] = type === 'success' ? [880, 1320] : [180, 120];
    oscillator.frequency.setValueAtTime(from, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(to, audioContext.currentTime + 0.15);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/info-area
git commit -m "feat(bar-app): shared info-area Komponente mit Ton-Feedback"
```

---

### Task 9: Shared `verkaeufer-nummer`-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/verkaeufer-nummer/verkaeufer-nummer.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/verkaeufer-nummer/verkaeufer-nummer.spec.ts`

**Interfaces:**
- Consumes: `QrCode` (Task 7).
- Produces: `VerkaeuferNummer` Standalone-Component, Selector `app-verkaeufer-nummer`, Input `sellerId: string` (required). Wird von Task 13 (`ProfilePage`, Panel 00) konsumiert.

- [ ] **Step 1: Failing-Test schreiben**

`shared/verkaeufer-nummer/verkaeufer-nummer.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VerkaeuferNummer } from './verkaeufer-nummer';

describe('VerkaeuferNummer', () => {
  let fixture: ComponentFixture<VerkaeuferNummer>;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    await TestBed.configureTestingModule({
      imports: [VerkaeuferNummer],
      providers: [MessageService]
    }).compileComponents();
    fixture = TestBed.createComponent(VerkaeuferNummer);
    fixture.componentRef.setInput('sellerId', 'a3f9c2d1');
    fixture.detectChanges();
  });

  it('shows the sellerId in plain text', () => {
    expect(fixture.nativeElement.textContent).toContain('a3f9c2d1');
  });

  it('copies the sellerId and shows a toast on click', async () => {
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    await fixture.componentInstance.copy();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('a3f9c2d1');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — Modul `./verkaeufer-nummer` nicht gefunden.

- [ ] **Step 3: `VerkaeuferNummer`-Komponente implementieren**

`shared/verkaeufer-nummer/verkaeufer-nummer.ts`:
```ts
import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { QrCode } from '../qr-code/qr-code';

@Component({
  selector: 'app-verkaeufer-nummer',
  imports: [ButtonModule, QrCode],
  template: `
    <div class="verkaeufer-nummer">
      <p class="verkaeufer-nummer__title">Meine Verkäufernummer</p>
      <div class="verkaeufer-nummer__body">
        <div>
          <span class="verkaeufer-nummer__value">{{ sellerId() }}</span>
          <p-button label="Kopieren" icon="pi pi-copy" [text]="true" severity="secondary" size="small" (onClick)="copy()" />
        </div>
        <app-qr-code [value]="sellerId()" [size]="128" />
      </div>
      <p class="verkaeufer-nummer__hint">Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.</p>
    </div>
  `,
  styles: [`
    .verkaeufer-nummer { background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px; }
    .verkaeufer-nummer__title { font: 700 11px sans-serif; text-transform: uppercase; color: #3a7057; }
    .verkaeufer-nummer__body { display: flex; justify-content: space-between; align-items: center; }
    .verkaeufer-nummer__value { font: 800 24px monospace; color: var(--primary); }
    .verkaeufer-nummer__hint { font-size: 12px; color: var(--muted); }
  `]
})
export class VerkaeuferNummer {
  private readonly messageService = inject(MessageService);

  readonly sellerId = input.required<string>();

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.sellerId());
    this.messageService.add({ severity: 'success', summary: '✓ Nummer kopiert' });
  }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/verkaeufer-nummer
git commit -m "feat(bar-app): shared verkaeufer-nummer Komponente"
```

---

### Task 10: Shared `block-liste`-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/block-liste/block-liste.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/block-liste/block-liste.spec.ts`

**Interfaces:**
- Produces: `BlockListItem` Interface (`id`, `fromNumber`, `toNumber`, `numberCount`, `usedCount`), `BlockListe` Standalone-Component, Selector `app-block-liste`, Input `blocks: BlockListItem[]` (required). Wird von Task 11 (`NumberBlocksPage`) konsumiert.

- [ ] **Step 1: Failing-Test schreiben**

`shared/block-liste/block-liste.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { BlockListe } from './block-liste';

describe('BlockListe', () => {
  let fixture: ComponentFixture<BlockListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BlockListe] }).compileComponents();
    fixture = TestBed.createComponent(BlockListe);
  });

  it('shows the empty state text when there are no blocks', () => {
    fixture.componentRef.setInput('blocks', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Noch keine Nummernblöcke zugewiesen');
  });

  it('renders one item per block with range and counter', () => {
    fixture.componentRef.setInput('blocks', [
      { id: 'b1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3 }
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('101');
    expect(fixture.nativeElement.textContent).toContain('110');
    expect(fixture.nativeElement.textContent).toContain('10 Nummern · 3 vergeben');
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — Modul `./block-liste` nicht gefunden.

- [ ] **Step 3: `BlockListe`-Komponente implementieren**

`shared/block-liste/block-liste.ts`:
```ts
import { Component, input } from '@angular/core';

export interface BlockListItem {
  id: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
}

@Component({
  selector: 'app-block-liste',
  template: `
    @if (blocks().length === 0) {
      <p class="block-liste__empty">Noch keine Nummernblöcke zugewiesen</p>
    } @else {
      @for (block of blocks(); track block.id) {
        <div class="block-liste__item">
          <span class="block-liste__range">{{ block.fromNumber }} – {{ block.toNumber }}</span>
          <span class="block-liste__count">{{ block.numberCount }} Nummern · {{ block.usedCount }} vergeben</span>
        </div>
      }
    }
  `,
  styles: [`
    .block-liste__item {
      display: flex; justify-content: space-between; align-items: center;
      background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 6px;
      padding: 10px 14px; margin-bottom: 8px;
    }
    .block-liste__range { font: 700 14px sans-serif; color: var(--primary); }
    .block-liste__count { font-size: 12px; color: var(--muted); }
    .block-liste__empty { text-align: center; }
  `]
})
export class BlockListe {
  readonly blocks = input.required<BlockListItem[]>();
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/block-liste
git commit -m "feat(bar-app): shared block-liste Komponente"
```

---

### Task 11: `BlocksApiService` + `NumberBlocksPage`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/number-blocks/blocks-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/number-blocks/blocks-api.service.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/number-blocks/pages/NumberBlocksPage.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/number-blocks/pages/NumberBlocksPage.spec.ts`

**Interfaces:**
- Consumes: `BlockListe`, `BlockListItem` (Task 10).
- Produces: `BlockDto` Interface, `BlocksApiService.getMine(): Observable<BlockDto[]>`.

- [ ] **Step 1: Failing-Test für `BlocksApiService` schreiben**

`features/number-blocks/blocks-api.service.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlocksApiService } from './blocks-api.service';

describe('BlocksApiService', () => {
  let service: BlocksApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), BlocksApiService]
    });
    service = TestBed.inject(BlocksApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMine() gets /api/blocks/mine', () => {
    let result: unknown;
    service.getMine().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/blocks/mine');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);

    expect(result).toEqual([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — Modul `./blocks-api.service` nicht gefunden.

- [ ] **Step 3: `BlocksApiService` implementieren**

`features/number-blocks/blocks-api.service.ts`:
```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface BlockDto {
  id: string;
  sellerId: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
  assignedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BlocksApiService {
  private readonly http = inject(HttpClient);

  getMine(): Observable<BlockDto[]> {
    return this.http.get<BlockDto[]>('/api/blocks/mine');
  }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Failing-Test für `NumberBlocksPage` schreiben**

`features/number-blocks/pages/NumberBlocksPage.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NumberBlocksPage } from './NumberBlocksPage';

describe('NumberBlocksPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberBlocksPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads blocks on init and renders them', () => {
    const fixture = TestBed.createComponent(NumberBlocksPage);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/blocks/mine');
    req.flush([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('101');
    expect(fixture.nativeElement.textContent).toContain('10 Nummern · 3 vergeben');
  });

  it('renders the empty state when there are no blocks', () => {
    const fixture = TestBed.createComponent(NumberBlocksPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/blocks/mine').flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Noch keine Nummernblöcke zugewiesen');
  });
});
```

- [ ] **Step 6: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — `NumberBlocksPage` rendert noch `<h1>Nummernblöcke</h1>` ohne `block-liste`.

- [ ] **Step 7: `NumberBlocksPage` implementieren**

`features/number-blocks/pages/NumberBlocksPage.ts`:
```ts
import { Component, inject, signal } from '@angular/core';
import { BlockListe } from '../../../shared/block-liste/block-liste';
import { BlockDto, BlocksApiService } from '../blocks-api.service';

@Component({
  selector: 'app-number-blocks-page',
  imports: [BlockListe],
  template: `
    <h1>Nummernblöcke</h1>
    <app-block-liste [blocks]="blocks()" />
  `
})
export class NumberBlocksPage {
  private readonly api = inject(BlocksApiService);

  readonly blocks = signal<BlockDto[]>([]);

  constructor() {
    this.api.getMine().subscribe((blocks) => this.blocks.set(blocks));
  }
}
```

- [ ] **Step 8: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/number-blocks
git commit -m "feat(bar-app): Nummernblöcke-Seite mit BlocksApiService"
```

---

### Task 12: `ProfileApiService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.spec.ts`

**Interfaces:**
- Produces: `SellerTypeDto`, `ProfileDto`, `UpdateProfilePayload` Interfaces; `ProfileApiService.getProfile(): Observable<ProfileDto>`, `ProfileApiService.updateProfile(payload: UpdateProfilePayload): Observable<ProfileDto>`. Wird von Task 13 (`ProfilePage`) konsumiert.

- [ ] **Step 1: Failing-Test schreiben**

`features/profile/profile-api.service.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileApiService } from './profile-api.service';

const PROFILE = {
  id: 'a3f9c2d1', firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345', email: 'anna@example.com',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }
};

describe('ProfileApiService', () => {
  let service: ProfileApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProfileApiService]
    });
    service = TestBed.inject(ProfileApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProfile() gets /api/profile', () => {
    let result: unknown;
    service.getProfile().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.method).toBe('GET');
    req.flush(PROFILE);

    expect(result).toEqual(PROFILE);
  });

  it('updateProfile() puts to /api/profile', () => {
    let result: unknown;
    const payload = { firstName: 'Anna-Maria', lastName: 'Muster', address: null, postalCode: '76135', city: 'Ettlingen', phone: '0721 99999' };
    service.updateProfile(payload).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...PROFILE, city: 'Ettlingen' });

    expect(result).toEqual({ ...PROFILE, city: 'Ettlingen' });
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — Modul `./profile-api.service` nicht gefunden.

- [ ] **Step 3: `ProfileApiService` implementieren**

`features/profile/profile-api.service.ts`:
```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerTypeDto {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerType: SellerTypeDto;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>('/api/profile');
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ProfileDto> {
    return this.http.put<ProfileDto>('/api/profile', payload);
  }
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.spec.ts
git commit -m "feat(bar-app): ProfileApiService"
```

---

### Task 13: Toast-Infrastruktur (MessageService + p-toast in Shell)

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts`

**Interfaces:**
- Produces: `MessageService` als Root-Provider verfügbar für alle Feature-Komponenten (erstmalige Nutzung in diesem Projekt — Task 9/14 injizieren es bereits, dieser Task macht es global verfügbar und rendert `<p-toast/>` einmal).

- [ ] **Step 1: Bestehenden `shell.spec.ts` anschauen und Erwartung ergänzen (Failing Step)**

Ergänze in `core/shell/shell.spec.ts` (Struktur wie vorhandene Tests dort) einen Test, der `p-toast` im DOM erwartet:
```ts
  it('renders a single p-toast for app-wide notifications', () => {
    expect(fixture.nativeElement.querySelector('p-toast')).not.toBeNull();
  });
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — `p-toast` nicht im Shell-Template.

- [ ] **Step 3: `MessageService` global registrieren, `p-toast` in Shell einbinden**

`app.config.ts` — `MessageService` zu `providers` hinzufügen:
```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { IndustryPreset } from './core/theme/industry-preset';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({
      lang: 'de',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
    }),
    providePrimeNG({
      theme: {
        preset: IndustryPreset,
        options: { darkModeSelector: false }
      }
    }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    MessageService
  ]
};
```

`core/shell/shell.ts` — `ToastModule` importieren:
```ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { LucideMenu } from '@lucide/angular';
import { Sidebar } from './sidebar/sidebar';

const MOBILE_BREAKPOINT = '(max-width: 1024px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, ToastModule, LucideMenu, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell implements OnInit, OnDestroy {
  readonly isMobile = signal(false);
  readonly open = signal(true);

  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  ngOnInit(): void {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    this.isMobile.set(this.mediaQuery.matches);
    this.open.set(!this.mediaQuery.matches);
    this.mediaQueryListener = (event) => {
      this.isMobile.set(event.matches);
      this.open.set(!event.matches);
    };
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }
}
```

`core/shell/shell.html` — `<p-toast/>` ganz oben ergänzen:
```html
<p-toast />
<p-sidebar-layout>
  @if (isMobile() && open()) {
    <p-sidebar-backdrop (click)="open.set(false)" />
  }
  <p-sidebar
    id="app-nav"
    [collapsible]="isMobile() ? 'offcanvas' : 'icon'"
    [overlay]="isMobile()"
    [(open)]="open"
  >
    <app-sidebar [open]="open()" />
  </p-sidebar>
  <p-sidebar-main>
    <header class="content-header">
      <button pButton pSidebarTrigger target="app-nav" severity="secondary" text data-sidebar-trigger>
        <svg lucideMenu></svg>
      </button>
    </header>
    <div class="content-body">
      <router-outlet />
    </div>
  </p-sidebar-main>
</p-sidebar-layout>
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS (bestehende Shell-Tests bleiben ebenfalls grün — `MessageService` muss ggf. in `shell.spec.ts`s `TestBed.configureTestingModule` als Provider ergänzt werden, falls dort kein globaler `appConfig` verwendet wird).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/app.config.ts src/advance-registration/frontend/BAR.App/src/app/core/shell
git commit -m "feat(bar-app): MessageService + p-toast global in Shell"
```

---

### Task 14: `ProfilePage` — Tabs-Gerüst + Steckbrief-Formular

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.spec.ts`

**Interfaces:**
- Consumes: `ProfileApiService`, `ProfileDto`, `UpdateProfilePayload` (Task 12), `VerkaeuferNummer` (Task 9), `InfoArea` (Task 8), `MessageService` (Task 13).

- [ ] **Step 1: Failing-Test schreiben**

`features/profile/pages/ProfilePage.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';

const PROFILE = {
  id: 'a3f9c2d1', firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345', email: 'anna@example.com',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }
};

describe('ProfilePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the profile and pre-fills the form', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.nativeElement.textContent).toContain('Standard');
  });

  it('saves successfully and shows a toast', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ ...PROFILE, city: 'Stuttgart' });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows field errors on 400 and keeps entered values', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('Freiburg');
    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    putReq.flush({ errors: { city: ['Ort ist ein Pflichtfeld.'] } }, { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.fieldErrors()['city']).toEqual(['Ort ist ein Pflichtfeld.']);
    expect(fixture.componentInstance.city()).toBe('Freiburg');
  });

  it('disables saving when a required field is empty', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('');

    expect(fixture.componentInstance.canSave()).toBe(false);
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `ng test --watch=false`
Expected: FAIL — `ProfilePage` rendert noch `<h1>Profil</h1>`, kein `firstName`-Signal.

- [ ] **Step 3: `ProfilePage` implementieren**

`features/profile/pages/ProfilePage.ts`:
```ts
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { VerkaeuferNummer } from '../../../shared/verkaeufer-nummer/verkaeufer-nummer';
import { InfoArea } from '../../../shared/info-area/info-area';
import { ProfileApiService, ProfileDto } from '../profile-api.service';

interface ValidationProblem {
  errors?: Record<string, string[]>;
}

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, ButtonModule, InputTextModule, InputNumberModule, TabsModule, VerkaeuferNummer, InfoArea],
  templateUrl: './ProfilePage.html'
})
export class ProfilePage {
  private readonly api = inject(ProfileApiService);
  private readonly messageService = inject(MessageService);

  readonly profile = signal<ProfileDto | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly saveError = signal<string | null>(null);

  readonly canSave = computed(() =>
    this.firstName().trim() !== '' &&
    this.lastName().trim() !== '' &&
    this.postalCode().trim() !== '' &&
    this.city().trim() !== '' &&
    this.phone().trim() !== '');

  constructor() {
    this.api.getProfile().subscribe((profile) => this.applyProfile(profile));
  }

  save(): void {
    if (!this.canSave()) return;

    this.fieldErrors.set({});
    this.saveError.set(null);

    this.api.updateProfile({
      firstName: this.firstName(),
      lastName: this.lastName(),
      address: this.address() || null,
      postalCode: this.postalCode(),
      city: this.city(),
      phone: this.phone()
    }).subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.messageService.add({ severity: 'success', summary: '✓ Profil gespeichert' });
      },
      error: (response: { status: number; error?: ValidationProblem }) => {
        if (response.status === 400 && response.error?.errors) {
          this.fieldErrors.set(response.error.errors);
        } else {
          this.saveError.set('Profil konnte nicht gespeichert werden');
        }
      }
    });
  }

  private applyProfile(profile: ProfileDto): void {
    this.profile.set(profile);
    this.firstName.set(profile.firstName);
    this.lastName.set(profile.lastName);
    this.address.set(profile.address ?? '');
    this.postalCode.set(profile.postalCode);
    this.city.set(profile.city);
    this.phone.set(profile.phone);
  }
}
```

`features/profile/pages/ProfilePage.html`:
```html
<p-tabs value="steckbrief">
  <p-tablist>
    <p-tab value="steckbrief">Steckbrief</p-tab>
    <p-tab value="zugangsdaten" disabled>Zugangsdaten</p-tab>
    <p-tab value="loeschen" disabled>Löschen</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="steckbrief">
      @if (profile(); as p) {
        <div class="panel-block">
          <app-verkaeufer-nummer [sellerId]="p.id" />
        </div>

        <form (ngSubmit)="save()">
          <div class="panel-block">
            <p class="panel-block__title">Personendaten</p>
            <div class="form-grid">
              <div>
                <label for="firstName">Vorname *</label>
                <input id="firstName" pInputText [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" name="firstName" required />
                @if (fieldErrors()['firstName']; as errors) {
                  <p class="field-error">{{ errors[0] }}</p>
                }
              </div>
              <div>
                <label for="lastName">Nachname *</label>
                <input id="lastName" pInputText [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" name="lastName" required />
                @if (fieldErrors()['lastName']; as errors) {
                  <p class="field-error">{{ errors[0] }}</p>
                }
              </div>
              <div class="full">
                <label for="address">Anschrift</label>
                <input id="address" pInputText [ngModel]="address()" (ngModelChange)="address.set($event)" name="address" />
              </div>
              <div>
                <label for="postalCode">PLZ *</label>
                <input id="postalCode" pInputText [ngModel]="postalCode()" (ngModelChange)="postalCode.set($event)" name="postalCode" required />
                @if (fieldErrors()['postalCode']; as errors) {
                  <p class="field-error">{{ errors[0] }}</p>
                }
              </div>
              <div>
                <label for="city">Ort *</label>
                <input id="city" pInputText [ngModel]="city()" (ngModelChange)="city.set($event)" name="city" required />
                @if (fieldErrors()['city']; as errors) {
                  <p class="field-error">{{ errors[0] }}</p>
                }
              </div>
            </div>
          </div>

          <div class="panel-block">
            <p class="panel-block__title">Kontakt</p>
            <div class="form-grid">
              <div>
                <label for="phone">Telefon *</label>
                <input id="phone" pInputText [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" required />
                @if (fieldErrors()['phone']; as errors) {
                  <p class="field-error">{{ errors[0] }}</p>
                }
              </div>
              <div>
                <label for="email">E-Mail</label>
                <input id="email" pInputText [ngModel]="p.email" name="email" [readonly]="true" />
              </div>
            </div>
          </div>

          <div class="panel-block">
            <p class="panel-block__title">Konditionen</p>
            <div class="form-grid">
              <div class="full">
                <label for="sellerType">Verkäufer-Typ</label>
                <input id="sellerType" pInputText [ngModel]="p.sellerType.name" name="sellerType" [readonly]="true" />
              </div>
              <div>
                <label for="itemFee">Gebühr je Stück</label>
                <p-inputnumber [ngModel]="p.sellerType.itemFee" name="itemFee" mode="decimal" locale="de-DE" [minFractionDigits]="2" [readonly]="true" />
              </div>
              <div>
                <label for="commissionRate">Provision</label>
                <p-inputnumber [ngModel]="p.sellerType.commissionRate" name="commissionRate" mode="decimal" locale="de-DE" [minFractionDigits]="2" [readonly]="true" />
              </div>
            </div>
          </div>

          @if (saveError()) {
            <app-info-area type="error" [message]="saveError()!" />
          }

          <p-button type="submit" label="Speichern" [disabled]="!canSave()" />
        </form>
      }
    </p-tabpanel>
    <p-tabpanel value="zugangsdaten">
      <p>Verfügbar ab R07.</p>
    </p-tabpanel>
    <p-tabpanel value="loeschen">
      <p>Verfügbar ab R07.</p>
    </p-tabpanel>
  </p-tabpanels>
</p-tabs>
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile/pages
git commit -m "feat(bar-app): Profil-Steckbrief mit Tabs-Gerüst"
```

---

## Self-Review (durchgeführt)

**Spec coverage:** BlockResult/Exclusion-Constraint (Design-Abschnitt „Backend — Nummernblöcke fertigstellen") → Task 1+2. Profil-Backend (Abschnitt „Backend — Profil (neu)") → Task 3–6. `verkaeufer-nummer`/`block-liste`/`NumberBlocksPage`/`ProfileApiService`/`ProfilePage` (Abschnitt „Frontend") → Task 7–14 (Task 8 InfoArea und Task 13 Toast-Infrastruktur waren im Design nur implizit über „Toast/Error-InfoArea" genannt — als eigene Tasks ergänzt, da beide noch nicht existieren). Fehlerbehandlung (400 vs. sonstige Fehler) → Task 14. Testing-Abschnitt → in jeden Task eingebettet (TDD-Zyklus) statt als Sammel-Task am Ende.

**Placeholder-Scan:** keine TBD/TODO, keine "add appropriate X"-Formulierungen, jeder Code-Schritt enthält vollständigen Code.

**Typkonsistenz geprüft:** `BlockDto`/`BlockListItem` (Task 10/11) strukturell kompatibel (BlockDto hat zusätzlich `sellerId`/`assignedAt`, `BlockListItem` erwartet nur eine Teilmenge — TS erlaubt das strukturell). `ProfileResult`/`ProfileDto` Feldnamen 1:1 (camelCase durch Minimal-API-Default-Serialisierung aus den PascalCase-Record-Properties). `UpdateProfileCommand`/`UpdateProfilePayload` Feldnamen 1:1. `sellerId` als Property-Name durchgängig in `VerkaeuferNummer` (Task 9) und deren Verwendung in `ProfilePage.html` (`[sellerId]="p.id"`).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-09-r02-nummer-und-profil.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
