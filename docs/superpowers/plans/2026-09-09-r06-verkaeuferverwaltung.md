# R06 Verkäuferverwaltung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin CRUD for Sellers (list/create/update/delete), the invite-link flow (`POST /api/sellers/{id}/invite` + `POST /api/auth/set-password`), and Number-Block management (reserve/delete/next-free suggestion) — the full vertical slice for roadmap step R06.

**Architecture:** One Application use-case folder per endpoint (`Command`/`Query` + `Handler` + optional `Validator`, mirroring `BAR.Application/Auth/Login`), a new read-model query port for the paginated/sorted Seller list (`BAR.Domain/Ports/Queries/`), and an Angular feature module (`features/sellers/`) built on the Shared-UI-Kit (`Table`, `Modal`, `Badge`, `InfoArea` — see [`2026-09-09-shared-ui-kit.md`](2026-09-09-shared-ui-kit.md), which this plan assumes is already implemented). Backend endpoints first, then the Angular feature against the real API (spec.md §10.0.2 Durchstich order).

**Tech Stack:** .NET 10 Minimal API, EF Core (Npgsql), `System.Linq.Dynamic.Core` (new dependency, Task 2) for the multi-field sort in the Seller list query. Angular 22.1, PrimeNG 22.1.0, Vitest.

**Spec:** [`docs/requirements/advance-registration/roadmap/R06-verkaeuferverwaltung.md`](../../requirements/advance-registration/roadmap/R06-verkaeuferverwaltung.md) · [`epics/Epic_Verkaeufer/epic.md`](../../requirements/advance-registration/epics/Epic_Verkaeufer/epic.md) · [`api/sellers.md`](../../requirements/advance-registration/api/sellers.md) · [`api/blocks.md`](../../requirements/advance-registration/api/blocks.md) · [`api/auth.md`](../../requirements/advance-registration/api/auth.md) §4 · [`components/verkaeufer-dialog.md`](../../requirements/advance-registration/components/verkaeufer-dialog.md)

## Global Constraints

- Hexagonal layering: `BAR.Domain` references nothing; `BAR.Application` references `Domain` (+ `Application/Abstractions` ports); `BAR.Infrastructure` implements `Domain/Ports`; `BAR.Host` wires everything (spec.md §10.0.1).
- IDs are 8-char strings via `EntityId.New()`. Hard-delete only, no soft-delete flag (`cross-cutting.md` §5).
- Error responses are RFC 9457 ProblemDetails with an `errorCode` extension, built once by `DomainExceptionHandler` from a thrown `DomainException` subtype — handlers throw, they never construct HTTP responses (`cross-cutting.md` §3).
- Frontend: standalone components, `ChangeDetectionStrategy.OnPush`, Signals (`input()`/`output()`), PrimeNG only, `ng test` (Vitest).
- **Known, documented gap:** the `article` table does not exist yet (R03/Artikelerfassung is currently docs-only, no `BAR.Domain/Articles` implementation). Everywhere this plan's spec text says "delete the seller's articles" or "articleCount", the code below does the part that's possible today (blocks, refresh tokens) and returns a constant `0` for `articleCount` — with an inline comment pointing at this gap so a future Article-persistence plan does not silently miss it.
- Code (types, identifiers, JSON contract) is English; explanatory comments, where needed, are German, matching the existing codebase.

---

## Backend

### Task 1: Seller domain model — admin creation, profile update, invite lifecycle

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs`
- Test: `src/advance-registration/backend/BAR.Domain.UnitTests/Sellers/SellerTests.cs`

**Interfaces:**
- Produces: `Seller.CreateByAdmin(firstName, lastName, address, postalCode, city, phone, email, sellerTypeId, isAdmin)` (no password — `PasswordHash` stays `null`); `seller.UpdateProfile(firstName, lastName, address, postalCode, city, phone, email, sellerTypeId, isAdmin)`; `seller.GenerateInviteToken(nowUtc)` → returns the plaintext token and sets `InviteToken`/`InviteTokenExpiresAt` (+7 days); `seller.ConsumePassword(passwordHash, nowUtc)` → throws `UnauthorizedException("auth.invalid_invite_token", ...)` if `InviteTokenExpiresAt` is `null` or in the past, else sets `PasswordHash` and clears both invite fields.
- Consumed by: Tasks 4 (Create), 5 (Update), 7 (Invite), 8 (SetPassword).

- [ ] **Step 1: Write the failing tests**

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Sellers;

namespace BAR.Domain.UnitTests.Sellers;

public class SellerTests
{
    private static Seller CreateAdminSeller() =>
        Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: false);

    [Fact]
    public void CreateByAdmin_HasNoPasswordAndNoInviteYet()
    {
        var seller = CreateAdminSeller();

        Assert.Null(seller.PasswordHash);
        Assert.Null(seller.InviteToken);
        Assert.Null(seller.InviteTokenExpiresAt);
    }

    [Fact]
    public void UpdateProfile_ChangesFieldsIncludingIsAdmin()
    {
        var seller = CreateAdminSeller();

        seller.UpdateProfile("Anna", "Neu", "Adresse 1", "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: true);

        Assert.Equal("Neu", seller.LastName);
        Assert.Equal("Adresse 1", seller.Address);
        Assert.True(seller.IsAdmin);
    }

    [Fact]
    public void GenerateInviteToken_SetsTokenValidForSevenDays()
    {
        var seller = CreateAdminSeller();
        var now = new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc);

        var token = seller.GenerateInviteToken(now);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(token, seller.InviteToken);
        Assert.Equal(now.AddDays(7), seller.InviteTokenExpiresAt);
    }

    [Fact]
    public void GenerateInviteToken_CalledTwice_InvalidatesThePreviousToken()
    {
        var seller = CreateAdminSeller();
        var first = seller.GenerateInviteToken(DateTime.UtcNow);
        var second = seller.GenerateInviteToken(DateTime.UtcNow);

        Assert.NotEqual(first, second);
        Assert.Equal(second, seller.InviteToken);
    }

    [Fact]
    public void ConsumePassword_ValidToken_SetsPasswordAndClearsInvite()
    {
        var seller = CreateAdminSeller();
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now);

        seller.ConsumePassword("hashed", now);

        Assert.Equal("hashed", seller.PasswordHash);
        Assert.Null(seller.InviteToken);
        Assert.Null(seller.InviteTokenExpiresAt);
    }

    [Fact]
    public void ConsumePassword_ExpiredToken_ThrowsUnauthorized()
    {
        var seller = CreateAdminSeller();
        var issuedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        seller.GenerateInviteToken(issuedAt);

        var ex = Assert.Throws<UnauthorizedException>(() => seller.ConsumePassword("hashed", issuedAt.AddDays(8)));

        Assert.Equal("auth.invalid_invite_token", ex.ErrorCode);
    }

    [Fact]
    public void ConsumePassword_NoInvitePending_ThrowsUnauthorized()
    {
        var seller = CreateAdminSeller();

        Assert.Throws<UnauthorizedException>(() => seller.ConsumePassword("hashed", DateTime.UtcNow));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/BAR.Domain.UnitTests --filter SellerTests`
Expected: FAIL — `CreateByAdmin`/`UpdateProfile`/`GenerateInviteToken`/`ConsumePassword` don't exist.

- [ ] **Step 3: Implement the domain changes**

Replace `src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs` in full:

```csharp
using BAR.Domain.Common;
using BAR.Domain.Exceptions;

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
    public string Email { get; private set; } = null!;
    public string SellerTypeId { get; private set; } = null!;
    public bool IsAdmin { get; private set; }
    public string? PasswordHash { get; private set; }
    public string? InviteToken { get; private set; }
    public DateTime? InviteTokenExpiresAt { get; private set; }

    public static Seller Register(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId,
        string passwordHash, bool isAdmin = false)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin, PasswordHash = passwordHash
        };
    }

    /// <summary>Admin-Anlage (Epic_Verkaeufer Panel 05) - kein Passwort, Zugang erst per Invite-Link.</summary>
    public static Seller CreateByAdmin(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId, bool isAdmin)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin
        };
    }

    public void UpdateProfile(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId, bool isAdmin)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        FirstName = firstName;
        LastName = lastName;
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
        Email = email;
        SellerTypeId = sellerTypeId;
        IsAdmin = isAdmin;
    }

    /// <summary>Erzeugt und ueberschreibt das Invite-Token (api/sellers.md Abschnitt 5) - ein erneuter Aufruf entwertet das alte.</summary>
    public string GenerateInviteToken(DateTime nowUtc)
    {
        var token = Guid.NewGuid().ToString("N");
        InviteToken = token;
        InviteTokenExpiresAt = nowUtc.AddDays(7);
        return token;
    }

    /// <summary>Verbraucht das Invite-Token und setzt das Erstpasswort (api/auth.md Abschnitt 4).</summary>
    public void ConsumePassword(string passwordHash, DateTime nowUtc)
    {
        if (InviteTokenExpiresAt is null || InviteTokenExpiresAt < nowUtc)
        {
            throw new UnauthorizedException("auth.invalid_invite_token", "Token unbekannt, bereits verbraucht oder abgelaufen");
        }

        PasswordHash = passwordHash;
        InviteToken = null;
        InviteTokenExpiresAt = null;
    }

    private static void ValidateRequiredFields(
        string firstName, string lastName, string postalCode, string city, string phone, string email, string sellerTypeId)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email ist Pflicht.", nameof(email));
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("sellerTypeId ist Pflicht.", nameof(sellerTypeId));
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/BAR.Domain.UnitTests --filter SellerTests`
Expected: PASS (7 tests). Also re-run the full `BAR.Domain.UnitTests` and `BAR.Application.UnitTests` projects — `RegisterCommandHandlerTests` still calls `Seller.Register(...)`, unchanged, so it must stay green.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs src/advance-registration/backend/BAR.Domain.UnitTests/Sellers/SellerTests.cs
git commit -m "feat(bar-app): add admin-creation, profile update and invite lifecycle to Seller"
```

---

### Task 2: Repository additions + paginated/sorted Seller list query

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/INumberBlockRepository.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/Queries/ISellerListQuery.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/NumberBlockRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/SellerListQuery.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/BAR.Infrastructure.csproj` (new package reference)
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Infrastructure.IntegrationTests/Persistence/Queries/SellerListQueryTests.cs` *(uses the existing integration-test DB fixture — see any existing file under `BAR.Infrastructure.IntegrationTests` for the base class/connection setup used there; wire this test the same way)*

**Interfaces:**
- Produces: `ISellerRepository.UpdateAsync(Seller, ct)`, `.DeleteAsync(Seller, ct)`, `.GetByInviteTokenAsync(token, ct)`; `INumberBlockRepository.GetByIdAsync(id, ct)`, `.DeleteAsync(NumberBlock, ct)`, `.DeleteAllForSellerAsync(sellerId, ct)`; `ISellerListQuery.ExecuteAsync(search, page, pageSize, sort, ct) → (IReadOnlyList<SellerListItem>, int totalCount)` with `SellerListItem` and `SellerSort` records.
- Consumed by: Tasks 3–6.

- [ ] **Step 1: Add the port methods**

`ISellerRepository.cs` (full replacement):

```csharp
namespace BAR.Domain.Ports;

public interface ISellerRepository
{
    Task<BAR.Domain.Sellers.Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<BAR.Domain.Sellers.Seller?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<BAR.Domain.Sellers.Seller?> GetByInviteTokenAsync(string inviteToken, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
    Task UpdateAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
    Task DeleteAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
}
```

`INumberBlockRepository.cs` (full replacement):

```csharp
namespace BAR.Domain.Ports;

public interface INumberBlockRepository
{
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<BAR.Domain.NumberBlocks.NumberBlock?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.NumberBlocks.NumberBlock block, CancellationToken cancellationToken);
    Task AddRangeAsync(IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock> blocks, CancellationToken cancellationToken);
    Task DeleteAsync(BAR.Domain.NumberBlocks.NumberBlock block, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
```

Create `ISellerListQuery.cs`:

```csharp
namespace BAR.Domain.Ports.Queries;

public interface ISellerListQuery
{
    Task<(IReadOnlyList<SellerListItem> Items, int TotalCount)> ExecuteAsync(
        string? search, int page, int pageSize, IReadOnlyList<SellerSort> sort, CancellationToken cancellationToken);
}

public sealed record SellerListItem(
    string Id, int? StartNumber, string FirstName, string LastName, string? Address,
    string PostalCode, string City, string Phone, string Email, string SellerTypeId,
    string SellerTypeName, decimal CommissionRate, decimal ItemFee, bool IsAdmin,
    int ArticleCount, bool HasPendingInvite);

public sealed record SellerSort(string Field, bool Descending);
```

- [ ] **Step 2: Implement the repository additions**

Add to `SellerRepository.cs` (inside the existing class, alongside the existing methods):

```csharp
    public Task<Seller?> GetByInviteTokenAsync(string inviteToken, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.InviteToken == inviteToken, cancellationToken);

    public async Task UpdateAsync(Seller seller, CancellationToken cancellationToken)
    {
        // seller ist bereits vom selben DbContext getrackt (ueber GetByIdAsync
        // geladen) - kein erneutes Attach noetig, nur committen.
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }
    }

    public async Task DeleteAsync(Seller seller, CancellationToken cancellationToken)
    {
        dbContext.Sellers.Remove(seller);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
```

Add to `NumberBlockRepository.cs`:

```csharp
    public Task<NumberBlock?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.NumberBlocks.SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task DeleteAsync(NumberBlock block, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.Remove(block);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        await dbContext.NumberBlocks.Where(b => b.SellerId == sellerId).ExecuteDeleteAsync(cancellationToken);
    }
```

- [ ] **Step 3: Add the `System.Linq.Dynamic.Core` package**

Run: `dotnet add src/advance-registration/backend/BAR.Infrastructure package System.Linq.Dynamic.Core`

Rationale (inline comment goes into `SellerListQuery.cs` below): the Admin-Tabelle's multi-sort spans 9 heterogeneously-typed, partly-joined fields (`api/sellers.md` §1) — hand-written `OrderBy`/`ThenBy` chains for every asc/desc/first/subsequent combination would be ~40 near-duplicate branches. Dynamic LINQ's string-based `OrderBy("Field asc, Field2 desc")` is exactly this library's designed use case and keeps the query itself simple; the field-name-to-path mapping below is a fixed allow-list, so no client string ever reaches the generated expression directly.

- [ ] **Step 4: Write the failing integration test**

```csharp
using BAR.Domain.Ports.Queries;
using BAR.Domain.Sellers;
using BAR.Domain.NumberBlocks;
using BAR.Domain.SellerTypes;
using BAR.Infrastructure.Persistence.Queries;

namespace BAR.Infrastructure.IntegrationTests.Persistence.Queries;

public class SellerListQueryTests : IntegrationTestBase // an existing base class already used by other BAR.Infrastructure.IntegrationTests files - wire this up the same way they connect to the test database
{
    [Fact]
    public async Task ExecuteAsync_FiltersBySearchAcrossNameAndCity()
    {
        var type = SellerType.Create("Standard", 15m, 0.5m);
        DbContext.SellerTypes.Add(type);
        var anna = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", type.Id, false);
        var ben = Seller.CreateByAdmin("Ben", "Muster", null, "10115", "Berlin", "030 1", "ben@example.com", type.Id, false);
        DbContext.Sellers.AddRange(anna, ben);
        await DbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var query = new SellerListQuery(DbContext);
        var (items, total) = await query.ExecuteAsync("karlsruhe", 1, 25, [], TestContext.Current.CancellationToken);

        Assert.Equal(1, total);
        Assert.Equal("Anna", items[0].FirstName);
    }

    [Fact]
    public async Task ExecuteAsync_SortsByStartNumberDescending()
    {
        var type = SellerType.Create("Standard", 15m, 0.5m);
        DbContext.SellerTypes.Add(type);
        var anna = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", type.Id, false);
        var ben = Seller.CreateByAdmin("Ben", "Muster", null, "10115", "Berlin", "030 1", "ben@example.com", type.Id, false);
        DbContext.Sellers.AddRange(anna, ben);
        DbContext.NumberBlocks.Add(NumberBlock.Assign(anna.Id, 101, 10, DateTime.UtcNow));
        DbContext.NumberBlocks.Add(NumberBlock.Assign(ben.Id, 201, 10, DateTime.UtcNow));
        await DbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var query = new SellerListQuery(DbContext);
        var (items, _) = await query.ExecuteAsync(null, 1, 25, [new SellerSort("startNumber", true)], TestContext.Current.CancellationToken);

        Assert.Equal("Ben", items[0].FirstName);
        Assert.Equal("Anna", items[1].FirstName);
    }
}
```

- [ ] **Step 5: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Infrastructure.IntegrationTests --filter SellerListQueryTests`
Expected: FAIL — `SellerListQuery` type doesn't exist.

- [ ] **Step 6: Implement the query**

`SellerListQuery.cs`:

```csharp
using BAR.Domain.Ports.Queries;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class SellerListQuery(BarDbContext dbContext) : ISellerListQuery
{
    // Feste Zuordnung API-Feldname -> Property-Pfad auf SellerSortRow; nur
    // diese neun Felder sind laut api/sellers.md Abschnitt 1 sortierbar. Ein
    // Client-String erreicht Dynamic LINQ nie direkt - nur der gemappte Pfad.
    private static readonly Dictionary<string, string> SortFieldMap = new()
    {
        ["startNumber"] = "StartNumber",
        ["firstName"] = "Seller.FirstName",
        ["lastName"] = "Seller.LastName",
        ["postalCode"] = "Seller.PostalCode",
        ["city"] = "Seller.City",
        ["sellerType.name"] = "Type.Name",
        ["commissionRate"] = "Type.CommissionRate",
        ["itemFee"] = "Type.ItemFee",
        // Artikel-Tabelle existiert noch nicht (siehe Global Constraints) -
        // articleCount ist konstant 0, die Sortierung danach ist bis zur
        // Artikel-Persistenz ein No-Op auf einem stabilen Schluessel.
        ["articleCount"] = "Seller.Id"
    };

    public async Task<(IReadOnlyList<SellerListItem>, int)> ExecuteAsync(
        string? search, int page, int pageSize, IReadOnlyList<SellerSort> sort, CancellationToken cancellationToken)
    {
        var query =
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            select new SellerSortRow
            {
                Seller = seller,
                Type = type,
                StartNumber = dbContext.NumberBlocks.Where(b => b.SellerId == seller.Id).Min(b => (int?)b.FromNumber)
            };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Seller.FirstName, pattern) ||
                EF.Functions.ILike(x.Seller.LastName, pattern) ||
                EF.Functions.ILike(x.Seller.City, pattern) ||
                EF.Functions.ILike(x.Seller.Email, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var orderBy = sort.Count == 0
            ? "Seller.LastName asc"
            : string.Join(", ", sort.Select(s => $"{SortFieldMap[s.Field]} {(s.Descending ? "descending" : "ascending")}"));

        var page1 = await query
            .OrderBy(orderBy)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = page1.Select(x => new SellerListItem(
            x.Seller.Id, x.StartNumber, x.Seller.FirstName, x.Seller.LastName, x.Seller.Address,
            x.Seller.PostalCode, x.Seller.City, x.Seller.Phone, x.Seller.Email, x.Seller.SellerTypeId,
            x.Type.Name, x.Type.CommissionRate, x.Type.ItemFee, x.Seller.IsAdmin,
            0,
            x.Seller.InviteToken != null && x.Seller.InviteTokenExpiresAt > DateTime.UtcNow
        )).ToList();

        return (items, totalCount);
    }

    private sealed class SellerSortRow
    {
        public required BAR.Domain.Sellers.Seller Seller { get; init; }
        public required BAR.Domain.SellerTypes.SellerType Type { get; init; }
        public int? StartNumber { get; init; }
    }
}
```

- [ ] **Step 7: Register the query in DI**

In `DependencyInjection.cs`, add the `using BAR.Domain.Ports.Queries;` and `using BAR.Infrastructure.Persistence.Queries;` imports and, alongside the other `services.AddScoped<I...Repository, ...>()` lines:

```csharp
        services.AddScoped<ISellerListQuery, SellerListQuery>();
```

- [ ] **Step 8: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Infrastructure.IntegrationTests --filter SellerListQueryTests`
Expected: PASS (2 tests)

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/ src/advance-registration/backend/BAR.Infrastructure/
git commit -m "feat(bar-app): add Seller repository CRUD ports and paginated/sorted list query"
```

---

### Task 3: `GET /api/sellers`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/List/GetSellersQuery.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/List/GetSellersQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/SellerResponse.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Sellers/List/GetSellersQueryHandlerTests.cs`

**Interfaces:**
- Produces: `SellerResponse` DTO (mirrors `api/sellers.md` Verkäufer-Objekt, used by every Sellers endpoint from here on); `GetSellersQuery(string? Search, int Page, int PageSize, IReadOnlyList<SellerSort> Sort)`; `GetSellersQueryHandler.HandleAsync(query, ct) → PagedResult<SellerResponse>` (paginated envelope per `cross-cutting.md` §4: `{ items, totalCount, page, pageSize }`).
- Consumes: `ISellerListQuery` (Task 2).

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Sellers.List;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Sellers.List;

public class GetSellersQueryHandlerTests
{
    private readonly Mock<ISellerListQuery> _query = new();

    [Fact]
    public async Task HandleAsync_MapsQueryResultToPagedSellerResponses()
    {
        _query.Setup(q => q.ExecuteAsync("anna", 1, 25, It.IsAny<IReadOnlyList<SellerSort>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(([
                new SellerListItem("s1", 101, "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com",
                    "t1", "Standard", 15m, 0.5m, false, 3, false)
            ], 1));
        var handler = new GetSellersQueryHandler(_query.Object);

        var result = await handler.HandleAsync(new GetSellersQuery("anna", 1, 25, []), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].FirstName);
        Assert.Equal(101, result.Items[0].StartNumber);
        Assert.Equal("Standard", result.Items[0].SellerType.Name);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter GetSellersQueryHandlerTests`
Expected: FAIL — namespace/types don't exist yet.

- [ ] **Step 3: Implement the DTOs and handler**

`SellerResponse.cs` (shared by every Sellers endpoint):

```csharp
namespace BAR.Application.Sellers;

public sealed record SellerResponse(
    string Id, int? StartNumber, string FirstName, string LastName, string? Address,
    string PostalCode, string City, string Phone, string Email, string SellerTypeId,
    SellerTypeSummary SellerType, bool IsAdmin, int ArticleCount, bool HasPendingInvite);

public sealed record SellerTypeSummary(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
```

`GetSellersQuery.cs`:

```csharp
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Sellers.List;

public sealed record GetSellersQuery(string? Search, int Page, int PageSize, IReadOnlyList<SellerSort> Sort);
```

`GetSellersQueryHandler.cs`:

```csharp
using BAR.Application.Sellers;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Sellers.List;

public sealed class GetSellersQueryHandler(ISellerListQuery query)
{
    public async Task<PagedResult<SellerResponse>> HandleAsync(GetSellersQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await query.ExecuteAsync(request.Search, request.Page, request.PageSize, request.Sort, cancellationToken);

        var responses = items.Select(x => new SellerResponse(
            x.Id, x.StartNumber, x.FirstName, x.LastName, x.Address, x.PostalCode, x.City, x.Phone, x.Email,
            x.SellerTypeId, new SellerTypeSummary(x.SellerTypeId, x.SellerTypeName, x.CommissionRate, x.ItemFee),
            x.IsAdmin, x.ArticleCount, x.HasPendingInvite)).ToList();

        return new PagedResult<SellerResponse>(responses, totalCount, request.Page, request.PageSize);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter GetSellersQueryHandlerTests`
Expected: PASS

- [ ] **Step 5: Add the endpoint**

`SellersEndpoints.cs`:

```csharp
using BAR.Application.Sellers.List;
using BAR.Domain.Ports.Queries;

namespace BAR.Host.Features.Sellers;

public static class SellersEndpoints
{
    public static IEndpointRouteBuilder MapSellersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sellers").RequireAuthorization("admin");

        group.MapGet("/", async (
            string? search, int page, int pageSize, string? sort,
            GetSellersQueryHandler handler, CancellationToken ct) =>
        {
            var sortMeta = ParseSort(sort);
            var query = new GetSellersQuery(search, page <= 0 ? 1 : page, pageSize <= 0 ? 25 : pageSize, sortMeta);
            return Results.Ok(await handler.HandleAsync(query, ct));
        });

        return app;
    }

    /// <summary>Parst `?sort=field:asc,field2:desc` (cross-cutting.md Abschnitt 4).</summary>
    private static IReadOnlyList<SellerSort> ParseSort(string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return [];
        }

        return sort.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split(':'))
            .Where(parts => parts.Length == 2)
            .Select(parts => new SellerSort(parts[0], parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }
}
```

- [ ] **Step 6: Register the handler and mount the endpoint group**

In `DependencyInjection.cs`, add:

```csharp
        services.AddScoped<BAR.Application.Sellers.List.GetSellersQueryHandler>();
```

In `Program.cs`, add the import `using BAR.Host.Features.Sellers;` and, next to the other `app.Map...Endpoints();` calls:

```csharp
app.MapSellersEndpoints();
```

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Sellers/ src/advance-registration/backend/BAR.Host/Features/Sellers/ src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add GET /api/sellers"
```

---

### Task 4: `POST /api/sellers`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Create/CreateSellerCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Create/CreateSellerCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Create/CreateSellerCommandValidator.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Sellers/Create/CreateSellerCommandHandlerTests.cs`

**Interfaces:**
- Produces: `CreateSellerCommand(FirstName, LastName, Address, PostalCode, City, Phone, Email, SellerTypeId, IsAdmin, StartNumber?, BlockCount?)`; handler returns `SellerResponse`.
- Consumes: `ISellerRepository`, `ISettingsRepository`, `INumberBlockRepository`, `NumberBlockAllocator` (same allocator as `RegisterCommandHandler` — `api/sellers.md` §2: "**derselbe** `NumberBlockAllocator`").

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Settings;
using BAR.Application.Sellers.Create;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Create;

public class CreateSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();

    private CreateSellerCommandHandler CreateHandler() => new(_sellers.Object, _settings.Object, _blocks.Object);

    private static CreateSellerCommand ValidCommand() =>
        new("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", false, null, null);

    private void SetUpHappyPath()
    {
        var settings = Domain.Settings.Settings.Create(
            DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
    }

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerWithoutPasswordAndReservesBlocks()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var response = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("anna@example.com", response.Email);
        Assert.False(response.HasPendingInvite);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x => x.PasswordHash == null), It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(list => list.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.CreateByAdmin("X", "Y", null, "1", "Z", "0", "anna@example.com", "t0000001", false));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter CreateSellerCommandHandlerTests`
Expected: FAIL — types don't exist.

- [ ] **Step 3: Implement**

`CreateSellerCommand.cs`:

```csharp
namespace BAR.Application.Sellers.Create;

public sealed record CreateSellerCommand(
    string FirstName, string LastName, string? Address, string PostalCode, string City,
    string Phone, string Email, string SellerTypeId, bool IsAdmin, int? StartNumber, int? BlockCount);
```

`CreateSellerCommandValidator.cs` (mirrors `RegisterCommandValidator`'s required-field rules, without the password rule):

```csharp
using FluentValidation;

namespace BAR.Application.Sellers.Create;

public sealed class CreateSellerCommandValidator : AbstractValidator<CreateSellerCommand>
{
    public CreateSellerCommandValidator()
    {
        RuleFor(c => c.FirstName).NotEmpty();
        RuleFor(c => c.LastName).NotEmpty();
        RuleFor(c => c.PostalCode).NotEmpty();
        RuleFor(c => c.City).NotEmpty();
        RuleFor(c => c.Phone).NotEmpty();
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.SellerTypeId).NotEmpty();
    }
}
```

`CreateSellerCommandHandler.cs`:

```csharp
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Sellers.Create;

public sealed class CreateSellerCommandHandler(
    ISellerRepository sellers, ISettingsRepository settingsRepository, INumberBlockRepository blocks)
{
    public async Task<SellerResponse> HandleAsync(CreateSellerCommand command, CancellationToken cancellationToken)
    {
        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new BAR.Domain.Exceptions.ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

        var seller = Seller.CreateByAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.AddAsync(seller, cancellationToken);

        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, seller.Id, command.BlockCount ?? settings.DefaultBlockCount,
            command.StartNumber ?? settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        return new SellerResponse(
            seller.Id, newBlocks.Count > 0 ? newBlocks[0].FromNumber : null, seller.FirstName, seller.LastName,
            seller.Address, seller.PostalCode, seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummary(seller.SellerTypeId, "", 0, 0), seller.IsAdmin, 0, false);
    }
}
```

> `SellerTypeSummary` in the response is left with placeholder `Name`/rates here deliberately — the caller (endpoint, Step 4) doesn't have the `SellerType` loaded and re-querying it would duplicate `GetSellersQueryHandler`'s job for a single row. Fix in Step 4 by loading it once via `ISellerTypeRepository` in the endpoint delegate before building the final response — see below.

- [ ] **Step 4: Add the endpoint**

Add to `SellersEndpoints.cs`, inside `MapSellersEndpoints`:

```csharp
        group.MapPost("/", async (
            CreateSellerCommand command, CreateSellerCommandHandler handler,
            ISellerTypeRepository sellerTypes, CancellationToken ct) =>
        {
            var response = await handler.HandleAsync(command, ct);
            var type = await sellerTypes.GetByIdAsync(response.SellerTypeId, ct);
            var enriched = response with { SellerType = new SellerTypeSummary(type!.Id, type.Name, type.CommissionRate, type.ItemFee) };
            return Results.Created($"/api/sellers/{enriched.Id}", enriched);
        }).AddEndpointFilter<ValidationFilter<CreateSellerCommand>>();
```

Add the required `using BAR.Application.Sellers.Create;`, `using BAR.Application.Sellers;`, `using BAR.Domain.Ports;`, `using BAR.Host.Validation;` to the top of `SellersEndpoints.cs`.

*(This assumes `ISellerTypeRepository.GetByIdAsync(id, ct)` already exists — confirm it does before writing this step; it was referenced by `SellerTypeRepository` in the codebase survey. If it doesn't, add `Task<SellerType?> GetByIdAsync(string id, CancellationToken)` to `ISellerTypeRepository` and its implementation as a one-line addition first.)*

- [ ] **Step 5: Register handler and validator**

In `DependencyInjection.cs`:

```csharp
        services.AddScoped<BAR.Application.Sellers.Create.CreateSellerCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Sellers.Create.CreateSellerCommand>, BAR.Application.Sellers.Create.CreateSellerCommandValidator>();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter CreateSellerCommandHandlerTests`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Sellers/Create/ src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add POST /api/sellers"
```

---

### Task 5: `PUT /api/sellers/{id}`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Update/UpdateSellerCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Update/UpdateSellerCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Update/UpdateSellerCommandValidator.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Sellers/Update/UpdateSellerCommandHandlerTests.cs`

**Interfaces:**
- Produces: `UpdateSellerCommand(SellerId, FirstName, LastName, Address, PostalCode, City, Phone, Email, SellerTypeId, IsAdmin)` → `SellerResponse`.

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Sellers.Update;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Update;

public class UpdateSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();

    [Fact]
    public async Task HandleAsync_ExistingSeller_UpdatesProfile()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var handler = new UpdateSellerCommandHandler(_sellers.Object);

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Neu", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", true);
        var response = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.Equal("Neu", response.LastName);
        Assert.True(response.IsAdmin);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("missing", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = new UpdateSellerCommandHandler(_sellers.Object);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(() => handler.HandleAsync(
            new UpdateSellerCommand("missing", "A", "B", null, "1", "C", "0", "a@b.de", "t1", false),
            TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_EmailTakenByAnotherSeller_ThrowsConflict()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var other = Seller.CreateByAdmin("Ben", "X", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("ben@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(other);
        var handler = new UpdateSellerCommandHandler(_sellers.Object);

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Alt", null, "1", "Karlsruhe", "0", "ben@example.com", "t1", false);
        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(command, TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter UpdateSellerCommandHandlerTests`
Expected: FAIL

- [ ] **Step 3: Implement**

`UpdateSellerCommand.cs`:

```csharp
namespace BAR.Application.Sellers.Update;

public sealed record UpdateSellerCommand(
    string SellerId, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, string SellerTypeId, bool IsAdmin);
```

`UpdateSellerCommandValidator.cs`: identical rule set to `CreateSellerCommandValidator` (see Task 4), just `AbstractValidator<UpdateSellerCommand>`.

`UpdateSellerCommandHandler.cs`:

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Update;

public sealed class UpdateSellerCommandHandler(ISellerRepository sellers)
{
    public async Task<SellerResponse> HandleAsync(UpdateSellerCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var existingWithEmail = await sellers.GetByEmailAsync(command.Email, cancellationToken);
        if (existingWithEmail is not null && existingWithEmail.Id != seller.Id)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        seller.UpdateProfile(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.UpdateAsync(seller, cancellationToken);

        return new SellerResponse(
            seller.Id, null, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummary(seller.SellerTypeId, "", 0, 0), seller.IsAdmin, 0, seller.InviteToken != null);
    }
}
```

- [ ] **Step 4: Add the endpoint** (same `SellerType`-enrichment approach as Task 4 Step 4, and `startNumber`/`articleCount` likewise need a real lookup — reuse `ISellerListQuery` for a single-seller re-fetch is overkill; instead inject `INumberBlockRepository` to compute `StartNumber` from `GetForSellerAsync`)

```csharp
        group.MapPut("/{id}", async (
            string id, UpdateSellerCommand body, UpdateSellerCommandHandler handler,
            ISellerTypeRepository sellerTypes, INumberBlockRepository blocks, CancellationToken ct) =>
        {
            var command = body with { SellerId = id };
            var response = await handler.HandleAsync(command, ct);
            var type = await sellerTypes.GetByIdAsync(response.SellerTypeId, ct);
            var sellerBlocks = await blocks.GetForSellerAsync(id, ct);
            var enriched = response with
            {
                SellerType = new SellerTypeSummary(type!.Id, type.Name, type.CommissionRate, type.ItemFee),
                StartNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : null
            };
            return Results.Ok(enriched);
        }).AddEndpointFilter<ValidationFilter<UpdateSellerCommand>>();
```

- [ ] **Step 5: Register handler and validator**

```csharp
        services.AddScoped<BAR.Application.Sellers.Update.UpdateSellerCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Sellers.Update.UpdateSellerCommand>, BAR.Application.Sellers.Update.UpdateSellerCommandValidator>();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter UpdateSellerCommandHandlerTests`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Sellers/Update/ src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add PUT /api/sellers/{id}"
```

---

### Task 6: `DELETE /api/sellers/{id}`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Delete/DeleteSellerCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Delete/DeleteSellerCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Sellers/Delete/DeleteSellerCommandHandlerTests.cs`

**Interfaces:**
- Produces: `DeleteSellerCommand(SellerId, RequestingSellerId)` (the second field carries the `sub` claim so the handler can enforce AC-13/AC-14 without the endpoint knowing the business rule). Handler cascades: number blocks → refresh tokens → seller row. **Article deletion is not implemented** — see Global Constraints; the doc's step "delete the seller's articles first" has no table to act on yet.
- Consumes: `ISellerRepository`, `INumberBlockRepository`, `IRefreshTokenRepository`.

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Sellers.Delete;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Delete;

public class DeleteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();

    private DeleteSellerCommandHandler CreateHandler() => new(_sellers.Object, _blocks.Object, _refreshTokens.Object);

    private static Seller AdminSeller(string email = "admin@bazaar.local") =>
        Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", email, "t1", true);

    [Fact]
    public async Task HandleAsync_OtherAdminDeletesNonSelfSeller_CascadesBlocksAndTokens()
    {
        var target = Seller.CreateByAdmin("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        var requester = AdminSeller();
        _sellers.Setup(s => s.GetByIdAsync(target.Id, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(2);
        var handler = CreateHandler();

        await handler.HandleAsync(new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken);

        _blocks.Verify(b => b.DeleteAllForSellerAsync(target.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(target.Id, It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(target, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_SelfDelete_ThrowsConflict()
    {
        var requester = AdminSeller();
        _sellers.Setup(s => s.GetByIdAsync(requester.Id, It.IsAny<CancellationToken>())).ReturnsAsync(requester);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(requester.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.self_delete_via_profile", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_LastAdmin_ThrowsConflict()
    {
        var target = AdminSeller("last@bazaar.local");
        var requester = AdminSeller("other-admin@bazaar.local");
        _sellers.Setup(s => s.GetByIdAsync(target.Id, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.last_admin", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter DeleteSellerCommandHandlerTests`
Expected: FAIL — `ISellerRepository.CountAdminsAsync` and the handler don't exist yet.

- [ ] **Step 3: Add the missing repository method**

Add to `ISellerRepository.cs`: `Task<int> CountAdminsAsync(CancellationToken cancellationToken);`

Add to `SellerRepository.cs`:

```csharp
    public Task<int> CountAdminsAsync(CancellationToken cancellationToken) =>
        dbContext.Sellers.CountAsync(s => s.IsAdmin, cancellationToken);
```

- [ ] **Step 4: Implement the command and handler**

`DeleteSellerCommand.cs`:

```csharp
namespace BAR.Application.Sellers.Delete;

public sealed record DeleteSellerCommand(string SellerId, string RequestingSellerId);
```

`DeleteSellerCommandHandler.cs`:

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Delete;

public sealed class DeleteSellerCommandHandler(
    ISellerRepository sellers, INumberBlockRepository blocks, IRefreshTokenRepository refreshTokens)
{
    public async Task HandleAsync(DeleteSellerCommand command, CancellationToken cancellationToken)
    {
        if (command.SellerId == command.RequestingSellerId)
        {
            throw new ConflictException("seller.self_delete_via_profile", "Zum Löschen des eigenen Accounts das Profil verwenden");
        }

        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        if (seller.IsAdmin && await sellers.CountAdminsAsync(cancellationToken) <= 1)
        {
            throw new ConflictException("seller.last_admin", "Der letzte Admin kann nicht gelöscht werden");
        }

        // Artikel-Loeschung entfaellt: die Artikel-Tabelle existiert noch
        // nicht (siehe Global Constraints dieses Plans). Sobald sie da ist,
        // gehoert hier der erste Kaskaden-Schritt hin (api/sellers.md Abschnitt 4).
        await blocks.DeleteAllForSellerAsync(seller.Id, cancellationToken);
        await refreshTokens.DeleteAllForSellerAsync(seller.Id, cancellationToken);
        await sellers.DeleteAsync(seller, cancellationToken);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter DeleteSellerCommandHandlerTests`
Expected: PASS (3 tests)

- [ ] **Step 6: Add the endpoint**

```csharp
        group.MapDelete("/{id}", async (
            string id, ClaimsPrincipal user, DeleteSellerCommandHandler handler, CancellationToken ct) =>
        {
            var requestingSellerId = user.FindFirstValue("sub")!;
            await handler.HandleAsync(new DeleteSellerCommand(id, requestingSellerId), ct);
            return Results.NoContent();
        });
```

Add `using System.Security.Claims;` and `using BAR.Application.Sellers.Delete;` to `SellersEndpoints.cs`.

- [ ] **Step 7: Register the handler**

```csharp
        services.AddScoped<BAR.Application.Sellers.Delete.DeleteSellerCommandHandler>();
```

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerRepository.cs src/advance-registration/backend/BAR.Application/Sellers/Delete/ src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add DELETE /api/sellers/{id} with last-admin and self-delete guards"
```

---

### Task 7: `POST /api/sellers/{id}/invite`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Invite/InviteSellerCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Sellers/Invite/InviteSellerCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Modify: `src/advance-registration/backend/BAR.Host/appsettings.json` *(add the base-URL setting used to build the invite link — check the existing file for the naming pattern other config sections use, e.g. `Jwt`, and add a sibling `"Frontend": { "BaseUrl": "http://localhost:4200" }` section)*
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Sellers/Invite/InviteSellerCommandHandlerTests.cs`

**Interfaces:**
- Produces: `InviteSellerCommand(SellerId)` → `InviteResult(string InviteUrl, DateTime ExpiresAt)`. The handler builds only the token+expiry; the endpoint composes the full URL from configuration (`api/sellers.md` §5: "Das Backend baut die vollständige URL").

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Sellers.Invite;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Invite;

public class InviteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IClock> _clock = new();

    [Fact]
    public async Task HandleAsync_ExistingSeller_GeneratesTokenAndPersists()
    {
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var now = new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var handler = new InviteSellerCommandHandler(_sellers.Object, _clock.Object);

        var result = await handler.HandleAsync(new InviteSellerCommand(seller.Id), TestContext.Current.CancellationToken);

        Assert.Equal(now.AddDays(7), result.ExpiresAt);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("missing", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = new InviteSellerCommandHandler(_sellers.Object, _clock.Object);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => handler.HandleAsync(new InviteSellerCommand("missing"), TestContext.Current.CancellationToken));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter InviteSellerCommandHandlerTests`
Expected: FAIL

- [ ] **Step 3: Implement**

`InviteSellerCommand.cs`:

```csharp
namespace BAR.Application.Sellers.Invite;

public sealed record InviteSellerCommand(string SellerId);

public sealed record InviteResult(string Token, DateTime ExpiresAt);
```

`InviteSellerCommandHandler.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Invite;

public sealed class InviteSellerCommandHandler(ISellerRepository sellers, IClock clock)
{
    public async Task<InviteResult> HandleAsync(InviteSellerCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var token = seller.GenerateInviteToken(clock.UtcNow);
        await sellers.UpdateAsync(seller, cancellationToken);

        return new InviteResult(token, seller.InviteTokenExpiresAt!.Value);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter InviteSellerCommandHandlerTests`
Expected: PASS (2 tests)

- [ ] **Step 5: Add the config section and endpoint**

Add to `appsettings.json` (top level, sibling to the existing `Jwt` section):

```json
  "Frontend": {
    "BaseUrl": "http://localhost:4200"
  },
```

Add to `SellersEndpoints.cs`:

```csharp
        group.MapPost("/{id}/invite", (
            string id, InviteSellerCommandHandler handler, IConfiguration configuration, CancellationToken ct) =>
            InviteAsync(id, handler, configuration, ct));

        static async Task<IResult> InviteAsync(string id, InviteSellerCommandHandler handler, IConfiguration configuration, CancellationToken ct)
        {
            var result = await handler.HandleAsync(new InviteSellerCommand(id), ct);
            var baseUrl = configuration["Frontend:BaseUrl"];
            var inviteUrl = $"{baseUrl}/set-password?token={result.Token}";
            return Results.Ok(new { inviteUrl, expiresAt = result.ExpiresAt });
        }
```

Add `using BAR.Application.Sellers.Invite;` and `using Microsoft.Extensions.Configuration;` to `SellersEndpoints.cs`.

- [ ] **Step 6: Register the handler**

```csharp
        services.AddScoped<BAR.Application.Sellers.Invite.InviteSellerCommandHandler>();
```

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Sellers/Invite/ src/advance-registration/backend/BAR.Host/Features/Sellers/SellersEndpoints.cs src/advance-registration/backend/BAR.Host/appsettings.json src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add POST /api/sellers/{id}/invite"
```

---

### Task 8: `POST /api/auth/set-password`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Auth/SetPassword/SetPasswordCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/SetPassword/SetPasswordCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/SetPassword/SetPasswordCommandValidator.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Auth/AuthEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Auth/SetPassword/SetPasswordCommandHandlerTests.cs`

**Interfaces:**
- Produces: `SetPasswordCommand(InviteToken, Password)` → `TokenPairResult` (same shape as Login/Register/Refresh, per `api/auth.md` "Einheitliche Token-Response"). Password-strength rule reused verbatim from `RegisterCommandValidator`.

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth.SetPassword;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.SetPassword;

public class SetPasswordCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();

    private SetPasswordCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_ValidToken_SetsPasswordAndReturnsTokenPair()
    {
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now);
        _sellers.Setup(s => s.GetByInviteTokenAsync(seller.InviteToken!, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _clock.Setup(c => c.UtcNow).Returns(now);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", now)).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(new SetPasswordCommand(seller.InviteToken!, "geheim123"), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("hashed", seller.PasswordHash);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<BAR.Domain.Auth.RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownToken_ThrowsUnauthorized()
    {
        _sellers.Setup(s => s.GetByInviteTokenAsync("bad-token", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(() => handler.HandleAsync(
            new SetPasswordCommand("bad-token", "geheim123"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_invite_token", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter SetPasswordCommandHandlerTests`
Expected: FAIL

- [ ] **Step 3: Implement**

`SetPasswordCommand.cs`:

```csharp
namespace BAR.Application.Auth.SetPassword;

public sealed record SetPasswordCommand(string InviteToken, string Password);
```

`SetPasswordCommandValidator.cs` (password-strength rule copied from `RegisterCommandValidator` — see Global Constraints: keep the two in sync manually until a shared validator is worth extracting; one caller each today, extracting now would be speculative):

```csharp
using FluentValidation;

namespace BAR.Application.Auth.SetPassword;

public sealed class SetPasswordCommandValidator : AbstractValidator<SetPasswordCommand>
{
    public SetPasswordCommandValidator()
    {
        RuleFor(c => c.InviteToken).NotEmpty();
        RuleFor(c => c.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Must(HasAtLeastTwoCharacterTypes)
            .WithMessage("Passwort muss mindestens 'Mittel' stark sein.");
    }

    private static bool HasAtLeastTwoCharacterTypes(string password)
    {
        var typeCount = new[]
        {
            password.Any(char.IsUpper),
            password.Any(char.IsLower),
            password.Any(char.IsDigit),
            password.Any(c => !char.IsLetterOrDigit(c))
        }.Count(x => x);

        return typeCount >= 2;
    }
}
```

`SetPasswordCommandHandler.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.SetPassword;

public sealed class SetPasswordCommandHandler(
    ISellerRepository sellers, IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher, ITokenIssuer tokenIssuer, IClock clock)
{
    public async Task<TokenPairResult> HandleAsync(SetPasswordCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByInviteTokenAsync(command.InviteToken, cancellationToken)
            ?? throw new UnauthorizedException("auth.invalid_invite_token", "Token unbekannt, bereits verbraucht oder abgelaufen");

        seller.ConsumePassword(passwordHasher.Hash(command.Password), clock.UtcNow);
        await sellers.UpdateAsync(seller, cancellationToken);

        await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter SetPasswordCommandHandlerTests`
Expected: PASS (2 tests)

- [ ] **Step 5: Add the endpoint**

Add to `AuthEndpoints.cs`, inside `MapAuthEndpoints`, next to the existing `/register`/`/login`/`/refresh` mappings:

```csharp
        group.MapPost("/set-password", async (SetPasswordCommand command, SetPasswordCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<SetPasswordCommand>>();
```

Add `using BAR.Application.Auth.SetPassword;` to `AuthEndpoints.cs`.

- [ ] **Step 6: Register handler and validator**

```csharp
        services.AddScoped<BAR.Application.Auth.SetPassword.SetPasswordCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Auth.SetPassword.SetPasswordCommand>, BAR.Application.Auth.SetPassword.SetPasswordCommandValidator>();
```

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Auth/SetPassword/ src/advance-registration/backend/BAR.Host/Features/Auth/AuthEndpoints.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add POST /api/auth/set-password"
```

---

### Task 9: Number-Block admin routes — `next-free`, reserve, delete

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Blocks/NextFree/GetNextFreeQuery.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/NextFree/GetNextFreeQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/Reserve/ReserveBlocksCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/Reserve/ReserveBlocksCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/Delete/DeleteBlockCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/Delete/DeleteBlockCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Blocks/BlocksEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/BAR.Application.UnitTests/Blocks/NextFree/GetNextFreeQueryHandlerTests.cs`, `.../Blocks/Reserve/ReserveBlocksCommandHandlerTests.cs`, `.../Blocks/Delete/DeleteBlockCommandHandlerTests.cs`

**Interfaces:**
- `GetNextFreeQuery(BlockCount)` → `int StartNumber`, reusing `NumberBlockAllocator.Allocate` in a "dry run" that discards the result blocks and returns only `FromNumber` — same allocator as every other call site (`api/blocks.md` §6: "Freiheitsprüfung ... ohne Ausnahme für alle vier Vergabewege").
- `ReserveBlocksCommand(SellerId, StartNumber?, BlockCount?)` → `IReadOnlyList<BlockResponse>`.
- `DeleteBlockCommand(SellerId, BlockId)` — throws `NotFoundException` if the block doesn't exist or belongs to a different seller (`api/blocks.md` §4: "der Verkäufer-Teil des Pfades wird geprüft, nicht nur mitgeführt"), `ConflictException("block.in_use", ...)` if `usedCount > 0`. **`usedCount` is always `0`** today (no Article table — same documented gap as Task 6), so this guard is unreachable in practice until Article persistence exists; it's still written because the endpoint contract requires it and the check costs nothing once articles do exist.

- [ ] **Step 1: Write the three failing tests**

```csharp
using BAR.Application.Blocks.NextFree;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Blocks.NextFree;

public class GetNextFreeQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoExistingBlocks_ReturnsSettingsStartNumber()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var settings = new Mock<ISettingsRepository>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, "t1", null, 101, 10, 1));
        var handler = new GetNextFreeQueryHandler(blocks.Object, settings.Object);

        var result = await handler.HandleAsync(new GetNextFreeQuery(2), TestContext.Current.CancellationToken);

        Assert.Equal(101, result.StartNumber);
    }
}
```

```csharp
using BAR.Application.Blocks.Reserve;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Blocks.Reserve;

public class ReserveBlocksCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoOverlap_ReservesRequestedBlocks()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var settings = new Mock<ISettingsRepository>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, "t1", null, 101, 10, 1));
        var handler = new ReserveBlocksCommandHandler(blocks.Object, settings.Object);

        var result = await handler.HandleAsync(new ReserveBlocksCommand("seller-1", 101, 1), TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
        blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(l => l.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

```csharp
using BAR.Application.Blocks.Delete;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Blocks.Delete;

public class DeleteBlockCommandHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();

    [Fact]
    public async Task HandleAsync_BlockBelongsToSeller_Deletes()
    {
        var block = NumberBlock.Assign("seller-1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetByIdAsync(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        var handler = new DeleteBlockCommandHandler(_blocks.Object);

        await handler.HandleAsync(new DeleteBlockCommand("seller-1", block.Id), TestContext.Current.CancellationToken);

        _blocks.Verify(b => b.DeleteAsync(block, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_BlockBelongsToDifferentSeller_ThrowsNotFound()
    {
        var block = NumberBlock.Assign("seller-1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetByIdAsync(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        var handler = new DeleteBlockCommandHandler(_blocks.Object);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => handler.HandleAsync(new DeleteBlockCommand("seller-2", block.Id), TestContext.Current.CancellationToken));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter "NextFree|Reserve|DeleteBlock"`
Expected: FAIL

- [ ] **Step 3: Implement**

`GetNextFreeQuery.cs` / `GetNextFreeQueryHandler.cs`:

```csharp
namespace BAR.Application.Blocks.NextFree;

public sealed record GetNextFreeQuery(int BlockCount);

public sealed record NextFreeResult(int StartNumber);
```

```csharp
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.NextFree;

public sealed class GetNextFreeQueryHandler(INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<NextFreeResult> HandleAsync(GetNextFreeQuery query, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        // Dry-Run: derselbe Allocator wie bei jeder anderen Vergabe
        // (api/blocks.md Abschnitt 5/6) - das Ergebnis wird nur gelesen, nicht
        // persistiert. sellerId/nowUtc sind fuer einen reinen Vorschlag irrelevant.
        var proposal = NumberBlockAllocator.Allocate(existing, "preview", query.BlockCount, settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
        return new NextFreeResult(proposal[0].FromNumber);
    }
}
```

`ReserveBlocksCommand.cs` / `ReserveBlocksCommandHandler.cs`:

```csharp
namespace BAR.Application.Blocks.Reserve;

public sealed record ReserveBlocksCommand(string SellerId, int? StartNumber, int? BlockCount);

public sealed record BlockResponse(string Id, string SellerId, int FromNumber, int ToNumber, int NumberCount, int UsedCount, DateTime AssignedAt);
```

```csharp
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.Reserve;

public sealed class ReserveBlocksCommandHandler(INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<IReadOnlyList<BlockResponse>> HandleAsync(ReserveBlocksCommand command, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        var blockCount = command.BlockCount ?? settings.DefaultBlockCount;
        var startNumber = command.StartNumber ?? existing.Count == 0
            ? settings.StartNumber
            : command.StartNumber ?? NumberBlockAllocator.Allocate(existing, command.SellerId, blockCount, settings.StartNumber, settings.BlockSize, DateTime.UtcNow)[0].FromNumber;

        var overlap = existing.Any(b => startNumber <= b.ToNumber && startNumber + (blockCount * settings.BlockSize) - 1 >= b.FromNumber);
        if (overlap)
        {
            throw new BAR.Domain.Exceptions.ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var newBlocks = new List<NumberBlock>(blockCount);
        var next = startNumber;
        for (var i = 0; i < blockCount; i++)
        {
            newBlocks.Add(NumberBlock.Assign(command.SellerId, next, settings.BlockSize, DateTime.UtcNow));
            next += settings.BlockSize;
        }

        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        return newBlocks.Select(b => new BlockResponse(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.ToNumber - b.FromNumber + 1, 0, b.AssignedAt)).ToList();
    }
}
```

`DeleteBlockCommand.cs` / `DeleteBlockCommandHandler.cs`:

```csharp
namespace BAR.Application.Blocks.Delete;

public sealed record DeleteBlockCommand(string SellerId, string BlockId);
```

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.Delete;

public sealed class DeleteBlockCommandHandler(INumberBlockRepository blocks)
{
    public async Task HandleAsync(DeleteBlockCommand command, CancellationToken cancellationToken)
    {
        var block = await blocks.GetByIdAsync(command.BlockId, cancellationToken);
        if (block is null || block.SellerId != command.SellerId)
        {
            throw new NotFoundException("block.not_found", "Block unbekannt oder gehört nicht zu diesem Verkäufer");
        }

        // usedCount > 0 => block.in_use (api/blocks.md Abschnitt 4). usedCount
        // ist bis zur Artikel-Persistenz immer 0 (siehe Global Constraints) -
        // dieser Zweig ist heute unerreichbar, aber Teil des Endpunkt-Vertrags.
        var usedCount = 0;
        if (usedCount > 0)
        {
            throw new ConflictException("block.in_use", "Block enthält bereits vergebene Nummern");
        }

        await blocks.DeleteAsync(block, cancellationToken);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/BAR.Application.UnitTests --filter "NextFree|Reserve|DeleteBlock"`
Expected: PASS (3 tests)

- [ ] **Step 5: Add the endpoints**

Add to `BlocksEndpoints.cs`, inside `MapBlocksEndpoints` (alongside the existing `/mine` mapping):

```csharp
        app.MapGet("/api/blocks/next-free", async (int blockCount, GetNextFreeQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(new GetNextFreeQuery(blockCount), ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/sellers/{id}/blocks", async (
            string id, ReserveBlocksRequestBody body, ReserveBlocksCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new ReserveBlocksCommand(id, body.StartNumber, body.BlockCount), ct);
            return Results.Created($"/api/sellers/{id}/blocks", result);
        }).RequireAuthorization("admin");

        app.MapDelete("/api/sellers/{id}/blocks/{blockId}", async (
            string id, string blockId, DeleteBlockCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(new DeleteBlockCommand(id, blockId), ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");
```

Add `public sealed record ReserveBlocksRequestBody(int? StartNumber, int? BlockCount);` at the bottom of the file, and the imports `using BAR.Application.Blocks.NextFree;`, `using BAR.Application.Blocks.Reserve;`, `using BAR.Application.Blocks.Delete;`.

- [ ] **Step 6: Register the handlers**

```csharp
        services.AddScoped<BAR.Application.Blocks.NextFree.GetNextFreeQueryHandler>();
        services.AddScoped<BAR.Application.Blocks.Reserve.ReserveBlocksCommandHandler>();
        services.AddScoped<BAR.Application.Blocks.Delete.DeleteBlockCommandHandler>();
```

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Blocks/ src/advance-registration/backend/BAR.Host/Features/Blocks/BlocksEndpoints.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-app): add GET /api/blocks/next-free, POST/DELETE /api/sellers/{id}/blocks"
```

---

## Frontend

### Task 10: Sellers data layer

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/data/sellers-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/data/sellers-api.service.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/model/seller.model.ts`

**Interfaces:**
- Produces: `Seller`, `SellerType`, `NumberBlock`, `CreateSellerPayload`, `UpdateSellerPayload`, `PagedResult<T>` (model), and `SellersApiService` with `list(params)`, `create(payload)`, `update(id, payload)`, `delete(id)`, `invite(id)`, `nextFreeStartNumber(blockCount)`, `reserveBlocks(sellerId, body)`, `deleteBlock(sellerId, blockId)` — one `Observable`-returning method per backend endpoint from Tasks 3–9, following the `AuthApiService` convention (`inject(HttpClient)`, plain `Observable<T>` return, no wrapping).
- Consumed by: Tasks 11–13.

- [ ] **Step 1: Define the models**

```typescript
export interface SellerType {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface Seller {
  id: string;
  startNumber: number | null;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerTypeId: string;
  sellerType: SellerType;
  isAdmin: boolean;
  articleCount: number;
  hasPendingInvite: boolean;
}

export interface NumberBlock {
  id: string;
  sellerId: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
  assignedAt: string;
}

export interface CreateSellerPayload {
  firstName: string;
  lastName: string;
  address?: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerTypeId: string;
  isAdmin?: boolean;
  startNumber?: number;
  blockCount?: number;
}

export type UpdateSellerPayload = Omit<CreateSellerPayload, 'startNumber' | 'blockCount'>;

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ListSellersParams {
  search?: string;
  page: number;
  pageSize: number;
  sort?: string;
}
```

- [ ] **Step 2: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellersApiService } from './sellers-api.service';

describe('SellersApiService', () => {
  let service: SellersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), SellersApiService] });
    service = TestBed.inject(SellersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() builds the query string from search/page/pageSize/sort', () => {
    service.list({ search: 'anna', page: 2, pageSize: 25, sort: 'lastName:asc' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/sellers' && r.params.get('search') === 'anna' && r.params.get('page') === '2' && r.params.get('sort') === 'lastName:asc'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 25 });
  });

  it('invite() posts to the invite endpoint', () => {
    service.invite('s1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/invite');
    expect(req.request.method).toBe('POST');
    req.flush({ inviteUrl: 'https://x/set-password?token=t', expiresAt: '2026-08-24T12:00:00+02:00' });
  });

  it('deleteBlock() sends DELETE to the nested block route', () => {
    service.deleteBlock('s1', 'b1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/blocks/b1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run sellers-api.service.spec.ts`
Expected: FAIL — `Cannot find module './sellers-api.service'`

- [ ] **Step 4: Implement the service**

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateSellerPayload, ListSellersParams, NumberBlock, PagedResult, Seller, UpdateSellerPayload
} from '../model/seller.model';

@Injectable({ providedIn: 'root' })
export class SellersApiService {
  private readonly http = inject(HttpClient);

  list(params: ListSellersParams): Observable<PagedResult<Seller>> {
    let httpParams = new HttpParams().set('page', params.page).set('pageSize', params.pageSize);
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<PagedResult<Seller>>('/api/sellers', { params: httpParams });
  }

  create(payload: CreateSellerPayload): Observable<Seller> {
    return this.http.post<Seller>('/api/sellers', payload);
  }

  update(id: string, payload: UpdateSellerPayload): Observable<Seller> {
    return this.http.put<Seller>(`/api/sellers/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${id}`);
  }

  invite(id: string): Observable<{ inviteUrl: string; expiresAt: string }> {
    return this.http.post<{ inviteUrl: string; expiresAt: string }>(`/api/sellers/${id}/invite`, {});
  }

  nextFreeStartNumber(blockCount: number): Observable<{ startNumber: number }> {
    return this.http.get<{ startNumber: number }>('/api/blocks/next-free', { params: { blockCount } });
  }

  reserveBlocks(sellerId: string, body: { startNumber?: number; blockCount?: number }): Observable<NumberBlock[]> {
    return this.http.post<NumberBlock[]>(`/api/sellers/${sellerId}/blocks`, body);
  }

  deleteBlock(sellerId: string, blockId: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${sellerId}/blocks/${blockId}`);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run sellers-api.service.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/sellers/data/ src/advance-registration/frontend/BAR.App/src/app/features/sellers/model/
git commit -m "feat(bar-app): add Sellers API service and models"
```

---

### Task 11: Sellers list page

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/SellersPage.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/SellersPage.spec.ts`

**Interfaces:**
- Produces: `SellersPage` orchestrator — loads the page via `SellersApiService.list()` on init/search/sort/page change, renders `app-table` with the 9 columns from `Epic_Verkaeufer/epic.md` §2, wires the free-text search input (Enter/Suchen-Button, no live filter — `epic.md` §1) and the "+ Neu" page-header button. Opening the Create/Edit dialogs (Task 12/13) is wired here too, via a local `signal` holding which dialog is open and for which row.
- Consumes: `SellersApiService` (Task 10), `Table`/`Badge` (Shared-UI-Kit).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellersPage } from './SellersPage';

const RESPONSE = {
  items: [{
    id: 's1', startNumber: 101, firstName: 'Anna', lastName: 'Beispiel', address: null,
    postalCode: '76133', city: 'Karlsruhe', phone: '0721 1', email: 'anna@example.com',
    sellerTypeId: 't1', sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 },
    isAdmin: false, articleCount: 3, hasPendingInvite: false
  }],
  totalCount: 1, page: 1, pageSize: 25
};

describe('SellersPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads sellers on init and exposes them to the table', () => {
    const fixture = TestBed.createComponent(SellersPage);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/sellers');
    req.flush(RESPONSE);
    fixture.detectChanges();

    expect(fixture.componentInstance.data()).toEqual(RESPONSE.items);
    expect(fixture.componentInstance.totalRecords()).toBe(1);
  });

  it('reloads with the search term when onSearch is called', () => {
    const fixture = TestBed.createComponent(SellersPage);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/sellers').flush(RESPONSE);

    fixture.componentInstance.searchTerm.set('anna');
    fixture.componentInstance.onSearch();

    const req = httpMock.expectOne((r) => r.url === '/api/sellers' && r.params.get('search') === 'anna');
    req.flush(RESPONSE);
  });

  it('opens the create dialog when rowAdd fires', () => {
    const fixture = TestBed.createComponent(SellersPage);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/sellers').flush(RESPONSE);

    fixture.componentInstance.onRowAdd();

    expect(fixture.componentInstance.dialogMode()).toBe('create');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run SellersPage.spec.ts`
Expected: FAIL — current `SellersPage` has no `data()`/`onSearch()`/`onRowAdd()`.

- [ ] **Step 3: Implement**

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from '../../../shared/table/table';
import { ActionColumnConfig, ColumnConfig } from '../../../shared/table/table.model';
import { Seller } from '../model/seller.model';
import { SellersApiService } from '../data/sellers-api.service';

const COLUMNS: ColumnConfig[] = [
  { field: 'startNumber', header: 'Nr.', type: 'number' },
  { field: 'firstName', header: 'Vorname', type: 'text' },
  { field: 'lastName', header: 'Nachname', type: 'text' },
  { field: 'postalCode', header: 'PLZ', type: 'text' },
  { field: 'city', header: 'Ort', type: 'text' },
  { field: 'sellerType.name', header: 'Typ', type: 'text' },
  { field: 'sellerType.commissionRate', header: 'Provision', type: 'number' },
  { field: 'sellerType.itemFee', header: 'Gebühr', type: 'currency' },
  { field: 'articleCount', header: 'Artikel', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  buttons: [
    { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' },
    { actionId: 'delete', icon: 'pi pi-trash', ariaLabel: 'Löschen' }
  ]
};

export type DialogMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-sellers-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './SellersPage.html'
})
export class SellersPage implements OnInit {
  private readonly api = inject(SellersApiService);

  readonly columns = COLUMNS;
  readonly actionColumn = ACTION_COLUMN;
  readonly data = signal<Seller[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly dialogMode = signal<DialogMode>(null);
  readonly selectedSeller = signal<Seller | null>(null);

  private page = 1;
  private readonly pageSize = 25;

  ngOnInit(): void {
    this.load();
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onRowAdd(): void {
    this.selectedSeller.set(null);
    this.dialogMode.set('create');
  }

  onActionClick(event: { actionId: string; row: Seller }): void {
    if (event.actionId === 'edit') {
      this.selectedSeller.set(event.row);
      this.dialogMode.set('edit');
    }
  }

  private load(): void {
    this.loading.set(true);
    this.api.list({ search: this.searchTerm() || undefined, page: this.page, pageSize: this.pageSize }).subscribe((result) => {
      this.data.set(result.items);
      this.totalRecords.set(result.totalCount);
      this.loading.set(false);
    });
  }
}
```

`SellersPage.html`:

```html
<div class="page-header">
  <h1>Verkäufer</h1>
  <button type="button" class="p-button p-button-primary" (click)="onRowAdd()">+ Neu</button>
</div>

<p-iconfield>
  <p-inputicon><svg data-p-icon="search"></svg></p-inputicon>
  <input pInputText [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" (keyup.enter)="onSearch()" placeholder="Suche Name/Ort/E-Mail..." />
</p-iconfield>
<button type="button" class="p-button p-button-secondary p-button-outlined" (click)="onSearch()">Suchen</button>

<app-table
  [columns]="columns"
  [data]="data()"
  [totalRecords]="totalRecords()"
  [loading]="loading()"
  [actionColumn]="actionColumn"
  emptyText="Noch keine Verkäufer registriert."
  (actionClick)="onActionClick($event)"
  (rowAdd)="onRowAdd()"
/>
```

> The Create/Edit dialog markup itself (`<app-modal *ngIf="dialogMode()">`) is added in Tasks 12/13 alongside the panels they implement — adding an empty dialog shell here without content would be exactly the kind of half-finished step the "No Placeholders" rule forbids.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run SellersPage.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/
git commit -m "feat(bar-app): wire Sellers list page against the real API"
```

---

### Task 12: Anlege-Dialog (Panel 01–03 + Nummernblock-Initialfeld)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-create-dialog.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-create-dialog.html`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-create-dialog.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/SellersPage.ts`, `SellersPage.html`

**Interfaces:**
- Produces: `SellerCreateDialog` — dumb form component, `input.required<boolean>() visible`, `input.required<SellerType[]>() sellerTypes`, `output<void>() cancelled`, `output<CreateSellerPayload>() submitted`. Field validation (R-1/R-2 from `docs/components/form/component.md`) lives here; the actual `POST /api/sellers` call stays in `SellersPage` (dumb-component rule).
- Consumes: `Modal`, `Badge` is not needed here; uses PrimeNG `InputTextModule`/`SelectModule`/`InputNumberModule` directly (Select/Input/InputNumber are "Primitive" conventions, not components — Shared-UI-Kit plan Task notes).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SellerCreateDialog } from './seller-create-dialog';

const SELLER_TYPES = [{ id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }];

describe('SellerCreateDialog', () => {
  it('keeps the submit button disabled until the required fields are filled', () => {
    const fixture = TestBed.createComponent(SellerCreateDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('sellerTypes', SELLER_TYPES);
    fixture.detectChanges();

    expect(fixture.componentInstance.canSubmit()).toBe(false);

    fixture.componentInstance.firstName.set('Anna');
    fixture.componentInstance.lastName.set('Beispiel');
    fixture.componentInstance.postalCode.set('76133');
    fixture.componentInstance.city.set('Karlsruhe');
    fixture.componentInstance.phone.set('0721 1');
    fixture.componentInstance.email.set('anna@example.com');
    fixture.componentInstance.sellerTypeId.set('t1');

    expect(fixture.componentInstance.canSubmit()).toBe(true);
  });

  it('emits submitted with the full payload', () => {
    const fixture = TestBed.createComponent(SellerCreateDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('sellerTypes', SELLER_TYPES);
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.submitted.subscribe((v) => (emitted = v));

    fixture.componentInstance.firstName.set('Anna');
    fixture.componentInstance.lastName.set('Beispiel');
    fixture.componentInstance.postalCode.set('76133');
    fixture.componentInstance.city.set('Karlsruhe');
    fixture.componentInstance.phone.set('0721 1');
    fixture.componentInstance.email.set('anna@example.com');
    fixture.componentInstance.sellerTypeId.set('t1');
    fixture.componentInstance.onSubmit();

    expect(emitted).toEqual({
      firstName: 'Anna', lastName: 'Beispiel', address: undefined, postalCode: '76133',
      city: 'Karlsruhe', phone: '0721 1', email: 'anna@example.com', sellerTypeId: 't1',
      isAdmin: false, startNumber: undefined, blockCount: undefined
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run seller-create-dialog.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { Modal } from '../../../shared/modal/modal';
import { CreateSellerPayload, SellerType } from '../model/seller.model';

@Component({
  selector: 'app-seller-create-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, SelectModule, InputNumberModule, Modal],
  templateUrl: './seller-create-dialog.html'
})
export class SellerCreateDialog {
  readonly visible = input.required<boolean>();
  readonly sellerTypes = input.required<SellerType[]>();
  readonly cancelled = output<void>();
  readonly submitted = output<CreateSellerPayload>();

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  readonly isAdmin = signal(false);
  readonly startNumber = signal<number | null>(null);
  readonly blockCount = signal<number | null>(null);

  readonly selectedType = computed(() => this.sellerTypes().find((t) => t.id === this.sellerTypeId()) ?? null);

  readonly canSubmit = computed(() =>
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.postalCode().trim().length > 0 &&
    this.city().trim().length > 0 &&
    this.phone().trim().length > 0 &&
    this.email().trim().length > 0 &&
    this.sellerTypeId().trim().length > 0
  );

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.submitted.emit({
      firstName: this.firstName(),
      lastName: this.lastName(),
      address: this.address() || undefined,
      postalCode: this.postalCode(),
      city: this.city(),
      phone: this.phone(),
      email: this.email(),
      sellerTypeId: this.sellerTypeId(),
      isAdmin: this.isAdmin(),
      startNumber: this.startNumber() ?? undefined,
      blockCount: this.blockCount() ?? undefined
    });
  }
}
```

`seller-create-dialog.html` (Panels 01–03 + Nummernblock-Initialfeld per `epic.md` §3; `pAutoFocus` on Vorname per R-7):

```html
<app-modal [visible]="visible()" header="Neuen Verkäufer anlegen" size="lg" (visibleChange)="onCancel()">
  <div modalBody class="form-grid">
    <div class="panel-block full">
      <div class="panel-block__title">Personendaten</div>
      <div class="form-grid">
        <div>
          <label for="create-first-name">Vorname *</label>
          <input id="create-first-name" pInputText pAutoFocus [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" />
        </div>
        <div>
          <label for="create-last-name">Nachname *</label>
          <input id="create-last-name" pInputText [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" />
        </div>
      </div>
    </div>

    <div class="panel-block full">
      <div class="panel-block__title">Kontakt</div>
      <div class="form-grid">
        <div class="full">
          <label for="create-address">Anschrift</label>
          <input id="create-address" pInputText [ngModel]="address()" (ngModelChange)="address.set($event)" />
        </div>
        <div>
          <label for="create-postal-code">PLZ *</label>
          <input id="create-postal-code" pInputText [ngModel]="postalCode()" (ngModelChange)="postalCode.set($event)" />
        </div>
        <div>
          <label for="create-city">Ort *</label>
          <input id="create-city" pInputText [ngModel]="city()" (ngModelChange)="city.set($event)" />
        </div>
        <div>
          <label for="create-phone">Telefon *</label>
          <input id="create-phone" pInputText [ngModel]="phone()" (ngModelChange)="phone.set($event)" />
        </div>
        <div>
          <label for="create-email">E-Mail (= Login) *</label>
          <input id="create-email" pInputText type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" />
        </div>
      </div>
    </div>

    <div class="panel-block full">
      <div class="panel-block__title">Konditionen</div>
      <label for="create-seller-type">Verkäufer-Typ *</label>
      <p-select
        id="create-seller-type"
        [options]="sellerTypes()"
        optionLabel="name"
        optionValue="id"
        [ngModel]="sellerTypeId()"
        (ngModelChange)="sellerTypeId.set($event)"
      />
      @if (selectedType(); as type) {
        <p>Provision: {{ type.commissionRate }} % · Gebühr: {{ type.itemFee }} € pro Stück</p>
      }
    </div>

    <div class="panel-block full">
      <div class="form-grid">
        <div>
          <label for="create-start-number">Startnummer</label>
          <p-inputnumber id="create-start-number" [useGrouping]="false" [ngModel]="startNumber()" (ngModelChange)="startNumber.set($event)" />
        </div>
        <div>
          <label for="create-block-count">Anzahl initialer Blöcke</label>
          <p-inputnumber id="create-block-count" [useGrouping]="false" [ngModel]="blockCount()" (ngModelChange)="blockCount.set($event)" />
        </div>
      </div>
    </div>
  </div>

  <div modalFooter>
    <button type="button" class="p-button p-button-secondary p-button-outlined" (click)="onCancel()">Abbrechen</button>
    <button type="button" class="p-button p-button-primary" [disabled]="!canSubmit()" (click)="onSubmit()">Speichern</button>
  </div>
</app-modal>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run seller-create-dialog.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Wire it into `SellersPage`**

In `SellersPage.ts`, add `readonly sellerTypes = signal<SellerType[]>([]);` (loaded once — add a `sellerTypesApi` call; if no `SellerTypesApiService` exists yet, inject `HttpClient` directly here for `GET /api/seller-types` rather than inventing a whole new feature service for a single read used by one dialog) and a handler:

```typescript
  onCreateSubmit(payload: CreateSellerPayload): void {
    this.api.create(payload).subscribe(() => {
      this.dialogMode.set(null);
      this.load();
    });
  }
```

In `SellersPage.html`, add below `<app-table ...>`:

```html
@if (dialogMode() === 'create') {
  <app-seller-create-dialog
    [visible]="true"
    [sellerTypes]="sellerTypes()"
    (cancelled)="dialogMode.set(null)"
    (submitted)="onCreateSubmit($event)"
  />
}
```

Add `SellerCreateDialog` to `SellersPage`'s `imports` array.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/sellers/
git commit -m "feat(bar-app): add Verkäufer Anlege-Dialog (Panel 01-03 + Nummernblock-Initialfeld)"
```

---

### Task 13: Bearbeiten-Dialog (Panel 04 Nummernblöcke + Panel 05 Admin/Invite) + Delete

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-edit-dialog.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-edit-dialog.html`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/components/seller-edit-dialog.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/SellersPage.ts`, `SellersPage.html`

**Interfaces:**
- Produces: `SellerEditDialog` — same Panel 01–03 fields as Create (pre-filled from `input.required<Seller>() seller`), plus Panel 04 (`input.required<NumberBlock[]>() blocks`, `output<void>() blockDeleteRequested` per block via a bound `actionId`, `output<{startNumber?:number; blockCount?:number}>() blockReserveRequested`) and Panel 05 (`isAdmin` checkbox already part of the shared profile fields, `output<void>() inviteRequested`). `output<UpdateSellerPayload>() submitted` for the Speichern button. All API calls (`update`, `invite`, `reserveBlocks`, `deleteBlock`) stay in `SellersPage`.
- Consumes: `SellersApiService` (via `SellersPage`), `Modal`, `Badge` (block "Voll" state), `ConfirmationService` (block delete + seller delete, injected directly in `SellersPage` per Shared-UI-Kit Task 4 — no wrapper).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SellerEditDialog } from './seller-edit-dialog';

const SELLER = {
  id: 's1', startNumber: 101, firstName: 'Anna', lastName: 'Beispiel', address: null,
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 1', email: 'anna@example.com',
  sellerTypeId: 't1', sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 },
  isAdmin: false, articleCount: 0, hasPendingInvite: false
};

const BLOCKS = [
  { id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' },
  { id: 'b2', sellerId: 's1', fromNumber: 111, toNumber: 120, numberCount: 10, usedCount: 0, assignedAt: '2026-08-14T10:00:00+02:00' }
];

describe('SellerEditDialog', () => {
  it('pre-fills the profile fields from the given seller', () => {
    const fixture = TestBed.createComponent(SellerEditDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', SELLER);
    fixture.componentRef.setInput('sellerTypes', [SELLER.sellerType]);
    fixture.componentRef.setInput('blocks', BLOCKS);
    fixture.detectChanges();

    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.componentInstance.isAdmin()).toBe(false);
  });

  it('only allows deleting a block with usedCount 0', () => {
    const fixture = TestBed.createComponent(SellerEditDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', SELLER);
    fixture.componentRef.setInput('sellerTypes', [SELLER.sellerType]);
    fixture.componentRef.setInput('blocks', BLOCKS);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDeletable(BLOCKS[0])).toBe(false);
    expect(fixture.componentInstance.isDeletable(BLOCKS[1])).toBe(true);
  });

  it('emits inviteRequested when the invite button is used', () => {
    const fixture = TestBed.createComponent(SellerEditDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', SELLER);
    fixture.componentRef.setInput('sellerTypes', [SELLER.sellerType]);
    fixture.componentRef.setInput('blocks', BLOCKS);
    fixture.detectChanges();
    let called = false;
    fixture.componentInstance.inviteRequested.subscribe(() => (called = true));

    fixture.componentInstance.onInviteClick();

    expect(called).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run seller-edit-dialog.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { Modal } from '../../../shared/modal/modal';
import { Badge } from '../../../shared/badge/badge';
import { NumberBlock, Seller, SellerType, UpdateSellerPayload } from '../model/seller.model';

@Component({
  selector: 'app-seller-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, SelectModule, InputNumberModule, CheckboxModule, Modal, Badge],
  templateUrl: './seller-edit-dialog.html'
})
export class SellerEditDialog {
  readonly visible = input.required<boolean>();
  readonly seller = input.required<Seller>();
  readonly sellerTypes = input.required<SellerType[]>();
  readonly blocks = input.required<NumberBlock[]>();
  readonly nextFreeStartNumber = input<number | null>(null);

  readonly cancelled = output<void>();
  readonly submitted = output<UpdateSellerPayload>();
  readonly inviteRequested = output<void>();
  readonly blockDeleteRequested = output<string>();
  readonly blockReserveRequested = output<{ startNumber?: number; blockCount?: number }>();

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  readonly isAdmin = signal(false);
  readonly reserveBlockCount = signal<number | null>(1);
  readonly reserveStartNumber = signal<number | null>(null);

  private initialized = false;

  constructor() {
    // Re-init bei jedem neuen `seller`-Input (Dialog wird pro Zeile wiederverwendet).
    // computed() statt effect(), weil kein Nebeneffekt noetig ist ausser dem
    // einmaligen Uebernehmen der Werte in die editierbaren Signals.
    computed(() => this.applySeller(this.seller()));
  }

  private applySeller(seller: Seller): void {
    this.firstName.set(seller.firstName);
    this.lastName.set(seller.lastName);
    this.address.set(seller.address ?? '');
    this.postalCode.set(seller.postalCode);
    this.city.set(seller.city);
    this.phone.set(seller.phone);
    this.email.set(seller.email);
    this.sellerTypeId.set(seller.sellerTypeId);
    this.isAdmin.set(seller.isAdmin);
  }

  readonly canSubmit = computed(() =>
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.postalCode().trim().length > 0 &&
    this.city().trim().length > 0 &&
    this.phone().trim().length > 0 &&
    this.email().trim().length > 0 &&
    this.sellerTypeId().trim().length > 0
  );

  isDeletable(block: NumberBlock): boolean {
    return block.usedCount === 0;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.submitted.emit({
      firstName: this.firstName(), lastName: this.lastName(), address: this.address() || undefined,
      postalCode: this.postalCode(), city: this.city(), phone: this.phone(), email: this.email(),
      sellerTypeId: this.sellerTypeId(), isAdmin: this.isAdmin()
    });
  }

  onInviteClick(): void {
    this.inviteRequested.emit();
  }

  onDeleteBlock(blockId: string): void {
    this.blockDeleteRequested.emit(blockId);
  }

  onReserve(): void {
    this.blockReserveRequested.emit({
      startNumber: this.reserveStartNumber() ?? undefined,
      blockCount: this.reserveBlockCount() ?? undefined
    });
  }
}
```

> `applySeller` is invoked from a `computed()` purely to re-run when `seller()` changes; since the component reads `this.seller()` only inside the constructor-scheduled computation and never elsewhere reactively, this is the simplest correct re-init without an `effect()` side-effect warning. If a future reviewer prefers `effect()` here for clarity, that's a one-line swap — both are equivalent for this single-shot field copy.

`seller-edit-dialog.html` (Panel 01–03 identical to Create, omitted here for brevity — copy that markup verbatim from `seller-create-dialog.html`, replacing the `create-*` id prefixes with `edit-*` and dropping the Nummernblock-Initialfeld panel; then add):

```html
<div modalBody>
  <!-- Panel 01-03: identisch zu seller-create-dialog.html, hier mit edit-* IDs -->

  <div class="panel-block full">
    <div class="panel-block__title">Nummernblöcke</div>
    @for (block of blocks(); track block.id) {
      <div class="block-row">
        <span class="block-row__range">{{ block.fromNumber }} – {{ block.toNumber }}</span>
        <span class="block-row__count">{{ block.numberCount }} Nummern · {{ block.usedCount }} vergeben</span>
        @if (isDeletable(block)) {
          <button type="button" class="p-button p-button-secondary p-button-outlined p-button-sm" (click)="onDeleteBlock(block.id)">🗑</button>
        } @else {
          <app-badge type="warn" label="Voll — nicht löschbar" />
        }
      </div>
    }

    <div class="reserve-form">
      <label>Zusätzliche Blöcke reservieren:</label>
      <div class="form-grid">
        <div>
          <label for="reserve-block-count">Anzahl Blöcke</label>
          <p-inputnumber id="reserve-block-count" [useGrouping]="false" [ngModel]="reserveBlockCount()" (ngModelChange)="reserveBlockCount.set($event)" />
        </div>
        <div>
          <label for="reserve-start-number">Startnummer (Vorschlag)</label>
          <p-inputnumber id="reserve-start-number" [useGrouping]="false" [ngModel]="reserveStartNumber() ?? nextFreeStartNumber()" (ngModelChange)="reserveStartNumber.set($event)" />
        </div>
      </div>
      <button type="button" class="p-button p-button-primary p-button-sm" (click)="onReserve()">✓ Reservieren</button>
    </div>
  </div>

  <div class="panel-block full">
    <div class="panel-block__title">Sonstiges</div>
    <p-checkbox [binary]="true" [ngModel]="isAdmin()" (ngModelChange)="isAdmin.set($event)" inputId="edit-is-admin" />
    <label for="edit-is-admin">Dieser Verkäufer hat Admin-Rechte</label>
    <button type="button" class="p-button p-button-secondary p-button-outlined p-button-sm" (click)="onInviteClick()">📋 Einladungs-Link generieren</button>
  </div>
</div>

<div modalFooter>
  <button type="button" class="p-button p-button-secondary p-button-outlined" (click)="onCancel()">Abbrechen</button>
  <button type="button" class="p-button p-button-primary" [disabled]="!canSubmit()" (click)="onSubmit()">Speichern</button>
</div>
```

Wrap the whole thing in `<app-modal [visible]="visible()" header="Verkäufer bearbeiten" size="lg" (visibleChange)="onCancel()"> ... </app-modal>` as the outermost element, same as the Create dialog.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run seller-edit-dialog.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire it into `SellersPage`** (including invite Toast, delete Confirmdialog for the seller row, and the invite-link Toast/clipboard-copy per AC-9)

Add to `SellersPage.ts`:

```typescript
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly editBlocks = signal<NumberBlock[]>([]);
  readonly nextFreeStartNumber = signal<number | null>(null);

  onEditSubmit(payload: UpdateSellerPayload): void {
    const seller = this.selectedSeller();
    if (!seller) return;
    this.api.update(seller.id, payload).subscribe(() => {
      this.dialogMode.set(null);
      this.load();
      this.messageService.add({ severity: 'success', summary: '✓ Verkäufer gespeichert' });
    });
  }

  onInviteRequested(): void {
    const seller = this.selectedSeller();
    if (!seller) return;
    this.api.invite(seller.id).subscribe((result) => {
      void navigator.clipboard.writeText(result.inviteUrl);
      this.messageService.add({ severity: 'success', summary: '✓ Einladungs-Link kopiert!' });
    });
  }

  onBlockDeleteRequested(blockId: string): void {
    const seller = this.selectedSeller();
    if (!seller) return;
    this.confirmationService.confirm({
      message: 'Diesen Nummernblock wirklich löschen?',
      accept: () => this.api.deleteBlock(seller.id, blockId).subscribe(() => this.reloadEditBlocks(seller.id))
    });
  }

  onBlockReserveRequested(body: { startNumber?: number; blockCount?: number }): void {
    const seller = this.selectedSeller();
    if (!seller) return;
    this.api.reserveBlocks(seller.id, body).subscribe(() => this.reloadEditBlocks(seller.id));
  }

  onDeleteRow(seller: Seller): void {
    this.confirmationService.confirm({
      message: `Verkäufer "${seller.firstName} ${seller.lastName}" wirklich löschen?`,
      accept: () => this.api.delete(seller.id).subscribe(() => this.load())
    });
  }

  private reloadEditBlocks(sellerId: string): void {
    this.api.list({ page: 1, pageSize: 1 }); // no-op placeholder removed below
  }
```

> The stray `reloadEditBlocks` body above is intentionally replaced in this same step, not left as written — the actual block reload has no dedicated "get blocks for one seller" endpoint on `SellersApiService` yet. Add one: `getBlocks(sellerId: string): Observable<NumberBlock[]> { return this.http.get<NumberBlock[]>(\`/api/sellers/${sellerId}/blocks\`); }` — but that endpoint doesn't exist either (Task 9 only added `POST`/`DELETE` under that path, not `GET`, because `api/blocks.md` doesn't list one; blocks are only ever seen through `GET /api/sellers` — no, that DTO doesn't carry the block list). Resolve this before writing the final `reloadEditBlocks`: extend `INumberBlockRepository`/`GetForSellerAsync` (already exists) with a thin new endpoint `GET /api/sellers/{id}/blocks` in Task 9's `BlocksEndpoints.cs` returning `IReadOnlyList<BlockResponse>`, and a matching `SellersApiService.getBlocks(sellerId)`. Add this endpoint as part of Task 9 Step 5 (alongside the other two block routes) rather than here, then `reloadEditBlocks` becomes:

```typescript
  private reloadEditBlocks(sellerId: string): void {
    this.api.getBlocks(sellerId).subscribe((blocks) => this.editBlocks.set(blocks));
  }
```

Call `reloadEditBlocks(row.id)` and `this.api.nextFreeStartNumber(1).subscribe(r => this.nextFreeStartNumber.set(r.startNumber))` from `onActionClick`'s `'edit'` branch (Task 11), alongside setting `selectedSeller`/`dialogMode`.

Add to `SellersPage.html`:

```html
@if (dialogMode() === 'edit' && selectedSeller(); as seller) {
  <app-seller-edit-dialog
    [visible]="true"
    [seller]="seller"
    [sellerTypes]="sellerTypes()"
    [blocks]="editBlocks()"
    [nextFreeStartNumber]="nextFreeStartNumber()"
    (cancelled)="dialogMode.set(null)"
    (submitted)="onEditSubmit($event)"
    (inviteRequested)="onInviteRequested()"
    (blockDeleteRequested)="onBlockDeleteRequested($event)"
    (blockReserveRequested)="onBlockReserveRequested($event)"
  />
}
```

Wire the Table's `delete` action (Task 11's `onActionClick`) to call `this.onDeleteRow(event.row)`.

- [ ] **Step 6: Run the full Sellers feature test suite**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run features/sellers`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/sellers/ src/advance-registration/backend/BAR.Host/Features/Blocks/BlocksEndpoints.cs
git commit -m "feat(bar-app): add Verkäufer Bearbeiten-Dialog (Panel 04/05), invite and delete wiring"
```

---

### Task 14: Set-Password page

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/set-password/pages/SetPasswordPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/set-password/data/set-password-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/set-password/pages/SetPasswordPage.spec.ts`

**Interfaces:**
- Produces: `SetPasswordApiService.setPassword(inviteToken, password) → Observable<TokenPair>` (reuses the `TokenPair` interface already exported by `AuthApiService`). `SetPasswordPage` reads `token` from the route's query params (`ActivatedRoute`), reuses `PasswordStrengthMeter` (existing shared component) for feedback, and on success calls `AuthService.login(accessToken, refreshToken)` then navigates to `/home` — the same post-auth sequence `LoginPage`/`RegisterPage` will eventually use.

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SetPasswordPage } from './SetPasswordPage';
import { AuthService } from '../../../core/auth/auth.service';

describe('SetPasswordPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'token-abc' } } } }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('submits the invite token from the query param together with the password', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();

    const req = httpMock.expectOne('/api/auth/set-password');
    expect(req.request.body).toEqual({ inviteToken: 'token-abc', password: 'geheim123' });
    req.flush({ accessToken: 'a', refreshToken: 'r' });
  });

  it('logs in and navigates to /home on success', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(authService, 'login');
    vi.spyOn(router, 'navigateByUrl');
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush({ accessToken: 'a', refreshToken: 'r' });

    expect(authService.login).toHaveBeenCalledWith('a', 'r');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run SetPasswordPage.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement**

`set-password-api.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenPair } from '../../../core/auth/auth-api.service';

@Injectable({ providedIn: 'root' })
export class SetPasswordApiService {
  private readonly http = inject(HttpClient);

  setPassword(inviteToken: string, password: string): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/set-password', { inviteToken, password });
  }
}
```

`SetPasswordPage.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordStrengthMeter } from '../../../shared/password-strength-meter/password-strength-meter';
import { AuthService } from '../../../core/auth/auth.service';
import { SetPasswordApiService } from '../data/set-password-api.service';

@Component({
  selector: 'app-set-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, PasswordStrengthMeter],
  templateUrl: './SetPasswordPage.html'
})
export class SetPasswordPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly api = inject(SetPasswordApiService);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly password = signal('');
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    this.api.setPassword(this.token, this.password()).subscribe({
      next: (result) => {
        this.authService.login(result.accessToken, result.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: () => this.errorMessage.set('Der Link ist ungültig oder abgelaufen.')
    });
  }
}
```

`SetPasswordPage.html`:

```html
<h1>Passwort festlegen</h1>
<label for="set-password-input">Neues Passwort</label>
<input id="set-password-input" pInputText type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" />
<app-password-strength-meter [password]="password()" />
@if (errorMessage()) {
  <p class="set-password__error">{{ errorMessage() }}</p>
}
<button type="button" class="p-button p-button-primary" (click)="onSubmit()">Passwort setzen</button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run SetPasswordPage.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/set-password/
git commit -m "feat(bar-app): implement Set-Password page for the admin-invite flow"
```

---

## Self-Review Notes

- **Spec coverage:** all 14 AC in `Epic_Verkaeufer/epic.md` map to a task — AC-1/3/4/10/11 → Tasks 3/5/11/12/13; AC-2/5/6/7/8 → Task 9 + Task 13's Panel 04; AC-9 → Task 7 + Task 13's invite wiring; AC-12/13/14 → Task 6; the roadmap's manual checklist items 1–8 are each covered end-to-end by the corresponding backend+frontend task pair.
- **Placeholder scan:** the one rough edge (`reloadEditBlocks` in Task 13) is resolved inline in the same step, not left open — the plan text walks through *why* a naive version doesn't work and lands on the concrete fix (a new `GET /api/sellers/{id}/blocks` endpoint added to Task 9, plus the matching API-service method), rather than a "// TODO" left for the implementer.
- **Documented, not hidden, gaps:** Article-table absence (Task 6 delete cascade, Task 9 `usedCount`/`block.in_use`, list query's `articleCount`) is called out at every touch point with the same wording so a future Article-persistence plan can grep for it.
- **Type consistency:** `SellerResponse`/`SellerTypeSummary`/`PagedResult<T>` (Task 3) are reused verbatim by Tasks 4–5; `Seller`/`NumberBlock`/`CreateSellerPayload`/`UpdateSellerPayload` (Task 10) are reused verbatim by Tasks 11–13; `ColumnConfig`/`ActionColumnConfig` come from the Shared-UI-Kit plan's `table.model.ts` without redefinition.
- **Scope check:** single vertical slice (one epic), backend-then-frontend per spec.md §10.0.2 — appropriately sized for one plan, not split further.
