# R01 Zugang Implementation Plan

> **For agentic workers:** implement this plan task-by-task, one task at a time, with a review between tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verkäufer können sich selbst registrieren, Verkäufer und Admin können sich anmelden, die Sitzung übersteht Reload, Logout beendet sie sauber.

**Architecture:** .NET 10 Minimal API, hexagonal in `BAR.Domain`/`BAR.Application`/`BAR.Infrastructure`/`BAR.Host`, PostgreSQL via EF Core. Angular-Frontend mit Feature-First-Struktur, PrimeNG, bestehende Auth-Infrastruktur aus R00 (`TokenStore`, `AuthService`, Guards, Interceptor) wird erstmals real genutzt.

**Tech Stack:** .NET 10, EF Core 10 + Npgsql, FluentValidation 12, Microsoft.AspNetCore.Authentication.JwtBearer 10, BCrypt.Net-Next, xUnit v3 + Testcontainers.PostgreSql, NetArchTest; Angular 22 + PrimeNG 22 + Vitest 4.

**Spec:** [`docs/superpowers/specs/2026-09-09-r01-zugang-design.md`](../../superpowers/specs/2026-09-09-r01-zugang-design.md) — executors read both.

## Global Constraints

- Feldnamen im Contract englisch, Doku-Prosa deutsch (`spec.md` §10.0.1).
- Kein natives HTML für UI-Elemente — ausschließlich PrimeNG (`docs/components/overview.md` Grundregel).
- IDs: string, 8 Zeichen, backend-generiert über `BAR.Domain.Common.EntityId.New()` — Ausnahme `settings.id` (fixer Wert `"settings"`).
- Fehler-Responses: RFC 9457 `ProblemDetails` mit Extension-Member `errorCode`, erzeugt an genau einem Ort — dem globalen `IExceptionHandler` in `BAR.Host` (`api/cross-cutting.md` Abschnitt 3).
- Validierungsfehler (400) über FluentValidation, fachliche Konflikte (409/401/403) über `DomainException`-Subtypen aus der Domäne/den Handlern.
- Repository-Ports leben in `BAR.Domain/Ports/`, Interface-Namen enden auf `Repository` (Architektur-Test `RepositoryPorts_Always_LiveInDomainPorts`).
- `BAR.Domain` referenziert nichts (kein EF, kein AspNetCore, kein System.Text.Json). `BAR.Application` referenziert nur `BAR.Domain`. `BAR.Infrastructure` implementiert `BAR.Application/Abstractions`-Interfaces und `BAR.Domain/Ports`-Interfaces.
- Zeitquelle ausschließlich über `IClock.UtcNow` (UTC, kein `DateTime.Now`).
- Secrets ausschließlich aus Environment-Variablen/User Secrets — kein Hardcode außer expliziten Dev-Defaults in `appsettings.Development.json`.
- Alle Formulare/Komponenten sind Dumb Components: keine eigene Datenbeschaffung, Ein-/Ausgabe nur über `@Input()`/`@Output()`.

## Decisions taken at planning

| Decision | Chosen | Why the spec did not settle it |
|---|---|---|
| Passwort-Hash-Implementierung | `BCrypt.Net-Next` (NuGet), Work-Factor 12 | Spec/Entity-Doku lassen „bcrypt oder Argon2" offen als Implementierungsdetail |
| JWT-Claim-Mapping | `JwtBearerOptions.MapInboundClaims = false`, Issuer schreibt literal `sub`/`role`/`exp` (keine ASP.NET-Standard-URI-Claims) | Frontend-`jwt-decoder.ts` liest `payload['sub']`/`payload['role']` direkt — Kompatibilität ist ein Implementierungsdetail, nicht in der API-Doku spezifiziert |
| Application-Ordnerstruktur | Feature-Ordner pro Use Case (`Auth/Register/`, `Auth/Login/`, …) | `api/cross-cutting.md` erlaubt Feature-Ordner nur in Application/Api, legt aber keine konkrete Unterteilung fest |
| Domain-Ordnerstruktur | Aggregat-Ordner (`Sellers/`, `SellerTypes/`, `Settings/`, `Auth/`, `NumberBlocks/`) statt Feature-Ordner | Cross-Cutting verbietet Feature-Ordner in Domain, sagt aber nichts über die Alternative |
| JWT-Signing-Key (Dev) | Fester 256-Bit-Dev-Key in `appsettings.Development.json`, Produktions-Key ausschließlich über `Jwt__SigningKey`-Env-Var | Secrets-Regel verlangt Env-Var für Prod, sagt nichts über den lokalen Dev-Default |

## Open questions

keine — die einzige offene Frage aus der ersten Fassung (Stammdaten-Pflichtfelder bei der
Registrierung) ist vom Requester am 2026-09-09 beantwortet und in der Spec nachgezogen: sie
gehören ins Register-Formular (Tasks 14, 19, 25, 30 unten sind bereits darauf ausgelegt).

---

### Task 1: Seller-Entity + `ISellerRepository`

**Carries:** `entities/verkaeufer.md` Felder; Grundlage für Login/Register/AC-1/AC-2/AC-8/AC-10.

**Done when:** `Seller.Register(...)` erzeugt ein gültiges Objekt, `Seller.WithPassword(...)` setzt den Hash, ungültige Konstruktion wirft.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs`

**Interfaces:**
- Produces: `Seller.Register(string firstName, string lastName, string? address, string postalCode, string city, string phone, string email, string sellerTypeId, string passwordHash, bool isAdmin = false) : Seller`; Properties `Id, FirstName, LastName, Address, PostalCode, City, Phone, Email, SellerTypeId, IsAdmin, PasswordHash, InviteToken, InviteTokenExpiresAt`; `ISellerRepository.GetByEmailAsync(string email, CancellationToken ct) : Task<Seller?>`, `.GetByIdAsync(string id, CancellationToken ct) : Task<Seller?>`, `.AddAsync(Seller seller, CancellationToken ct) : Task`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.Sellers;

namespace BAR.Domain.UnitTests.Sellers;

public class SellerTests
{
    [Fact]
    public void Register_ValidData_CreatesSellerWithEightCharId()
    {
        var seller = Seller.Register(
            firstName: "Anna", lastName: "Beispiel", address: null,
            postalCode: "76133", city: "Karlsruhe", phone: "0721 12345",
            email: "anna@example.com", sellerTypeId: "t1b2c3d4",
            passwordHash: "hashed", isAdmin: false);

        Assert.Equal(8, seller.Id.Length);
        Assert.Equal("anna@example.com", seller.Email);
        Assert.False(seller.IsAdmin);
        Assert.Equal("hashed", seller.PasswordHash);
        Assert.Null(seller.InviteToken);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void Register_MissingRequiredField_Throws(string firstName, string lastName)
    {
        Assert.Throws<ArgumentException>(() => Seller.Register(
            firstName, lastName, null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTests`
Expected: FAIL — `Seller`/`ISellerRepository` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.Sellers;

public sealed class Seller
{
    private Seller() { }

    public string Id { get; private init; } = null!;
    public string FirstName { get; private init; } = null!;
    public string LastName { get; private init; } = null!;
    public string? Address { get; private init; }
    public string PostalCode { get; private init; } = null!;
    public string City { get; private init; } = null!;
    public string Phone { get; private init; } = null!;
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
}
```

```csharp
namespace BAR.Domain.Ports;

public interface ISellerRepository
{
    Task<BAR.Domain.Sellers.Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<BAR.Domain.Sellers.Seller?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Sellers src/advance-registration/backend/BAR.Domain/Ports/ISellerRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers
git commit -m "feat(bar-domain): Seller-Entity und ISellerRepository"
```

---

### Task 2: SellerType-Entity + `ISellerTypeRepository`

**Carries:** `entities/verkaeufer-typ.md` — Default-Typ für Registrierung.

**Done when:** `SellerType.Create(...)` erzeugt ein gültiges Objekt, negative/ungültige Provision/Gebühr wirft.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/SellerTypes/SellerType.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/ISellerTypeRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/SellerTypes/SellerTypeTests.cs`

**Interfaces:**
- Produces: `SellerType.Create(string name, decimal commissionRate, decimal itemFee) : SellerType`; Properties `Id, Name, CommissionRate, ItemFee`; `ISellerTypeRepository.GetByIdAsync(string id, CancellationToken ct) : Task<SellerType?>`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.SellerTypes;

namespace BAR.Domain.UnitTests.SellerTypes;

public class SellerTypeTests
{
    [Fact]
    public void Create_ValidData_CreatesSellerType()
    {
        var type = SellerType.Create("Standard", 15.0m, 0.50m);

        Assert.Equal(8, type.Id.Length);
        Assert.Equal("Standard", type.Name);
        Assert.Equal(15.0m, type.CommissionRate);
        Assert.Equal(0.50m, type.ItemFee);
    }

    [Theory]
    [InlineData(-1, 0.5)]
    [InlineData(101, 0.5)]
    public void Create_CommissionRateOutOfRange_Throws(decimal commissionRate, decimal itemFee)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => SellerType.Create("Standard", commissionRate, itemFee));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTypeTests`
Expected: FAIL — Typ nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.SellerTypes;

public sealed class SellerType
{
    private SellerType() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private init; } = null!;
    public decimal CommissionRate { get; private init; }
    public decimal ItemFee { get; private init; }

    public static SellerType Create(string name, decimal commissionRate, decimal itemFee)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));
        if (commissionRate is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(commissionRate), "commissionRate muss zwischen 0 und 100 liegen.");
        if (itemFee < 0) throw new ArgumentOutOfRangeException(nameof(itemFee), "itemFee darf nicht negativ sein.");

        return new SellerType { Id = EntityId.New(), Name = name, CommissionRate = commissionRate, ItemFee = itemFee };
    }
}
```

```csharp
namespace BAR.Domain.Ports;

public interface ISellerTypeRepository
{
    Task<BAR.Domain.SellerTypes.SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTypeTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/SellerTypes src/advance-registration/backend/BAR.Domain/Ports/ISellerTypeRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/SellerTypes
git commit -m "feat(bar-domain): SellerType-Entity und ISellerTypeRepository"
```

---

### Task 3: Settings-Entity (Singleton) + `ISettingsRepository`

**Carries:** `entities/einstellungen.md` — Grundlage für `defaultTypeId`/`startNumber`/`blockSize`/`defaultBlockCount`/`infoText`/Countdown-Termine.

**Done when:** `Settings.Create(...)` erzeugt die Singleton-Row mit fixer `Id = "settings"`, `infoText` über 4000 Zeichen wirft.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Settings/Settings.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/ISettingsRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Settings/SettingsTests.cs`

**Interfaces:**
- Produces: `Settings.Create(DateTime registrationDeadline, DateTime dropOffFrom, DateTime dropOffUntil, DateTime bazaarFrom, DateTime bazaarUntil, string defaultTypeId, string? infoText, int startNumber, int blockSize, int defaultBlockCount) : Settings`; Properties wie benannt plus `Id` (fix `"settings"`); `ISettingsRepository.GetAsync(CancellationToken ct) : Task<Settings?>`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.Settings;

namespace BAR.Domain.UnitTests.Settings;

public class SettingsTests
{
    [Fact]
    public void Create_ValidData_UsesFixedId()
    {
        var now = DateTime.UtcNow;
        var settings = Settings.Create(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

        Assert.Equal("settings", settings.Id);
        Assert.Equal(1, settings.StartNumber);
        Assert.Equal(10, settings.BlockSize);
        Assert.Equal(1, settings.DefaultBlockCount);
    }

    [Fact]
    public void Create_InfoTextOverLimit_Throws()
    {
        var now = DateTime.UtcNow;
        var tooLong = new string('a', 4001);

        Assert.Throws<ArgumentException>(() => Settings.Create(now, now, now, now, now, "t1b2c3d4", tooLong, 1, 10, 1));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SettingsTests`
Expected: FAIL — `Settings` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Domain.Settings;

public sealed class Settings
{
    public const string SingletonId = "settings";
    private const int InfoTextMaxLength = 4000;

    private Settings() { }

    public string Id { get; private init; } = SingletonId;
    public DateTime RegistrationDeadline { get; private init; }
    public DateTime DropOffFrom { get; private init; }
    public DateTime DropOffUntil { get; private init; }
    public DateTime BazaarFrom { get; private init; }
    public DateTime BazaarUntil { get; private init; }
    public string DefaultTypeId { get; private init; } = null!;
    public string? InfoText { get; private init; }
    public int StartNumber { get; private init; }
    public int BlockSize { get; private init; }
    public int DefaultBlockCount { get; private init; }

    public static Settings Create(
        DateTime registrationDeadline, DateTime dropOffFrom, DateTime dropOffUntil,
        DateTime bazaarFrom, DateTime bazaarUntil, string defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        if (infoText is { Length: > InfoTextMaxLength })
        {
            throw new ArgumentException($"infoText darf maximal {InfoTextMaxLength} Zeichen haben.", nameof(infoText));
        }

        return new Settings
        {
            RegistrationDeadline = registrationDeadline, DropOffFrom = dropOffFrom,
            DropOffUntil = dropOffUntil, BazaarFrom = bazaarFrom, BazaarUntil = bazaarUntil,
            DefaultTypeId = defaultTypeId, InfoText = infoText, StartNumber = startNumber,
            BlockSize = blockSize, DefaultBlockCount = defaultBlockCount
        };
    }
}
```

```csharp
namespace BAR.Domain.Ports;

public interface ISettingsRepository
{
    Task<BAR.Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SettingsTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Settings src/advance-registration/backend/BAR.Domain/Ports/ISettingsRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Settings
git commit -m "feat(bar-domain): Settings-Singleton und ISettingsRepository"
```

---

### Task 4: RefreshToken-Entity + Hashing + `IRefreshTokenRepository`

**Carries:** `entities/refresh-token.md` — Ausgabe, Rotation, Max-5-Sessions.

**Done when:** `RefreshToken.Issue(...)` erzeugt Zeile mit SHA-256-Hash des übergebenen Klartext-Tokens, nie den Klartext selbst speichernd; `RefreshToken.HashOf(token)` ist deterministisch.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Auth/RefreshToken.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/IRefreshTokenRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Auth/RefreshTokenTests.cs`

**Interfaces:**
- Produces: `RefreshToken.Issue(string sellerId, string plainTextToken, DateTime issuedAtUtc, DateTime expiresAtUtc) : RefreshToken`; `RefreshToken.HashOf(string plainTextToken) : string` (statisch, SHA-256 Hex); Properties `Id, SellerId, TokenHash, ExpiresAt, CreatedAt, LastUsedAt`; `IRefreshTokenRepository.GetByHashAsync(string tokenHash, CancellationToken ct) : Task<RefreshToken?>`, `.AddAsync(RefreshToken token, CancellationToken ct) : Task`, `.DeleteAsync(string id, CancellationToken ct) : Task`, `.DeleteExpiredForSellerAsync(string sellerId, DateTime nowUtc, CancellationToken ct) : Task`, `.DeleteAllForSellerAsync(string sellerId, CancellationToken ct) : Task`, `.CountActiveForSellerAsync(string sellerId, CancellationToken ct) : Task<int>`, `.DeleteOldestForSellerAsync(string sellerId, CancellationToken ct) : Task`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.Auth;

namespace BAR.Domain.UnitTests.Auth;

public class RefreshTokenTests
{
    [Fact]
    public void Issue_ValidData_StoresOnlyHashNotPlainText()
    {
        var now = DateTime.UtcNow;
        var token = RefreshToken.Issue("a3f9c2d1", "plain-text-token", now, now.AddDays(30));

        Assert.Equal(8, token.Id.Length);
        Assert.Equal("a3f9c2d1", token.SellerId);
        Assert.NotEqual("plain-text-token", token.TokenHash);
        Assert.Equal(64, token.TokenHash.Length); // SHA-256 Hex
        Assert.Equal(now, token.CreatedAt);
        Assert.Equal(now.AddDays(30), token.ExpiresAt);
        Assert.Null(token.LastUsedAt);
    }

    [Fact]
    public void HashOf_SameInput_ReturnsSameHash()
    {
        Assert.Equal(RefreshToken.HashOf("abc"), RefreshToken.HashOf("abc"));
        Assert.NotEqual(RefreshToken.HashOf("abc"), RefreshToken.HashOf("xyz"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter RefreshTokenTests`
Expected: FAIL — `RefreshToken` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
using System.Security.Cryptography;
using System.Text;
using BAR.Domain.Common;

namespace BAR.Domain.Auth;

public sealed class RefreshToken
{
    private RefreshToken() { }

    public string Id { get; private init; } = null!;
    public string SellerId { get; private init; } = null!;
    public string TokenHash { get; private init; } = null!;
    public DateTime ExpiresAt { get; private init; }
    public DateTime CreatedAt { get; private init; }
    public DateTime? LastUsedAt { get; private init; }

    public static RefreshToken Issue(string sellerId, string plainTextToken, DateTime issuedAtUtc, DateTime expiresAtUtc) =>
        new()
        {
            Id = EntityId.New(), SellerId = sellerId, TokenHash = HashOf(plainTextToken),
            CreatedAt = issuedAtUtc, ExpiresAt = expiresAtUtc
        };

    public static string HashOf(string plainTextToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainTextToken));
        return Convert.ToHexStringLower(bytes);
    }
}
```

```csharp
namespace BAR.Domain.Ports;

public interface IRefreshTokenRepository
{
    Task<BAR.Domain.Auth.RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.Auth.RefreshToken token, CancellationToken cancellationToken);
    Task DeleteAsync(string id, CancellationToken cancellationToken);
    Task DeleteExpiredForSellerAsync(string sellerId, DateTime nowUtc, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<int> CountActiveForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task DeleteOldestForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter RefreshTokenTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Auth src/advance-registration/backend/BAR.Domain/Ports/IRefreshTokenRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Auth
git commit -m "feat(bar-domain): RefreshToken-Entity mit SHA-256-Hashing"
```

---

### Task 5: NumberBlock-Entity + `INumberBlockRepository`

**Carries:** `entities/nummernblock.md` — Grundlage für die Blockvergabe bei Registrierung und `GET /api/blocks/mine`.

**Done when:** `NumberBlock.Assign(...)` errechnet `toNumber` aus `fromNumber + blockSize - 1` und persistiert ihn fix.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/NumberBlocks/NumberBlock.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/INumberBlockRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/NumberBlocks/NumberBlockTests.cs`

**Interfaces:**
- Produces: `NumberBlock.Assign(string sellerId, int fromNumber, int blockSize, DateTime assignedAtUtc) : NumberBlock`; Properties `Id, SellerId, FromNumber, ToNumber, AssignedAt`; `INumberBlockRepository.GetAllOrderedByFromNumberAsync(CancellationToken ct) : Task<IReadOnlyList<NumberBlock>>` (global, für Überschneidungsprüfung), `.GetForSellerAsync(string sellerId, CancellationToken ct) : Task<IReadOnlyList<NumberBlock>>`, `.AddAsync(NumberBlock block, CancellationToken ct) : Task`, `.AddRangeAsync(IReadOnlyList<NumberBlock> blocks, CancellationToken ct) : Task`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.NumberBlocks;

public class NumberBlockTests
{
    [Fact]
    public void Assign_ValidRange_ComputesToNumberFromBlockSize()
    {
        var now = DateTime.UtcNow;
        var block = NumberBlock.Assign(sellerId: "a3f9c2d1", fromNumber: 101, blockSize: 10, assignedAtUtc: now);

        Assert.Equal(8, block.Id.Length);
        Assert.Equal(101, block.FromNumber);
        Assert.Equal(110, block.ToNumber);
        Assert.Equal(now, block.AssignedAt);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockTests`
Expected: FAIL — `NumberBlock` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.NumberBlocks;

public sealed class NumberBlock
{
    private NumberBlock() { }

    public string Id { get; private init; } = null!;
    public string SellerId { get; private init; } = null!;
    public int FromNumber { get; private init; }
    public int ToNumber { get; private init; }
    public DateTime AssignedAt { get; private init; }

    public static NumberBlock Assign(string sellerId, int fromNumber, int blockSize, DateTime assignedAtUtc) =>
        new()
        {
            Id = EntityId.New(), SellerId = sellerId, FromNumber = fromNumber,
            ToNumber = fromNumber + blockSize - 1, AssignedAt = assignedAtUtc
        };
}
```

```csharp
namespace BAR.Domain.Ports;

public interface INumberBlockRepository
{
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.NumberBlocks.NumberBlock block, CancellationToken cancellationToken);
    Task AddRangeAsync(IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock> blocks, CancellationToken cancellationToken);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/NumberBlocks src/advance-registration/backend/BAR.Domain/Ports/INumberBlockRepository.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/NumberBlocks
git commit -m "feat(bar-domain): NumberBlock-Entity und INumberBlockRepository"
```

---

### Task 6: `NumberBlockAllocator`-Domain-Service

**Carries:** `api/blocks.md` Abschnitt 5 (Vergabe-Kaskade Stufe 1–2, Stufe 3 als Notfall-Pfad) und Abschnitt 6 (Freiheitsprüfung Stufe 1–3) — Stufe 4 (Exclusion-Constraint) ist Infrastructure, nicht hier. Grundlage für `POST /api/auth/register` (Task 14).

**Done when:** `Allocate(...)` liefert für einen neuen Verkäufer ohne bestehende Blöcke `blockCount` zusammenhängende Blöcke ab der kleinsten freien Startnummer ≥ `startNumber`, überspringt belegte Bereiche vollständig, wirft `NoFreeRangeException` nur wenn kein Bereich passt.

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/NumberBlocks/NumberBlockAllocator.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/NumberBlocks/NumberBlockAllocatorTests.cs`

**Interfaces:**
- Consumes: `NumberBlock` aus Task 5
- Produces: `NumberBlockAllocator.Allocate(IReadOnlyList<NumberBlock> existingBlocks, string sellerId, int blockCount, int startNumber, int blockSize, DateTime nowUtc) : IReadOnlyList<NumberBlock>` (rein, kein DB-Zugriff — der aufrufende Handler lädt `existingBlocks` selbst, siehe `entities/einstellungen.md`)

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.NumberBlocks;

public class NumberBlockAllocatorTests
{
    [Fact]
    public void Allocate_NoExistingBlocks_StartsAtStartNumber()
    {
        var result = NumberBlockAllocator.Allocate(
            existingBlocks: [], sellerId: "a3f9c2d1", blockCount: 1,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Single(result);
        Assert.Equal(1, result[0].FromNumber);
        Assert.Equal(10, result[0].ToNumber);
    }

    [Fact]
    public void Allocate_MultipleBlocks_AreContiguous()
    {
        var result = NumberBlockAllocator.Allocate(
            existingBlocks: [], sellerId: "a3f9c2d1", blockCount: 2,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].FromNumber);
        Assert.Equal(10, result[0].ToNumber);
        Assert.Equal(11, result[1].FromNumber);
        Assert.Equal(20, result[1].ToNumber);
    }

    [Fact]
    public void Allocate_RangeOccupied_SkipsToNextFreeRange()
    {
        // Belegt: 1-10 und 21-30 -> naechster freier durchgehender 2-Block-Bereich (20 Nummern) beginnt bei 31.
        var occupied = new[]
        {
            NumberBlock.Assign("other1", 1, 10, DateTime.UtcNow),
            NumberBlock.Assign("other2", 21, 10, DateTime.UtcNow)
        };

        var result = NumberBlockAllocator.Allocate(
            existingBlocks: occupied, sellerId: "a3f9c2d1", blockCount: 2,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Equal(31, result[0].FromNumber);
    }

    [Fact]
    public void Allocate_AssignsToGivenSeller()
    {
        var result = NumberBlockAllocator.Allocate([], "a3f9c2d1", 1, 1, 10, DateTime.UtcNow);

        Assert.Equal("a3f9c2d1", result[0].SellerId);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockAllocatorTests`
Expected: FAIL — `NumberBlockAllocator` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Domain.NumberBlocks;

/// <summary>
/// Vergabe-Kaskade Stufe 1-2 (api/blocks.md Abschnitt 5) fuer Selbstregistrierung:
/// ein neuer Verkaeufer hat noch keine eigenen Bloecke, darum entfaellt Stufe 1
/// (eigener freier Bereich). Freiheitspruefung Stufe 1-3 (Abschnitt 6) laeuft
/// hier; Stufe 4 (Exclusion-Constraint) sichert die Race Condition erst beim
/// Insert in BAR.Infrastructure ab.
/// </summary>
public static class NumberBlockAllocator
{
    public static IReadOnlyList<NumberBlock> Allocate(
        IReadOnlyList<NumberBlock> existingBlocks, string sellerId, int blockCount,
        int startNumber, int blockSize, DateTime nowUtc)
    {
        var occupied = existingBlocks
            .OrderBy(b => b.FromNumber)
            .Select(b => (b.FromNumber, b.ToNumber))
            .ToList();

        var totalNeeded = blockCount * blockSize;
        var candidate = startNumber;

        while (true)
        {
            var candidateEnd = candidate + totalNeeded - 1;
            var overlap = occupied.FirstOrDefault(o => candidate <= o.ToNumber && candidateEnd >= o.FromNumber);

            if (overlap == default)
            {
                var blocks = new List<NumberBlock>(blockCount);
                var next = candidate;
                for (var i = 0; i < blockCount; i++)
                {
                    blocks.Add(NumberBlock.Assign(sellerId, next, blockSize, nowUtc));
                    next += blockSize;
                }

                return blocks;
            }

            candidate = overlap.ToNumber + 1;

            if (candidate > int.MaxValue - totalNeeded)
            {
                throw new NoFreeRangeException();
            }
        }
    }
}

/// <summary>Notfall-Pfad (api/blocks.md Abschnitt 5, Stufe 3) - im Normalbetrieb unerreichbar.</summary>
public sealed class NoFreeRangeException : Exception;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockAllocatorTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/NumberBlocks/NumberBlockAllocator.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/NumberBlocks/NumberBlockAllocatorTests.cs
git commit -m "feat(bar-domain): NumberBlockAllocator Vergabe-Kaskade Stufe 1-2"
```

---

### Task 7: Application-Abstraktionen `IPasswordHasher`, `ITokenIssuer`

**Carries:** Grundlage für Login/Register/Refresh-Handler — Passwort-Hashing und JWT-Ausstellung sind Infrastructure-Adapter (siehe Kommentar in `BAR.Infrastructure.csproj`, der diese Interfaces bereits ankündigt).

**Done when:** Interfaces existieren, kompilieren ohne Framework-Referenz in `BAR.Application`.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Abstractions/IPasswordHasher.cs`
- Create: `src/advance-registration/backend/BAR.Application/Abstractions/ITokenIssuer.cs`

Kein Unit-Test nötig — reine Interface-Deklaration ohne Verhalten, verifiziert über den Architektur-Test in Task 20 und die konkreten Implementierungs-Tests in Task 11.

**Interfaces:**
- Produces: `IPasswordHasher.Hash(string plainTextPassword) : string`, `.Verify(string plainTextPassword, string hash) : bool`; `ITokenIssuer.IssueAccessToken(string sellerId, string role, DateTime nowUtc) : string`, `.GenerateRefreshTokenPlainText() : string`

- [ ] **Step 1: Write the interfaces**

```csharp
namespace BAR.Application.Abstractions;

public interface IPasswordHasher
{
    string Hash(string plainTextPassword);
    bool Verify(string plainTextPassword, string hash);
}
```

```csharp
namespace BAR.Application.Abstractions;

public interface ITokenIssuer
{
    /// <summary>JWT mit Claims sub/role/exp (auth.md) - Lebensdauer liegt beim Adapter.</summary>
    string IssueAccessToken(string sellerId, string role, DateTime nowUtc);

    /// <summary>Kryptografisch zufaelliger Klartext-Refresh-Token; der Aufrufer hasht ihn ueber RefreshToken.HashOf vor dem Speichern.</summary>
    string GenerateRefreshTokenPlainText();
}
```

- [ ] **Step 2: Build to verify compilation**

Run: `dotnet build src/advance-registration/backend/BAR.Application`
Expected: Erfolgreich, keine neuen Package-Referenzen nötig.

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Abstractions/IPasswordHasher.cs src/advance-registration/backend/BAR.Application/Abstractions/ITokenIssuer.cs
git commit -m "feat(bar-application): IPasswordHasher- und ITokenIssuer-Abstraktion"
```

---

### Task 8: Directory.Packages.props + EF-Entity-Konfigurationen + DbContext-DbSets

**Carries:** Persistenz-Grundlage für alle fünf Entities (`entities/verkaeufer.md`, `refresh-token.md`, `verkaeufer-typ.md`, `einstellungen.md`, `nummernblock.md`).

**Done when:** `BarDbContext` hat DbSets für alle fünf Entities, EF-Konfigurationen setzen Unique-Constraints und den PostgreSQL-Exclusion-Constraint für `number_block`, `dotnet build` läuft ohne EF-Warnung.

**Files:**
- Modify: `src/advance-registration/backend/Directory.Packages.props` — `PackageVersion Include="BCrypt.Net-Next" Version="4.0.3"` in einer neuen `<!-- Sicherheit -->`-Gruppe ergänzen
- Modify: `src/advance-registration/backend/BAR.Infrastructure/BAR.Infrastructure.csproj` — `PackageReference Include="BCrypt.Net-Next"` ergänzen
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SellerConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SellerTypeConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/RefreshTokenConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/NumberBlockConfiguration.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/BarDbContext.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/BarDbContextTests.cs`

**Interfaces:**
- Consumes: `Seller`, `SellerType`, `Settings`, `RefreshToken`, `NumberBlock` aus Tasks 1–5
- Produces: `BarDbContext.Sellers : DbSet<Seller>`, `.SellerTypes : DbSet<SellerType>`, `.Settings : DbSet<Settings>`, `.RefreshTokens : DbSet<RefreshToken>`, `.NumberBlocks : DbSet<NumberBlock>`

- [ ] **Step 1: Write the failing test**

```csharp
using System.Net;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class BarDbContextTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BarDbContextTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task DbContext_AfterMigration_ExposesAllFiveDbSets()
    {
        _ = _factory.Server; // erzwingt Host-Start inkl. Migration
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BarDbContext>();

        Assert.Empty(await db.Sellers.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await db.RefreshTokens.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Single(await db.SellerTypes.ToListAsync(TestContext.Current.CancellationToken)); // Seed
        Assert.Single(await db.Settings.ToListAsync(TestContext.Current.CancellationToken)); // Seed
        Assert.Empty(await db.NumberBlocks.ToListAsync(TestContext.Current.CancellationToken));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter BarDbContextTests`
Expected: FAIL — DbSets existieren noch nicht (Compile-Fehler ist hier erwartet, nicht erst Testfehler).

- [ ] **Step 3: Write minimal implementation**

`Directory.Packages.props` — neue Gruppe ergänzen:

```xml
  <!-- Sicherheit -->
  <ItemGroup>
    <PackageVersion Include="BCrypt.Net-Next" Version="4.0.3" />
  </ItemGroup>
```

`BAR.Infrastructure.csproj` — `PackageReference` ergänzen:

```xml
    <PackageReference Include="BCrypt.Net-Next" />
```

`SellerConfiguration.cs`:

```csharp
using BAR.Domain.Sellers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.ToTable("seller");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(8);
        builder.Property(s => s.Email).IsRequired();
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.SellerTypeId).HasMaxLength(8).IsRequired();
    }
}
```

`SellerTypeConfiguration.cs`:

```csharp
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SellerTypeConfiguration : IEntityTypeConfiguration<SellerType>
{
    public void Configure(EntityTypeBuilder<SellerType> builder)
    {
        builder.ToTable("seller_type");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(8);
        builder.Property(t => t.Name).IsRequired();
        builder.HasIndex(t => t.Name).IsUnique();
        builder.Property(t => t.CommissionRate).HasPrecision(5, 2);
        builder.Property(t => t.ItemFee).HasPrecision(10, 2);
    }
}
```

`SettingsConfiguration.cs`:

```csharp
using BAR.Domain.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SettingsConfiguration : IEntityTypeConfiguration<Settings>
{
    public void Configure(EntityTypeBuilder<Settings> builder)
    {
        builder.ToTable("settings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(20);
        builder.Property(s => s.InfoText).HasMaxLength(4000);
        builder.Property(s => s.DefaultTypeId).HasMaxLength(8).IsRequired();
    }
}
```

`RefreshTokenConfiguration.cs`:

```csharp
using BAR.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_token");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(8);
        builder.Property(t => t.SellerId).HasMaxLength(8).IsRequired();
        builder.HasIndex(t => t.SellerId);
        builder.Property(t => t.TokenHash).IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
    }
}
```

`NumberBlockConfiguration.cs` — Exclusion-Constraint über rohes SQL, da EF Core kein natives `int4range` kennt:

```csharp
using BAR.Domain.NumberBlocks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class NumberBlockConfiguration : IEntityTypeConfiguration<NumberBlock>
{
    public void Configure(EntityTypeBuilder<NumberBlock> builder)
    {
        builder.ToTable("number_block", t => t.HasCheckConstraint(
            "CK_number_block_range_valid", "\"to_number\" >= \"from_number\""));
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8);
        builder.Property(b => b.SellerId).HasMaxLength(8).IsRequired();
        builder.HasIndex(b => b.SellerId);
        builder.Property(b => b.FromNumber).HasColumnName("from_number");
        builder.Property(b => b.ToNumber).HasColumnName("to_number");
    }
}
```

`BarDbContext.cs`:

```csharp
using System.Reflection;
using BAR.Domain.Auth;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence;

public sealed class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<SellerType> SellerTypes => Set<SellerType>();
    public DbSet<Domain.Settings.Settings> Settings => Set<Domain.Settings.Settings>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<NumberBlock> NumberBlocks => Set<NumberBlock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Exclusion-Constraint (api/blocks.md Abschnitt 6 Stufe 4) - EF Core hat
        // keine int4range-Unterstuetzung, darum rohes SQL statt Fluent API.
        modelBuilder.Entity<NumberBlock>().ToTable(t => t.HasAnnotation(
            "Npgsql:Check:CK_number_block_no_overlap",
            "EXCLUDE USING gist (int4range(\"from_number\", \"to_number\" + 1) WITH &&)"));
    }
}
```

> Hinweis für Task 9: PostgreSQL braucht die `btree_gist`-Extension für den
> Exclusion-Constraint auf einem Integer-Range — die Migration muss sie vor dem
> Constraint aktivieren (`CREATE EXTENSION IF NOT EXISTS btree_gist;`).

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter BarDbContextTests`
Expected: Kompiliert; der Test selbst bleibt rot, bis Task 9 (Migration+Seed) existiert — das ist erwartet, hier nur Kompilierbarkeit prüfen.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/Directory.Packages.props src/advance-registration/backend/BAR.Infrastructure src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence
git commit -m "feat(bar-infrastructure): EF-Konfigurationen und DbSets fuer R01-Entities"
```

---

### Task 9: EF-Migration + Seed-Daten

**Carries:** R01-Roadmap „Seed-Daten in der Migration" (Default-Typ, Einstellungen, Admin-Konto).

**Done when:** `dotnet ef migrations add AddLoginAndRegistration` erzeugt eine Migration, die beim Start (Program.cs `ApplyMigrationsAsync`) anwendet; danach existiert 1 `seller_type`, 1 `settings`-Row, 1 Admin-`seller`.

**Files:**
- Create (per `dotnet ef`): `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/<timestamp>_AddLoginAndRegistration.cs` + `.Designer.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/BarDbContextModelSnapshot.cs` (automatisch durch `dotnet ef`)
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/<timestamp>_AddLoginAndRegistration.cs` — Seed-`migrationBuilder.Sql(...)` nach dem generierten Schema-Teil ergänzen

**Interfaces:**
- Consumes: EF-Konfigurationen aus Task 8

- [ ] **Step 1: Generate the migration**

Run: `dotnet ef migrations add AddLoginAndRegistration --project src/advance-registration/backend/BAR.Infrastructure --startup-project src/advance-registration/backend/BAR.Host`
Expected: Migration-Dateien werden erzeugt; Diff enthält `CREATE TABLE seller`, `seller_type`, `settings`, `refresh_token`, `number_block`.

- [ ] **Step 2: Add btree_gist extension and exclusion constraint before the seed**

In der generierten `Up(MigrationBuilder migrationBuilder)` — vor den `CreateTable`-Aufrufen ergänzen:

```csharp
migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS btree_gist;");
```

Nach dem letzten `CreateTable`, `CreateIndex` etc. (am Ende von `Up`) den Exclusion-Constraint ergänzen, falls EF ihn nicht bereits aus der Annotation in Task 8 generiert hat:

```csharp
migrationBuilder.Sql("""
    ALTER TABLE number_block
    ADD CONSTRAINT "CK_number_block_no_overlap"
    EXCLUDE USING gist (int4range(from_number, to_number + 1) WITH &&);
    """);
```

- [ ] **Step 3: Append seed SQL at the end of `Up`**

```csharp
migrationBuilder.Sql($$"""
    INSERT INTO seller_type (id, name, commission_rate, item_fee)
    VALUES ('t0000001', 'Standard', 15.0, 0.50);

    INSERT INTO settings (
        id, registration_deadline, drop_off_from, drop_off_until,
        bazaar_from, bazaar_until, default_type_id, info_text,
        start_number, block_size, default_block_count)
    VALUES (
        'settings',
        NOW() + INTERVAL '28 days',
        NOW() + INTERVAL '35 days',
        NOW() + INTERVAL '35 days' + INTERVAL '10 hours',
        NOW() + INTERVAL '36 days',
        NOW() + INTERVAL '36 days' + INTERVAL '7 hours',
        't0000001',
        'Willkommen! Bitte bringt eure Artikel im angegebenen Abgabezeitraum vorbereitet mit.',
        1, 10, 1);

    -- Passwort "Admin123!" mit BCrypt.Net-Next work factor 12 vorab gehasht
    -- (deterministisch pro Erzeugung, hier fix eingebettet, damit die Migration
    -- ohne Programmlauf reproduzierbar bleibt - siehe Task 11 fuer den
    -- Runtime-Pfad ueber IPasswordHasher).
    INSERT INTO seller (
        id, first_name, last_name, address, postal_code, city, phone,
        email, seller_type_id, is_admin, password_hash)
    VALUES (
        'a0000001', 'Admin', 'Bazaar', NULL, '00000', 'Musterstadt', '00000 000000',
        'admin@bazaar.local', 't0000001', TRUE,
        '$2a$12$REPLACE_WITH_GENERATED_BCRYPT_HASH');
    """);
```

> Ausführungshinweis: Den echten BCrypt-Hash für `Admin123!` mit einem kleinen
> Wegwerf-Snippet erzeugen (`BCrypt.Net.BCrypt.HashPassword("Admin123!", workFactor: 12)`,
> z. B. via `dotnet-script` oder einem Scratch-Testprojekt) und den Platzhalter
> `REPLACE_WITH_GENERATED_BCRYPT_HASH` durch den erzeugten Hash ersetzen, bevor
> committet wird — niemals den Platzhalter selbst einchecken.

- [ ] **Step 4: Apply and verify**

Run: `docker compose up -d db` (falls nicht bereits aktiv), dann `dotnet run --project src/advance-registration/backend/BAR.Host` kurz starten (wendet Migration über `ApplyMigrationsAsync` an) und wieder stoppen, oder direkt: `dotnet ef database update --project src/advance-registration/backend/BAR.Infrastructure --startup-project src/advance-registration/backend/BAR.Host`
Expected: Kein Fehler; `psql` oder ein Ad-hoc-Query bestätigt genau 1 Zeile je Tabelle `seller_type`, `settings`, `seller`.

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter BarDbContextTests`
Expected: PASS (Test aus Task 8 wird jetzt grün).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations
git commit -m "feat(bar-infrastructure): Migration AddLoginAndRegistration inkl. Seed-Daten"
```

---

### Task 10: Repository-Implementierungen

**Carries:** Adapter für die fünf Ports aus Tasks 1–5.

**Done when:** Alle fünf Repository-Interfaces sind EF-basiert implementiert und in `AddInfrastructure` registriert.

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerTypeRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SettingsRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/RefreshTokenRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/NumberBlockRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SellerRepositoryTests.cs`

**Interfaces:**
- Consumes: Ports aus Tasks 1–5, `BarDbContext` aus Task 8
- Produces: registrierte `ISellerRepository`, `ISellerTypeRepository`, `ISettingsRepository`, `IRefreshTokenRepository`, `INumberBlockRepository` im DI-Container

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SellerRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetByEmail_ReturnsSameSeller()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Seller.Register("Test", "User", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await repo.AddAsync(seller, ct);

        var found = await repo.GetByEmailAsync(seller.Email, ct);

        Assert.NotNull(found);
        Assert.Equal(seller.Id, found!.Id);
    }

    [Fact]
    public async Task GetByEmailAsync_UnknownEmail_ReturnsNull()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();

        var found = await repo.GetByEmailAsync("nobody@example.com", TestContext.Current.CancellationToken);

        Assert.Null(found);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SellerRepositoryTests`
Expected: FAIL — `ISellerRepository` nicht registriert.

- [ ] **Step 3: Write minimal implementation**

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
}
```

```csharp
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerTypeRepository(BarDbContext dbContext) : ISellerTypeRepository
{
    public Task<SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.SellerTypes.SingleOrDefaultAsync(t => t.Id == id, cancellationToken);
}
```

```csharp
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SettingsRepository(BarDbContext dbContext) : ISettingsRepository
{
    public Task<Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken) =>
        dbContext.Settings.SingleOrDefaultAsync(cancellationToken);
}
```

```csharp
using BAR.Domain.Auth;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class RefreshTokenRepository(BarDbContext dbContext) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public async Task AddAsync(RefreshToken token, CancellationToken cancellationToken)
    {
        dbContext.RefreshTokens.Add(token);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens.Where(t => t.Id == id).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteExpiredForSellerAsync(string sellerId, DateTime nowUtc, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens
            .Where(t => t.SellerId == sellerId && t.ExpiresAt < nowUtc)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens.Where(t => t.SellerId == sellerId).ExecuteDeleteAsync(cancellationToken);
    }

    public Task<int> CountActiveForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens.CountAsync(t => t.SellerId == sellerId, cancellationToken);

    public async Task DeleteOldestForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        var oldest = await dbContext.RefreshTokens
            .Where(t => t.SellerId == sellerId)
            .OrderBy(t => t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (oldest is not null)
        {
            dbContext.RefreshTokens.Remove(oldest);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
```

```csharp
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class NumberBlockRepository(BarDbContext dbContext) : INumberBlockRepository
{
    public async Task<IReadOnlyList<NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.Where(b => b.SellerId == sellerId).OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public async Task AddAsync(NumberBlock block, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.Add(block);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IReadOnlyList<NumberBlock> blocks, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.AddRange(blocks);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

`DependencyInjection.cs` — Registrierungen ergänzen:

```csharp
        services.AddScoped<ISellerRepository, SellerRepository>();
        services.AddScoped<ISellerTypeRepository, SellerTypeRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<INumberBlockRepository, NumberBlockRepository>();
```

(mit den passenden `using BAR.Domain.Ports;` und `using BAR.Infrastructure.Persistence.Repositories;` am Dateikopf)

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SellerRepositoryTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SellerRepositoryTests.cs
git commit -m "feat(bar-infrastructure): EF-Repository-Implementierungen fuer R01-Ports"
```

---

### Task 11: `BCryptPasswordHasher` + `JwtTokenIssuer` + DI + Config

**Carries:** `entities/verkaeufer.md` Passwort-Hashing, `api/auth.md` Token-Eigenschaften (Claims `sub`/`role`/`exp`, Access 5 Tage).

**Done when:** `Verify(Hash(x), x)` ist `true`, ein ausgestelltes Access-Token lässt sich mit `JwtSecurityTokenHandler` lesen und trägt literal `sub`/`role`/`exp`.

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Security/BCryptPasswordHasher.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Security/JwtOptions.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Security/JwtTokenIssuer.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/BAR.Infrastructure.csproj` — `PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer"` ergänzen (enthält `System.IdentityModel.Tokens.Jwt` transitiv)
- Modify: `src/advance-registration/backend/BAR.Host/appsettings.Development.json` — `Jwt:SigningKey` Dev-Default ergänzen
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests` bleibt unberührt — Test liegt in Infrastructure, da Framework-Typen (JWT) gebraucht werden
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Security/SecurityAdaptersTests.cs`

**Interfaces:**
- Consumes: `IPasswordHasher`, `ITokenIssuer` aus Task 7
- Produces: registrierte `IPasswordHasher`, `ITokenIssuer` im DI-Container

- [ ] **Step 1: Write the failing test**

```csharp
using System.IdentityModel.Tokens.Jwt;
using BAR.Application.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Security;

public class SecurityAdaptersTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SecurityAdaptersTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public void PasswordHasher_HashThenVerify_Succeeds()
    {
        using var scope = _factory.Services.CreateScope();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var hash = hasher.Hash("Admin123!");

        Assert.NotEqual("Admin123!", hash);
        Assert.True(hasher.Verify("Admin123!", hash));
        Assert.False(hasher.Verify("wrong", hash));
    }

    [Fact]
    public void TokenIssuer_IssueAccessToken_ContainsLiteralClaimNames()
    {
        using var scope = _factory.Services.CreateScope();
        var issuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();

        var jwt = issuer.IssueAccessToken("a0000001", "admin", DateTime.UtcNow);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(jwt);

        Assert.Equal("a0000001", token.Claims.Single(c => c.Type == "sub").Value);
        Assert.Equal("admin", token.Claims.Single(c => c.Type == "role").Value);
        Assert.NotNull(token.Claims.SingleOrDefault(c => c.Type == "exp"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SecurityAdaptersTests`
Expected: FAIL — Adapter nicht registriert.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Application.Abstractions;

namespace BAR.Infrastructure.Security;

public sealed class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string plainTextPassword) =>
        BCrypt.Net.BCrypt.HashPassword(plainTextPassword, workFactor: WorkFactor);

    public bool Verify(string plainTextPassword, string hash) =>
        BCrypt.Net.BCrypt.Verify(plainTextPassword, hash);
}
```

```csharp
namespace BAR.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string SigningKey { get; init; }
    public string Issuer { get; init; } = "bar-advance-registration";
    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromDays(5);
    public TimeSpan RefreshTokenLifetime { get; init; } = TimeSpan.FromDays(30);
}
```

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BAR.Application.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BAR.Infrastructure.Security;

public sealed class JwtTokenIssuer(IOptions<JwtOptions> options) : ITokenIssuer
{
    public string IssueAccessToken(string sellerId, string role, DateTime nowUtc)
    {
        var opts = options.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Literale Claim-Typen "sub"/"role" statt ASP.NET-Standard-URIs, damit
        // das Frontend (jwt-decoder.ts) die Payload ohne Mapping lesen kann.
        var claims = new[]
        {
            new Claim("sub", sellerId),
            new Claim("role", role)
        };

        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            claims: claims,
            notBefore: nowUtc,
            expires: nowUtc.Add(opts.AccessTokenLifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshTokenPlainText() =>
        Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));
}
```

`DependencyInjection.cs` — ergänzen:

```csharp
        services.Configure<Security.JwtOptions>(configuration.GetSection(Security.JwtOptions.SectionName));
        services.AddSingleton<IPasswordHasher, Security.BCryptPasswordHasher>();
        services.AddSingleton<ITokenIssuer, Security.JwtTokenIssuer>();
```

`appsettings.Development.json` — ergänzen (Dev-only, Prod ausschließlich über `Jwt__SigningKey`-Env-Var):

```json
  "Jwt": {
    "SigningKey": "dev-only-signing-key-min-32-bytes-long-do-not-use-in-prod!"
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SecurityAdaptersTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure src/advance-registration/backend/BAR.Host/appsettings.Development.json src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Security
git commit -m "feat(bar-infrastructure): BCrypt-Passwort-Hasher und JWT-Token-Issuer"
```

---

### Task 12: Globaler `IExceptionHandler` für `DomainException`

**Carries:** `api/cross-cutting.md` Abschnitt 3 — RFC 9457 `ProblemDetails` mit `errorCode`, erzeugt an genau einem Ort.

**Done when:** Ein Endpoint, der `ConflictException("seller.email_taken", "...")` wirft, antwortet mit `409` und `errorCode` im Body — ohne dass der Endpoint selbst try/catch braucht.

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/DomainExceptionHandlerTests.cs`

**Interfaces:**
- Consumes: `DomainException`-Hierarchie aus `BAR.Domain.Exceptions`

- [ ] **Step 1: Write the failing test**

Testet den Handler indirekt über einen Wegwerf-Endpoint, den dieser Task selbst unter Test-Flag registriert — einfacher: Testet ihn über den echten `register`-Endpoint aus Task 19 vorgezogen wäre zirkulär, darum hier ein minimaler Diagnose-Endpoint nur für den Test:

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;

namespace BAR.Host.IntegrationTests;

public class DomainExceptionHandlerTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public DomainExceptionHandlerTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ConflictException_MapsTo409WithErrorCode()
    {
        var client = _factory.WithWebHostBuilder(builder =>
            builder.Configure(app =>
            {
                app.UseExceptionHandler();
                app.UseRouting();
                app.UseEndpoints(endpoints => endpoints.MapGet("/__test/conflict", () =>
                    throw new BAR.Domain.Exceptions.ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert")));
            })).CreateClient();

        var response = await client.GetAsync("/__test/conflict", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ProblemPayload>(TestContext.Current.CancellationToken);
        Assert.Equal("seller.email_taken", body!.ErrorCode);
    }

    private sealed record ProblemPayload(string? Detail, string? ErrorCode);
}
```

> Hinweis: Falls `WithWebHostBuilder` mit der bestehenden `Program`-Pipeline
> kollidiert, stattdessen den echten `register`-Endpoint aus Task 19 nutzen und
> diesen Test dorthin verschieben — dann entfällt der `__test/conflict`-Umweg.
> Diese Entscheidung trifft der Task-Ausführende situativ; das Ziel (409 +
> `errorCode` ohne Try/Catch im Endpoint) bleibt gleich.

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter DomainExceptionHandlerTests`
Expected: FAIL — kein `IExceptionHandler` registriert, Response ist `500` ohne `errorCode`.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BAR.Host;

/// <summary>
/// Einziger Ort, der DomainException auf ProblemDetails abbildet
/// (api/cross-cutting.md Abschnitt 3). Handler und Domaene werfen Exceptions,
/// sie bauen keine HTTP-Antworten.
/// </summary>
public sealed class DomainExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not DomainException domainException)
        {
            return false;
        }

        var status = domainException switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ForbiddenException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = ReasonPhrases.GetReasonPhrase(status),
            Detail = domainException.Message
        };
        problemDetails.Extensions["errorCode"] = domainException.ErrorCode;

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}

file static class ReasonPhrases
{
    public static string GetReasonPhrase(int statusCode) => statusCode switch
    {
        404 => "Not Found",
        409 => "Conflict",
        401 => "Unauthorized",
        403 => "Forbidden",
        _ => "Error"
    };
}
```

`Program.cs` — nach `builder.Services.AddInfrastructure(...)` ergänzen:

```csharp
builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddProblemDetails();
```

und nach `app.UseCors(corsPolicy);` ergänzen:

```csharp
app.UseExceptionHandler();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter DomainExceptionHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/DomainExceptionHandlerTests.cs
git commit -m "feat(bar-host): globaler ExceptionHandler mappt DomainException auf ProblemDetails"
```

---

### Task 13: FluentValidation-`ValidationFilter<TRequest>` + JWT-Bearer-Auth + Autorisierungs-Policies

**Carries:** `api/cross-cutting.md` Abschnitt 2 (Auth-Stufen `public`/`authenticated`/`admin`) und Abschnitt 3 (400 mit `errors`-Dictionary über FluentValidation).

**Done when:** Ein Endpoint mit `.AddEndpointFilter<ValidationFilter<TRequest>>()` und einem `AbstractValidator<TRequest>` liefert bei ungültigem Request `400` mit `errors`; ein mit `.RequireAuthorization("admin")` geschützter Endpoint liefert `401` ohne Token und `403` mit einem `seller`-Token.

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Validation/ValidationFilter.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Validation/ValidationFilterTests.cs`

**Interfaces:**
- Produces: `ValidationFilter<TRequest>` (generischer `IEndpointFilter`, löst `IValidator<TRequest>` per DI); Auth-Policies `"authenticated"` (Default, jedes gültige Token) und `"admin"` (`role` == `admin`)

- [ ] **Step 1: Write the failing test**

```csharp
using System.Net;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using FluentValidation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Validation;

public class ValidationFilterTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ValidationFilterTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record PingRequest(string Email);
    private sealed class PingValidator : AbstractValidator<PingRequest>
    {
        public PingValidator() => RuleFor(r => r.Email).EmailAddress();
    }

    private HttpClient CreateClientWithTestEndpoint() =>
        _factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.AddScoped<IValidator<PingRequest>, PingValidator>();
        }).Configure(app =>
        {
            app.UseRouting();
            app.UseEndpoints(endpoints => endpoints
                .MapPost("/__test/ping", (PingRequest request) => Results.Ok())
                .AddEndpointFilter<BAR.Host.Validation.ValidationFilter<PingRequest>>());
        })).CreateClient();

    [Fact]
    public async Task InvalidRequest_Returns400WithErrorsDictionary()
    {
        var client = CreateClientWithTestEndpoint();

        var response = await client.PostAsJsonAsync("/__test/ping", new PingRequest("not-an-email"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ValidRequest_PassesThrough()
    {
        var client = CreateClientWithTestEndpoint();

        var response = await client.PostAsJsonAsync("/__test/ping", new PingRequest("a@b.de"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedRoute_WithSellerToken_Returns403()
    {
        using var scope = _factory.Services.CreateScope();
        var issuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var token = issuer.IssueAccessToken("s0000001", "seller", DateTime.UtcNow);

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/blocks/__test-admin-only", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // Route existiert erst in Task 20 - hier nur Auth-Pipeline-Smoke, siehe Hinweis
    }
}
```

> Hinweis zu `ProtectedRoute_WithSellerToken_Returns403`: Solange kein
> `admin`-Endpoint existiert, ist `404` (Routing) das einzig beobachtbare
> Ergebnis — dieser Test wird in Task 20 durch einen echten Aufruf gegen
> `GET /api/blocks/mine` mit falscher Rolle ersetzt. Hier nur committen, wenn
> Schritt 1 die Auth-Pipeline kompiliert; den Assert ggf. auf `NotFound` lassen
> und in Task 20 verschärfen.

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ValidationFilterTests`
Expected: FAIL — `ValidationFilter<TRequest>` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
using FluentValidation;

namespace BAR.Host.Validation;

public sealed class ValidationFilter<TRequest> : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var validator = context.HttpContext.RequestServices.GetService<IValidator<TRequest>>();
        var request = context.Arguments.OfType<TRequest>().FirstOrDefault();

        if (validator is not null && request is not null)
        {
            var result = await validator.ValidateAsync(request, context.HttpContext.RequestAborted);
            if (!result.IsValid)
            {
                return Results.ValidationProblem(result.ToDictionary());
            }
        }

        return await next(context);
    }
}
```

`Program.cs` — Package-Referenz `FluentValidation` in `BAR.Host.csproj` ergänzen (`<PackageReference Include="FluentValidation" />` sowie `Microsoft.AspNetCore.Authentication.JwtBearer`), dann in `Program.cs` nach den bestehenden Services ergänzen:

```csharp
using BAR.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
```

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt-Konfiguration fehlt.");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            RoleClaimType = "role",
            NameClaimType = "sub"
        };
    });

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
    .AddPolicy("admin", policy => policy.RequireRole("admin"));
```

und in der Middleware-Pipeline nach `app.UseExceptionHandler();` ergänzen:

```csharp
app.UseAuthentication();
app.UseAuthorization();
```

`/health` und `/health/ready` bleiben `AllowAnonymous()` (bereits vorhanden) — mit dem neuen `SetDefaultPolicy` würden sie sonst Auth verlangen. Ebenso müssen die in Task 19/20 neu registrierten `public`-Endpoints (`/api/auth/*`, `/api/public/*`) explizit `.AllowAnonymous()` tragen.

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ValidationFilterTests`
Expected: PASS (dritter Test ggf. mit `NotFound`-Assert wie im Hinweis)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host
git commit -m "feat(bar-host): FluentValidation-Filter, JWT-Bearer-Auth und admin-Policy"
```

---

### Task 14: `RegisterCommand` + Handler + Validator

**Carries:** Epic_Login AC-5/AC-6/AC-7/AC-8/AC-9/AC-10/AC-11, `api/auth.md` Abschnitt 2.

**Done when:** Gültige Registrierung legt Seller + `defaultBlockCount` Blöcke an und liefert ein Token-Paar; doppelte E-Mail wirft `ConflictException("seller.email_taken", ...)`; fehlender `defaultTypeId` wirft `ConflictException("registration.not_enabled", ...)`.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Auth/Register/RegisterCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/Register/RegisterCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/Register/RegisterCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/TokenPairResult.cs` (gemeinsames Result für Register/Login/Refresh)
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Auth/Register/RegisterCommandHandlerTests.cs` (neues Testprojekt, siehe Step 0)

**Interfaces:**
- Consumes: `ISellerRepository`, `ISellerTypeRepository`, `ISettingsRepository`, `IRefreshTokenRepository`, `INumberBlockRepository`, `NumberBlockAllocator`, `IPasswordHasher`, `ITokenIssuer`, `IClock`
- Produces: `RegisterCommandHandler.HandleAsync(RegisterCommand command, CancellationToken ct) : Task<TokenPairResult>`; `RegisterCommand(string Email, string Password, string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone)`; `TokenPairResult(string AccessToken, string RefreshToken)`

- [ ] **Step 0: Create the BAR.Application.UnitTests project (once)**

Run: `dotnet new xunit3 -o src/advance-registration/backend/tests/BAR.Application.UnitTests`
Dann `ProjectReference` auf `BAR.Application` ergänzen und in `BAR.sln`-Äquivalent (Projektverzeichnis wird von `dotnet build`/`dotnet test` im Ordner automatisch erfasst, sofern kein zentrales `.sln` fehlt — falls doch ein `.sln` existiert, `dotnet sln add` ausführen) sowie `Moq` als `PackageReference` (Version zentral in `Directory.Packages.props` bereits vorhanden) ergänzen.

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth.Register;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Auth.Register;

public class RegisterCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();

    private RegisterCommandHandler CreateHandler() => new(
        _sellers.Object, _sellerTypes.Object, _settings.Object, _refreshTokens.Object,
        _blocks.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object);

    private void SetUpHappyPath()
    {
        var settings = Domain.Settings.Settings.Create(
            DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        _settings.Setup(s => s.GetAsync(default)).ReturnsAsync(settings);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", default)).ReturnsAsync((Seller?)null);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(default)).ReturnsAsync([]);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        _tokenIssuer.Setup(t => t.IssueAccessToken("s0000001", "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
    }

    private static RegisterCommand ValidCommand(string email = "anna@example.com") =>
        new(email, "geheim123", "Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 12345");

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerAndReturnsTokenPair()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(), default);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plain", result.RefreshToken);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x =>
            x.Email == "anna@example.com" && x.SellerTypeId == "t0000001" &&
            x.FirstName == "Anna" && x.LastName == "Beispiel" && x.PostalCode == "76133" &&
            x.City == "Karlsruhe" && x.Phone == "0721 12345"), default), Times.Once);
        _blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(list => list.Count == 1), default), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", default))
            .ReturnsAsync(Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "x"));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), default));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_NoDefaultTypeConfigured_ThrowsRegistrationNotEnabled()
    {
        _settings.Setup(s => s.GetAsync(default)).ReturnsAsync((Domain.Settings.Settings?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), default));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter RegisterCommandHandlerTests`
Expected: FAIL — Typen existieren noch nicht.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Application.Auth;

public sealed record TokenPairResult(string AccessToken, string RefreshToken);
```

```csharp
namespace BAR.Application.Auth.Register;

public sealed record RegisterCommand(
    string Email, string Password, string FirstName, string LastName,
    string? Address, string PostalCode, string City, string Phone);
```

```csharp
using FluentValidation;

namespace BAR.Application.Auth.Register;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        // Passwortstaerke "mind. Mittel" (Epic_Login Abschnitt 6): >=8 Zeichen
        // und mindestens 2 der 4 Zeichentypen Gross/Klein/Zahl/Sonderzeichen.
        RuleFor(c => c.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Must(HasAtLeastTwoCharacterTypes)
            .WithMessage("Passwort muss mindestens 'Mittel' stark sein.");

        // Pflichtfelder aus entities/verkaeufer.md (NOT NULL) - Requester-Entscheidung
        // 2026-09-09: gehoeren ins Register-Formular, nicht leer bleiben.
        RuleFor(c => c.FirstName).NotEmpty();
        RuleFor(c => c.LastName).NotEmpty();
        RuleFor(c => c.PostalCode).NotEmpty();
        RuleFor(c => c.City).NotEmpty();
        RuleFor(c => c.Phone).NotEmpty();
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

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Auth.Register;

public sealed class RegisterCommandHandler(
    ISellerRepository sellers,
    ISellerTypeRepository sellerTypes,
    ISettingsRepository settingsRepository,
    IRefreshTokenRepository refreshTokens,
    INumberBlockRepository blocks,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    public async Task<TokenPairResult> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var seller = Seller.Register(
            firstName: command.FirstName, lastName: command.LastName, address: command.Address,
            postalCode: command.PostalCode, city: command.City, phone: command.Phone,
            email: command.Email, sellerTypeId: settings.DefaultTypeId, passwordHash: passwordHash);

        await sellers.AddAsync(seller, cancellationToken);

        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, seller.Id, settings.DefaultBlockCount,
            settings.StartNumber, settings.BlockSize, clock.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
```

> **Hinweis Stammdaten-Felder:** `api/auth.md` Abschnitt 2 dokumentiert für
> `POST /api/auth/register` weiterhin nur `{ email, password }` — das ist an
> dieser Stelle veraltete Doku (Requester-Entscheidung 2026-09-09, siehe Spec
> „Klärung vorab" Punkt 3). Diese Implementierung übernimmt die vollen
> Stammdaten aus dem Register-Formular (Task 25/30); `api/auth.md` braucht
> dafür eine eigene Doku-Korrektur außerhalb dieses Plans.

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter RegisterCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Auth src/advance-registration/backend/tests/BAR.Application.UnitTests
git commit -m "feat(bar-application): RegisterCommand-Handler mit Blockvergabe"
```

---

### Task 15: `LoginCommand` + Handler

**Carries:** Epic_Login AC-1/AC-2, `api/auth.md` Abschnitt 1.

**Done when:** Korrekte Zugangsdaten liefern ein Token-Paar; falsches Passwort oder unbekannte E-Mail werfen **dieselbe** `UnauthorizedException("...", "Ungültige Anmeldedaten")` — keine Unterscheidung, welcher Teil falsch war (AC-2).

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Auth/Login/LoginCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/Login/LoginCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/Login/LoginCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Auth/Login/LoginCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ISellerRepository`, `IRefreshTokenRepository`, `IPasswordHasher`, `ITokenIssuer`, `IClock`
- Produces: `LoginCommandHandler.HandleAsync(LoginCommand command, CancellationToken ct) : Task<TokenPairResult>`; `LoginCommand(string Email, string Password)`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth.Login;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.Login;

public class LoginCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();

    private LoginCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_CorrectCredentials_ReturnsTokenPair()
    {
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", default)).ReturnsAsync(seller);
        _hasher.Setup(h => h.Verify("geheim123", "hashed")).Returns(true);
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var result = await CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "geheim123"), default);

        Assert.Equal("access-token", result.AccessToken);
    }

    [Fact]
    public async Task HandleAsync_UnknownEmail_ThrowsUnauthorized()
    {
        _sellers.Setup(s => s.GetByEmailAsync("nobody@example.com", default)).ReturnsAsync((Seller?)null);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new LoginCommand("nobody@example.com", "x"), default));

        Assert.Equal("Ungültige Anmeldedaten", ex.Message);
    }

    [Fact]
    public async Task HandleAsync_WrongPassword_ThrowsSameUnauthorizedAsUnknownEmail()
    {
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", default)).ReturnsAsync(seller);
        _hasher.Setup(h => h.Verify("wrong", "hashed")).Returns(false);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "wrong"), default));

        Assert.Equal("Ungültige Anmeldedaten", ex.Message);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter LoginCommandHandlerTests`
Expected: FAIL — Typen nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Application.Auth.Login;

public sealed record LoginCommand(string Email, string Password);
```

```csharp
using FluentValidation;

namespace BAR.Application.Auth.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.Password).NotEmpty();
    }
}
```

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.Login;

public sealed class LoginCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    private const string InvalidCredentialsMessage = "Ungültige Anmeldedaten";

    public async Task<TokenPairResult> HandleAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByEmailAsync(command.Email, cancellationToken);

        // Bewusst dieselbe Exception fuer unbekannte E-Mail und falsches
        // Passwort (Epic_Login AC-2) - kein Unterschied im Timing-Pfad, der
        // verraet, welcher Teil falsch war.
        if (seller?.PasswordHash is null || !passwordHasher.Verify(command.Password, seller.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalid_credentials", InvalidCredentialsMessage);
        }

        await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));

        if (await refreshTokens.CountActiveForSellerAsync(seller.Id, cancellationToken) >= 5)
        {
            await refreshTokens.DeleteOldestForSellerAsync(seller.Id, cancellationToken);
        }

        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter LoginCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Auth/Login src/advance-registration/backend/tests/BAR.Application.UnitTests/Auth/Login
git commit -m "feat(bar-application): LoginCommand-Handler"
```

---

### Task 16: `RefreshCommand` + Handler (Rotation)

**Carries:** `api/auth.md` Abschnitt 3 — Rotation, Max-5-Sessions, `401` bei unbekannt/abgelaufen/bereits rotiert.

**Done when:** Gültiges Refresh-Token liefert neues Token-Paar und die alte Zeile ist weg; ein zweiter Aufruf mit demselben (jetzt alten) Token wirft `UnauthorizedException`.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Auth/Refresh/RefreshCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Auth/Refresh/RefreshCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Auth/Refresh/RefreshCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ISellerRepository`, `IRefreshTokenRepository`, `ITokenIssuer`, `IClock`
- Produces: `RefreshCommandHandler.HandleAsync(RefreshCommand command, CancellationToken ct) : Task<TokenPairResult>`; `RefreshCommand(string RefreshToken)`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth.Refresh;
using BAR.Domain.Auth;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.Refresh;

public class RefreshCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();

    private RefreshCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _tokenIssuer.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_ValidToken_RotatesAndReturnsNewPair()
    {
        var now = DateTime.UtcNow;
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        var existing = RefreshToken.Issue(seller.Id, "old-plain", now.AddDays(-1), now.AddDays(29));
        _refreshTokens.Setup(r => r.GetByHashAsync(RefreshToken.HashOf("old-plain"), default)).ReturnsAsync(existing);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, default)).ReturnsAsync(seller);
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("new-access");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("new-refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(now);

        var result = await CreateHandler().HandleAsync(new RefreshCommand("old-plain"), default);

        Assert.Equal("new-access", result.AccessToken);
        Assert.Equal("new-refresh-plain", result.RefreshToken);
        _refreshTokens.Verify(r => r.DeleteAsync(existing.Id, default), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), default), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownToken_ThrowsUnauthorized()
    {
        _refreshTokens.Setup(r => r.GetByHashAsync(It.IsAny<string>(), default)).ReturnsAsync((RefreshToken?)null);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new RefreshCommand("unknown"), default));
    }

    [Fact]
    public async Task HandleAsync_ExpiredToken_ThrowsUnauthorized()
    {
        var now = DateTime.UtcNow;
        var expired = RefreshToken.Issue("s1", "expired-plain", now.AddDays(-31), now.AddDays(-1));
        _refreshTokens.Setup(r => r.GetByHashAsync(RefreshToken.HashOf("expired-plain"), default)).ReturnsAsync(expired);
        _clock.Setup(c => c.UtcNow).Returns(now);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new RefreshCommand("expired-plain"), default));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter RefreshCommandHandlerTests`
Expected: FAIL — Typen nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Application.Auth.Refresh;

public sealed record RefreshCommand(string RefreshToken);
```

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Auth;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.Refresh;

public sealed class RefreshCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    public async Task<TokenPairResult> HandleAsync(RefreshCommand command, CancellationToken cancellationToken)
    {
        var hash = RefreshToken.HashOf(command.RefreshToken);
        var existing = await refreshTokens.GetByHashAsync(hash, cancellationToken)
            ?? throw new UnauthorizedException("auth.invalid_refresh_token", "Refresh-Token unbekannt oder bereits verwendet");

        if (existing.ExpiresAt <= clock.UtcNow)
        {
            throw new UnauthorizedException("auth.invalid_refresh_token", "Refresh-Token abgelaufen");
        }

        var seller = await sellers.GetByIdAsync(existing.SellerId, cancellationToken)
            ?? throw new UnauthorizedException("auth.invalid_refresh_token", "Verkäufer nicht mehr vorhanden");

        // Rotation: alte Zeile loeschen, neue anlegen. Kein Repository-Transaction-Scope
        // hier noetig, solange beide Aufrufe in derselben DbContext-Instanz
        // (Scoped Lifetime) laufen - SaveChanges je Repository-Methode reicht,
        // weil zwischen beiden kein weiterer Request denselben Hash sehen kann.
        await refreshTokens.DeleteAsync(existing.Id, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var newRefreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(newRefreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter RefreshCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Auth/Refresh src/advance-registration/backend/tests/BAR.Application.UnitTests/Auth/Refresh
git commit -m "feat(bar-application): RefreshCommand-Handler mit Rotation"
```

---

### Task 17: `GetPublicInfoQuery` + Handler

**Carries:** `api/public.md` Abschnitt 1 — Countdown-Termine, aufgelöste `defaultConditions`, `infoText`, alle Felder `null`-fähig, immer `200`.

**Done when:** Handler liefert die 5 Termine + aufgelöste Konditionen des `defaultTypeId`-Typs + `infoText`; fehlende `Settings`-Row liefert ein Result mit lauter `null`-Feldern statt zu werfen.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Public/GetInfo/PublicInfoResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Public/GetInfo/GetPublicInfoQueryHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Public/GetInfo/GetPublicInfoQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `ISettingsRepository`, `ISellerTypeRepository`
- Produces: `GetPublicInfoQueryHandler.HandleAsync(CancellationToken ct) : Task<PublicInfoResult>`; `PublicInfoResult(DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil, DateTime? BazaarFrom, DateTime? BazaarUntil, ConditionsResult? DefaultConditions, string? InfoText)`; `ConditionsResult(decimal CommissionRate, decimal ItemFee)`

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Application.Public.GetInfo;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Public.GetInfo;

public class GetPublicInfoQueryHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private GetPublicInfoQueryHandler CreateHandler() => new(_settings.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_SettingsConfigured_ReturnsResolvedConditions()
    {
        var deadline = DateTime.UtcNow;
        var settings = Domain.Settings.Settings.Create(
            deadline, deadline, deadline, deadline, deadline, "t0000001", "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(default)).ReturnsAsync(settings);
        _sellerTypes.Setup(t => t.GetByIdAsync("t0000001", default)).ReturnsAsync(SellerType.Create("Standard", 15.0m, 0.5m));

        var result = await CreateHandler().HandleAsync(default);

        Assert.Equal(deadline, result.RegistrationDeadline);
        Assert.Equal(15.0m, result.DefaultConditions!.CommissionRate);
        Assert.Equal("Hinweis", result.InfoText);
    }

    [Fact]
    public async Task HandleAsync_NoSettingsRow_ReturnsAllNull()
    {
        _settings.Setup(s => s.GetAsync(default)).ReturnsAsync((Domain.Settings.Settings?)null);

        var result = await CreateHandler().HandleAsync(default);

        Assert.Null(result.RegistrationDeadline);
        Assert.Null(result.DefaultConditions);
        Assert.Null(result.InfoText);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetPublicInfoQueryHandlerTests`
Expected: FAIL — Typen nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Application.Public.GetInfo;

public sealed record ConditionsResult(decimal CommissionRate, decimal ItemFee);

public sealed record PublicInfoResult(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, ConditionsResult? DefaultConditions, string? InfoText);
```

```csharp
using BAR.Domain.Ports;

namespace BAR.Application.Public.GetInfo;

public sealed class GetPublicInfoQueryHandler(ISettingsRepository settingsRepository, ISellerTypeRepository sellerTypes)
{
    public async Task<PublicInfoResult> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        if (settings is null)
        {
            return new PublicInfoResult(null, null, null, null, null, null, null);
        }

        var defaultType = await sellerTypes.GetByIdAsync(settings.DefaultTypeId, cancellationToken);
        var conditions = defaultType is null ? null : new ConditionsResult(defaultType.CommissionRate, defaultType.ItemFee);

        return new PublicInfoResult(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil, conditions, settings.InfoText);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetPublicInfoQueryHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Public src/advance-registration/backend/tests/BAR.Application.UnitTests/Public
git commit -m "feat(bar-application): GetPublicInfoQuery-Handler"
```

---

### Task 18: `GetMyBlocksQuery` + Handler

**Carries:** `api/blocks.md` Abschnitt 1 — eigene Blöcke, rein lesend, aufsteigend nach `fromNumber`.

**Done when:** Handler liefert die Blöcke des übergebenen `sellerId`, aufsteigend sortiert, leeres Array wenn keine vorhanden.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Blocks/GetMine/BlockResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Blocks/GetMine/GetMyBlocksQueryHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Blocks/GetMine/GetMyBlocksQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `INumberBlockRepository`
- Produces: `GetMyBlocksQueryHandler.HandleAsync(string sellerId, CancellationToken ct) : Task<IReadOnlyList<BlockResult>>`; `BlockResult(string Id, string SellerId, int FromNumber, int ToNumber, DateTime AssignedAt)`

- [ ] **Step 1: Write the failing test**

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
    public async Task HandleAsync_SellerHasBlocks_ReturnsThem()
    {
        var block = NumberBlock.Assign("s1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetForSellerAsync("s1", default)).ReturnsAsync([block]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", default);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
    }

    [Fact]
    public async Task HandleAsync_NoBlocks_ReturnsEmptyList()
    {
        _blocks.Setup(b => b.GetForSellerAsync("s1", default)).ReturnsAsync([]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", default);

        Assert.Empty(result);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetMyBlocksQueryHandlerTests`
Expected: FAIL — Typen nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Application.Blocks.GetMine;

public sealed record BlockResult(string Id, string SellerId, int FromNumber, int ToNumber, DateTime AssignedAt);
```

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
            .Select(b => new BlockResult(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.AssignedAt))
            .ToList();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetMyBlocksQueryHandlerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Blocks src/advance-registration/backend/tests/BAR.Application.UnitTests/Blocks
git commit -m "feat(bar-application): GetMyBlocksQuery-Handler"
```

---

### Task 19: Host — Auth-Endpoints (`login`, `register`, `refresh`)

**Carries:** `api/auth.md` Endpoints 1–3 vollständig inkl. Fehlerfälle; Epic_Login AC-1/AC-2/AC-8/AC-9/AC-10/AC-11.

**Done when:** Alle drei Endpoints sind unter `/api/auth/*` erreichbar, `public` (kein Token nötig), liefern die Token-Hülle `{ accessToken, refreshToken }` und die dokumentierten Fehlercodes.

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Auth/AuthEndpoints.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/Auth/AuthContracts.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs` — Handler + Validatoren als Application-Services registrieren
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Auth/AuthEndpointsTests.cs`

**Interfaces:**
- Consumes: `RegisterCommandHandler`, `LoginCommandHandler`, `RefreshCommandHandler` aus Tasks 14–16
- Produces: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`

- [ ] **Step 1: Write the failing test**

```csharp
using System.Net;
using System.Net.Http.Json;

namespace BAR.Host.IntegrationTests.Features.Auth;

public class AuthEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public AuthEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record ProblemPayload(string? Detail, string? ErrorCode);

    private static object ValidRegisterPayload(string email, string password = "geheim123!") => new
    {
        email, password,
        firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
        postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    };

    [Fact]
    public async Task Register_NewEmail_Returns201WithTokenPair()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";

        var response = await client.PostAsJsonAsync("/api/auth/register",
            ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        Assert.False(string.IsNullOrEmpty(body!.AccessToken));
        Assert.False(string.IsNullOrEmpty(body.RefreshToken));
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409WithSellerEmailTaken()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ProblemPayload>(TestContext.Current.CancellationToken);
        Assert.Equal("seller.email_taken", body!.ErrorCode);
    }

    [Fact]
    public async Task Register_WeakPassword_Returns400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            ValidRegisterPayload($"{Guid.NewGuid()}@example.com", password: "abc"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingLastName_Returns400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "", address = (string?)null,
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_SeededAdmin_Returns200WithTokenPair()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@bazaar.local", password = "Admin123!" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@bazaar.local", password = "wrong" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_SecondCallWithSameToken_Returns401()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);

        var first = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = tokens!.RefreshToken }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = tokens.RefreshToken }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, second.StatusCode);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter AuthEndpointsTests`
Expected: FAIL — `404` auf allen drei Routen.

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace BAR.Host.Features.Auth;

public sealed record RegisterRequest(
    string Email, string Password, string FirstName, string LastName,
    string? Address, string PostalCode, string City, string Phone);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshRequest(string RefreshToken);
public sealed record TokenPairResponse(string AccessToken, string RefreshToken);
```

```csharp
using BAR.Application.Auth.Login;
using BAR.Application.Auth.Refresh;
using BAR.Application.Auth.Register;
using BAR.Host.Validation;

namespace BAR.Host.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").AllowAnonymous();

        group.MapPost("/register", async (RegisterRequest request, RegisterCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new RegisterCommand(
                request.Email, request.Password, request.FirstName, request.LastName,
                request.Address, request.PostalCode, request.City, request.Phone), ct);
            return Results.Created("/api/auth/register", new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<RegisterCommand>>();

        group.MapPost("/login", async (LoginRequest request, LoginCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new LoginCommand(request.Email, request.Password), ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<LoginCommand>>();

        group.MapPost("/refresh", async (RefreshRequest request, RefreshCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new RefreshCommand(request.RefreshToken), ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        });

        return app;
    }
}
```

> **Anpassung ValidationFilter:** `ValidationFilter<TRequest>` aus Task 13 sucht
> `context.Arguments.OfType<TRequest>()` — hier ist `TRequest` das
> `RegisterCommand`/`LoginCommand`, aber das Minimal-API-Argument ist
> `RegisterRequest`/`LoginRequest`. Vor diesem Task den Filter entweder generisch
> über das tatsächliche DTO parametrisieren (`ValidationFilter<RegisterRequest>`
> mit einem `RegisterRequestValidator : AbstractValidator<RegisterRequest>`, der
> dieselben Regeln wie `RegisterCommandValidator` spiegelt) **oder** die Handler
> direkt `RegisterRequest`/`LoginRequest` statt eigener Commands entgegennehmen
> lassen. Diese Plan-Version wählt den ersten Weg — pro Endpoint-DTO ein eigener
> `AbstractValidator<TRequest>` in `BAR.Host/Features/Auth/AuthValidators.cs`,
> der dieselbe Regel-Logik wie der Application-Validator dupliziert. Alternative
> zweite Option (Commands direkt als Minimal-API-Parameter binden) ist DRYer und
> sollte bevorzugt werden, wenn Minimal-API-Modelbinding auf Records mit
> Positional-Parametern zuverlässig funktioniert (in .NET 10 der Fall) — dann
> entfallen `RegisterRequest`/`LoginRequest`/`RefreshRequest` komplett und
> `RegisterCommand`/`LoginCommand`/`RefreshCommand` werden direkt gebunden. Der
> Task-Ausführende wählt hier die zweite, einfachere Variante und passt Schritt 3
> entsprechend an (Records aus Task 14–16 direkt als Endpoint-Parameter, keine
> separaten Contracts außer `TokenPairResponse`).

`Program.cs` — ergänzen:

```csharp
app.MapAuthEndpoints();
```

`DependencyInjection.cs` (`AddInfrastructure`) — Application-Handler als Scoped-Services registrieren, damit Minimal-API-DI sie auflösen kann:

```csharp
        services.AddScoped<RegisterCommandHandler>();
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshCommandHandler>();
        services.AddScoped<IValidator<RegisterCommand>, RegisterCommandValidator>();
        services.AddScoped<IValidator<LoginCommand>, LoginCommandValidator>();
```

(mit den passenden `using`-Zeilen für `BAR.Application.Auth.Register`, `.Login`, `.Refresh` und `FluentValidation`)

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter AuthEndpointsTests`
Expected: PASS

Run: `dotnet test src/advance-registration/backend/tests/BAR.Architecture.Tests`
Expected: weiterhin PASS — keine neue verbotene Referenzrichtung.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Auth
git commit -m "feat(bar-host): Auth-Endpoints login/register/refresh"
```

---

### Task 20: Host — `GET /api/public/info` + `GET /api/blocks/mine`

**Carries:** `api/public.md` Abschnitt 1, `api/blocks.md` Abschnitt 1; Epic_Login AC-12/AC-13.

**Done when:** `GET /api/public/info` ist ohne Token erreichbar und liefert `200` auch ohne konfigurierte Settings; `GET /api/blocks/mine` verlangt ein gültiges Token und liefert die eigenen Blöcke des `sub`-Claims.

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Public/PublicInfoEndpoints.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/Blocks/BlocksEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/PublicInfoEndpointTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Blocks/BlocksEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetPublicInfoQueryHandler`, `GetMyBlocksQueryHandler` aus Tasks 17–18

- [ ] **Step 1: Write the failing tests**

```csharp
using System.Net;
using System.Net.Http.Json;

namespace BAR.Host.IntegrationTests.Features.Public;

public class PublicInfoEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public PublicInfoEndpointTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetInfo_WithoutToken_Returns200WithSeededDefaults()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/info", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PublicInfoPayload>(TestContext.Current.CancellationToken);
        Assert.NotNull(body!.DefaultConditions);
        Assert.Equal(15.0m, body.DefaultConditions!.CommissionRate);
    }

    private sealed record ConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record PublicInfoPayload(ConditionsPayload? DefaultConditions, string? InfoText);
}
```

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Blocks;

public class BlocksEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public BlocksEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetMine_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/blocks/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMine_AfterRegistration_ReturnsOwnBlock()
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

        var response = await client.GetAsync("/api/blocks/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var blocks = await response.Content.ReadFromJsonAsync<List<BlockPayload>>(TestContext.Current.CancellationToken);
        Assert.Single(blocks!);
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record BlockPayload(string Id, int FromNumber, int ToNumber);
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "PublicInfoEndpointTests|BlocksEndpointsTests"`
Expected: FAIL — `404` auf beiden Routen.

- [ ] **Step 3: Write minimal implementation**

```csharp
using BAR.Application.Public.GetInfo;

namespace BAR.Host.Features.Public;

public static class PublicInfoEndpoints
{
    public static IEndpointRouteBuilder MapPublicInfoEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/info", async (GetPublicInfoQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct)))
            .AllowAnonymous();

        return app;
    }
}
```

```csharp
using System.Security.Claims;
using BAR.Application.Blocks.GetMine;

namespace BAR.Host.Features.Blocks;

public static class BlocksEndpoints
{
    public static IEndpointRouteBuilder MapBlocksEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/blocks/mine", async (ClaimsPrincipal user, GetMyBlocksQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        return app;
    }
}
```

`Program.cs` — ergänzen:

```csharp
app.MapPublicInfoEndpoints();
app.MapBlocksEndpoints();
```

`DependencyInjection.cs` — ergänzen:

```csharp
        services.AddScoped<GetPublicInfoQueryHandler>();
        services.AddScoped<GetMyBlocksQueryHandler>();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "PublicInfoEndpointTests|BlocksEndpointsTests"`
Expected: PASS

Run: `dotnet test src/advance-registration/backend`
Expected: komplette Backend-Testsuite grün (Domain, Application, Host.Integration, Architecture).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features
git commit -m "feat(bar-host): public-info- und blocks-mine-Endpoints"
```

---

### Task 21: `AuthApiService` (HTTP-Client für Login/Register/Refresh)

**Carries:** Grundlage für login-form/registrierung-form; ruft die Endpoints aus Task 19.

**Done when:** `login()`/`register()` liefern das Token-Paar als Observable, Fehler (401/409/400) werden unverändert durchgereicht (die Interceptor-Ausnahme für `/api/auth/*` aus R00/VSHELL-S04 AC-4 gilt bereits).

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.spec.ts`

**Interfaces:**
- Produces: `AuthApiService.login(email: string, password: string): Observable<TokenPair>`, `.register(payload: RegisterPayload): Observable<TokenPair>`; `interface TokenPair { accessToken: string; refreshToken: string; }`; `interface RegisterPayload { email: string; password: string; firstName: string; lastName: string; address?: string; postalCode: string; city: string; phone: string; }`

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthApiService]
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login() posts to /api/auth/login and returns the token pair', () => {
    let result: { accessToken: string; refreshToken: string } | undefined;
    service.login('anna@example.com', 'geheim123').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'anna@example.com', password: 'geheim123' });
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('register() posts full seller payload to /api/auth/register and returns the token pair', () => {
    let result: { accessToken: string; refreshToken: string } | undefined;
    const payload = {
      email: 'anna@example.com', password: 'geheim123',
      firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
      postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    };
    service.register(payload).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- auth-api.service.spec.ts`
Expected: FAIL — `AuthApiService` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  postalCode: string;
  city: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/login', { email, password });
  }

  register(payload: RegisterPayload): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/register', payload);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- auth-api.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.spec.ts
git commit -m "feat(bar-app): AuthApiService fuer login/register"
```

---

### Task 22: `password-strength-meter`-Komponente

**Carries:** Epic_Login Abschnitt 6 Passwort-Stärke-Schema, AC-6; [component-doc](../../../requirements/advance-registration/components/password-strength-meter.md).

**Done when:** `score(password)` liefert `'weak' | 'medium' | 'strong'` nach dem dokumentierten Schema; Template zeigt `p-progressbar` (Farbe je Stufe) + `p-tag` (Label).

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter/password-strength-meter.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter/password-strength.ts` (reine Scoring-Funktion, gesondert testbar)
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter/password-strength.spec.ts`

**Interfaces:**
- Produces: `computePasswordStrength(password: string): 'weak' | 'medium' | 'strong'`; Component `<app-password-strength-meter [password]="value" />`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { computePasswordStrength } from './password-strength';

describe('computePasswordStrength', () => {
  it('returns weak for short or single-type passwords', () => {
    expect(computePasswordStrength('abc')).toBe('weak');
    expect(computePasswordStrength('abcdefgh')).toBe('weak'); // nur Kleinbuchstaben
  });

  it('returns medium for 8+ chars with 2 character types', () => {
    expect(computePasswordStrength('abcdefg1')).toBe('medium');
  });

  it('returns strong for 10+ chars, all 4 types, at least 2 special chars', () => {
    expect(computePasswordStrength('Abcdefg1!!')).toBe('strong');
  });

  it('returns medium (not strong) with only 1 special char even if long enough', () => {
    expect(computePasswordStrength('Abcdefg1!')).toBe('medium');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- password-strength.spec.ts`
Expected: FAIL — Funktion nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
export type PasswordStrength = 'weak' | 'medium' | 'strong';

function characterTypeCount(password: string): number {
  return [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
}

function specialCharCount(password: string): number {
  return (password.match(/[^A-Za-z0-9]/g) ?? []).length;
}

// Epic_Login Abschnitt 6: schwach < 8 Zeichen oder 1 Typ; mittel >= 8 Zeichen
// + 2 Typen; stark >= 10 Zeichen + alle 4 Typen + mind. 2 Sonderzeichen.
export function computePasswordStrength(password: string): PasswordStrength {
  const types = characterTypeCount(password);

  if (password.length >= 10 && types === 4 && specialCharCount(password) >= 2) {
    return 'strong';
  }

  if (password.length >= 8 && types >= 2) {
    return 'medium';
  }

  return 'weak';
}
```

```typescript
import { Component, computed, input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { computePasswordStrength } from './password-strength';

const LABELS = { weak: 'Schwach', medium: 'Mittel', strong: 'Stark' } as const;
const SEVERITIES = { weak: 'danger', medium: 'warn', strong: 'success' } as const;
const VALUES = { weak: 33, medium: 66, strong: 100 } as const;

@Component({
  selector: 'app-password-strength-meter',
  imports: [ProgressBarModule, TagModule],
  template: `
    @if (password()) {
      <p-progressbar [value]="value()" [showValue]="false" [styleClass]="'strength-' + strength()" />
      <p-tag [value]="label()" [severity]="severity()" />
    }
  `
})
export class PasswordStrengthMeter {
  readonly password = input.required<string>();

  readonly strength = computed(() => computePasswordStrength(this.password()));
  readonly label = computed(() => LABELS[this.strength()]);
  readonly severity = computed(() => SEVERITIES[this.strength()]);
  readonly value = computed(() => VALUES[this.strength()]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- password-strength.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter
git commit -m "feat(bar-app): password-strength-meter Komponente und Scoring"
```

---

### Task 23: `markdown-text`-Komponente

**Carries:** Epic_Login AC-12; [component-doc](../../../requirements/advance-registration/components/markdown-text.md) Abschnitt 3.1/3.2 (Rendering-Umfang).

**Done when:** Überschriften (`#`/`##`), Fett (`**x**`), Kursiv (`*x*`), Zeilenumbrüche und Absätze werden zu HTML gerendert; unbekannte Syntax bleibt als Klartext stehen; leerer `content` rendert nichts.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/markdown-text/markdown-text.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/markdown-text/render-markdown-subset.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/markdown-text/render-markdown-subset.spec.ts`

**Interfaces:**
- Produces: `renderMarkdownSubset(content: string): string` (HTML-String, XSS-sicher — Eingabe wird vor der Konvertierung escaped); Component `<app-markdown-text [content]="value" />`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { renderMarkdownSubset } from './render-markdown-subset';

describe('renderMarkdownSubset', () => {
  it('renders headings, bold, italic and paragraphs', () => {
    const html = renderMarkdownSubset('## Hinweise\n\nBitte **pünktlich** sein, *danke*.');

    expect(html).toContain('<h2>Hinweise</h2>');
    expect(html).toContain('<strong>pünktlich</strong>');
    expect(html).toContain('<em>danke</em>');
  });

  it('escapes raw HTML in the input before conversion', () => {
    const html = renderMarkdownSubset('<script>alert(1)</script>');

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('returns empty string for empty content', () => {
    expect(renderMarkdownSubset('')).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- render-markdown-subset.spec.ts`
Expected: FAIL — Funktion nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Unterstuetztes Subset (markdown-text component.md 3.1): # / ## Ueberschriften,
// **fett**, *kursiv*, Absaetze durch Leerzeile getrennt. Alles andere bleibt
// als escapter Klartext stehen (3.2).
export function renderMarkdownSubset(content: string): string {
  if (!content.trim()) {
    return '';
  }

  const escaped = escapeHtml(content);
  const paragraphs = escaped.split(/\n\n+/);

  const html = paragraphs
    .map((paragraph) => {
      const headingMatch = /^(#{1,2})\s+(.*)$/.exec(paragraph.trim());
      if (headingMatch) {
        const level = headingMatch[1].length;
        return `<h${level}>${headingMatch[2]}</h${level}>`;
      }

      const inline = paragraph
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

      return `<p>${inline}</p>`;
    })
    .join('');

  return html;
}
```

```typescript
import { Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { renderMarkdownSubset } from './render-markdown-subset';

@Component({
  selector: 'app-markdown-text',
  template: `<div [innerHTML]="html()"></div>`
})
export class MarkdownText {
  readonly content = input<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = computed(() => {
    const rendered = renderMarkdownSubset(this.content() ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- render-markdown-subset.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/markdown-text
git commit -m "feat(bar-app): markdown-text Komponente mit Markdown-Subset-Renderer"
```

---

### Task 24: `login-form`-Komponente

**Carries:** Epic_Login Abschnitt 3, AC-1/AC-2/AC-3/AC-4.

**Done when:** E-Mail/Passwort-Felder mit `p-iconfield`, Enter im Passwortfeld löst Submit aus (AC-3), Fehlertext erscheint bei `@Input() errorMessage`, „Passwort vergessen" öffnet `p-popover` mit dem Admin-Hinweistext (AC-4), Submit emittiert `@Output() submitted`.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.spec.ts`

**Interfaces:**
- Consumes: `password-strength-meter` nicht hier (nur im Register-Formular)
- Produces: `@Input() errorMessage: string | null`; `@Output() submitted: EventEmitter<{ email: string; password: string }>`

- [ ] **Step 1: Write the failing test**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoginForm] }).compileComponents();
    fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
  });

  it('emits submitted with email and password on submit', () => {
    const component = fixture.componentInstance;
    let emitted: { email: string; password: string } | undefined;
    component.submitted.subscribe((v) => (emitted = v));

    component.email.set('anna@example.com');
    component.password.set('geheim123');
    component.onSubmit();

    expect(emitted).toEqual({ email: 'anna@example.com', password: 'geheim123' });
  });

  it('shows the given error message', () => {
    fixture.componentRef.setInput('errorMessage', 'Ungültige Anmeldedaten');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ungültige Anmeldedaten');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- login-form.spec.ts`
Expected: FAIL — `LoginForm` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, PasswordModule, PopoverModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <h1>Anmelden</h1>

      <label for="login-email">E-Mail</label>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-envelope" />
        <input id="login-email" pInputText [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" type="email" required />
      </p-iconfield>

      <label for="login-password">Passwort</label>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-lock" />
        <input id="login-password" pPassword [ngModel]="password()" (ngModelChange)="password.set($event)" name="password" [feedback]="false" required />
      </p-iconfield>

      @if (errorMessage()) {
        <p class="login-form__error">{{ errorMessage() }}</p>
      }

      <p-button type="submit" label="Anmelden" severity="primary" styleClass="w-full" />

      <button type="button" class="login-form__forgot" (click)="forgotPopover.toggle($event)">Passwort vergessen?</button>
      <p-popover #forgotPopover>
        <p>Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.</p>
      </p-popover>
    </form>
  `
})
export class LoginForm {
  readonly errorMessage = input<string | null>(null);
  @Output() readonly submitted = new EventEmitter<{ email: string; password: string }>();

  readonly email = signal('');
  readonly password = signal('');

  onSubmit(): void {
    this.submitted.emit({ email: this.email(), password: this.password() });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- login-form.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.ts src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.spec.ts
git commit -m "feat(bar-app): login-form Komponente"
```

---

### Task 25: `registrierung-form`-Komponente

**Carries:** Epic_Login Abschnitt 6, AC-5/AC-6/AC-7/AC-8.

**Done when:** Pflichtfeld-Validierung markiert fehlende Felder ohne Submit (AC-5, jetzt inklusive der Stammdaten-Pflichtfelder aus `entities/verkaeufer.md` — Requester-Entscheidung 2026-09-09, siehe Spec „Klärung vorab" Punkt 3), Submit-Button ist deaktiviert solange Passwort-Stärke unter „Mittel" (AC-6), Nicht-Übereinstimmung von Passwort/Bestätigung zeigt Fehler ohne Submit (AC-7), `@Input() emailTakenError` zeigt den AC-8-Text mit Login-Link.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/register/components/registrierung-form.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/register/components/registrierung-form.spec.ts`

**Interfaces:**
- Consumes: `PasswordStrengthMeter` (Task 22), `computePasswordStrength` (Task 22)
- Produces: `@Input() emailTakenError: boolean`; `@Output() submitted: EventEmitter<RegistrierungFormValue>`; `interface RegistrierungFormValue { email: string; password: string; firstName: string; lastName: string; address?: string; postalCode: string; city: string; phone: string; }`

- [ ] **Step 1: Write the failing test**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RegistrierungForm, RegistrierungFormValue } from './registrierung-form';

describe('RegistrierungForm', () => {
  let fixture: ComponentFixture<RegistrierungForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RegistrierungForm] }).compileComponents();
    fixture = TestBed.createComponent(RegistrierungForm);
    fixture.detectChanges();
  });

  function fillValidStammdaten(): void {
    const component = fixture.componentInstance;
    component.firstName.set('Anna');
    component.lastName.set('Beispiel');
    component.postalCode.set('76133');
    component.city.set('Karlsruhe');
    component.phone.set('0721 12345');
  }

  it('does not emit when passwords do not match', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    fillValidStammdaten();
    component.email.set('anna@example.com');
    component.password.set('geheim123!X');
    component.passwordConfirmation.set('anders');
    component.onSubmit();

    expect(emitted).toBe(false);
    expect(component.passwordMismatch()).toBe(true);
  });

  it('does not emit when password strength is below medium', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    fillValidStammdaten();
    component.email.set('anna@example.com');
    component.password.set('short');
    component.passwordConfirmation.set('short');
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('does not emit when a required Stammdaten field is missing', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    // fillValidStammdaten() bewusst NICHT aufgerufen - lastName bleibt leer.
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('emits the full seller payload when all fields are valid', () => {
    const component = fixture.componentInstance;
    let emitted: RegistrierungFormValue | undefined;
    component.submitted.subscribe((v) => (emitted = v));

    fillValidStammdaten();
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onSubmit();

    expect(emitted).toEqual({
      email: 'anna@example.com', password: 'geheim123!',
      firstName: 'Anna', lastName: 'Beispiel', address: '',
      postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- registrierung-form.spec.ts`
Expected: FAIL — `RegistrierungForm` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { PasswordStrengthMeter } from '../../../shared/password-strength-meter/password-strength-meter';
import { computePasswordStrength } from '../../../shared/password-strength-meter/password-strength';

export interface RegistrierungFormValue {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

@Component({
  selector: 'app-registrierung-form',
  imports: [FormsModule, RouterLink, ButtonModule, IconFieldModule, InputIconModule, PasswordModule, PasswordStrengthMeter],
  template: `
    <form (ngSubmit)="onSubmit()">
      <h1>Registrierung</h1>

      <label for="register-email">E-Mail</label>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-envelope" />
        <input id="register-email" pInputText [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" type="email" required />
      </p-iconfield>
      @if (emailTakenError()) {
        <p class="registrierung-form__error">Diese E-Mail ist bereits registriert. <a routerLink="/login">Zum Login</a></p>
      }

      <label for="register-first-name">Vorname</label>
      <input id="register-first-name" pInputText [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" name="firstName" required />

      <label for="register-last-name">Nachname</label>
      <input id="register-last-name" pInputText [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" name="lastName" required />

      <label for="register-address">Anschrift</label>
      <input id="register-address" pInputText [ngModel]="address()" (ngModelChange)="address.set($event)" name="address" />

      <label for="register-postal-code">PLZ</label>
      <input id="register-postal-code" pInputText [ngModel]="postalCode()" (ngModelChange)="postalCode.set($event)" name="postalCode" required />

      <label for="register-city">Ort</label>
      <input id="register-city" pInputText [ngModel]="city()" (ngModelChange)="city.set($event)" name="city" required />

      <label for="register-phone">Telefon</label>
      <input id="register-phone" pInputText [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" required />

      <label for="register-password">Passwort</label>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-lock" />
        <input id="register-password" pPassword [ngModel]="password()" (ngModelChange)="password.set($event)" name="password" [feedback]="false" required />
      </p-iconfield>
      <app-password-strength-meter [password]="password()" />

      <label for="register-password-confirmation">Passwort-Bestätigung</label>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-lock" />
        <input id="register-password-confirmation" pPassword [ngModel]="passwordConfirmation()" (ngModelChange)="passwordConfirmation.set($event)" name="passwordConfirmation" [feedback]="false" required />
      </p-iconfield>
      @if (passwordMismatch()) {
        <p class="registrierung-form__error">Passwörter stimmen nicht überein</p>
      }

      <p-button type="submit" label="Registrieren" severity="primary" styleClass="w-full" [disabled]="!canSubmit()" />
    </form>
  `
})
export class RegistrierungForm {
  readonly emailTakenError = input(false);
  @Output() readonly submitted = new EventEmitter<RegistrierungFormValue>();

  readonly email = signal('');
  readonly password = signal('');
  readonly passwordConfirmation = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');

  readonly passwordMismatch = computed(() =>
    this.passwordConfirmation().length > 0 && this.password() !== this.passwordConfirmation());

  private readonly hasRequiredStammdaten = computed(() =>
    [this.firstName(), this.lastName(), this.postalCode(), this.city(), this.phone()].every((v) => v.length > 0));

  readonly canSubmit = computed(() => {
    const strength = computePasswordStrength(this.password());
    return (
      this.email().length > 0 &&
      this.hasRequiredStammdaten() &&
      this.password() === this.passwordConfirmation() &&
      (strength === 'medium' || strength === 'strong')
    );
  });

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitted.emit({
      email: this.email(), password: this.password(),
      firstName: this.firstName(), lastName: this.lastName(), address: this.address(),
      postalCode: this.postalCode(), city: this.city(), phone: this.phone()
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- registrierung-form.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/register/components
git commit -m "feat(bar-app): registrierung-form Komponente"
```

---

### Task 26: `PublicInfoService` + `login-info-panel`-Komponente

**Carries:** `api/public.md` Abschnitt 1 (Frontend-Seite), Epic_Login Abschnitt 2, AC-12/AC-13.

**Done when:** `PublicInfoService.get()` ruft `GET /api/public/info`; `login-info-panel` blendet Countdown-/Konditionen-/Markdown-Box einzeln aus, wenn das jeweilige Feld `null` ist.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/public-info/public-info.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/public-info/public-info.service.spec.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.spec.ts`

**Interfaces:**
- Consumes: `MarkdownText` (Task 23), Countdown-Komponente (Task 28)
- Produces: `PublicInfoService.get(): Observable<PublicInfo>`; `interface PublicInfo { registrationDeadline: string | null; dropOffFrom: string | null; dropOffUntil: string | null; bazaarFrom: string | null; bazaarUntil: string | null; defaultConditions: { commissionRate: number; itemFee: number } | null; infoText: string | null; }`; Component `<app-login-info-panel [info]="value" />`

- [ ] **Step 1: Write the failing tests**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach } from 'vitest';
import { PublicInfoService } from './public-info.service';

describe('PublicInfoService', () => {
  it('get() fetches GET /api/public/info', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), PublicInfoService] });
    const service = TestBed.inject(PublicInfoService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.get().subscribe();

    const req = httpMock.expectOne('/api/public/info');
    expect(req.request.method).toBe('GET');
    req.flush({ registrationDeadline: null, dropOffFrom: null, dropOffUntil: null, bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: null });
    httpMock.verify();
  });
});
```

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginInfoPanel } from './login-info-panel';

describe('LoginInfoPanel', () => {
  let fixture: ComponentFixture<LoginInfoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoginInfoPanel] }).compileComponents();
    fixture = TestBed.createComponent(LoginInfoPanel);
  });

  it('hides the conditions box when defaultConditions is null', () => {
    fixture.componentRef.setInput('info', {
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: null
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).toBeNull();
  });

  it('shows the conditions box when defaultConditions is set', () => {
    fixture.componentRef.setInput('info', {
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null,
      defaultConditions: { commissionRate: 15, itemFee: 0.5 }, infoText: null
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- public-info.service.spec.ts login-info-panel.spec.ts`
Expected: FAIL — Service/Komponente nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface PublicInfo {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultConditions: { commissionRate: number; itemFee: number } | null;
  infoText: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicInfoService {
  private readonly http = inject(HttpClient);

  get(): Observable<PublicInfo> {
    return this.http.get<PublicInfo>('/api/public/info');
  }
}
```

```typescript
import { Component, input } from '@angular/core';
import { MarkdownText } from '../../../shared/markdown-text/markdown-text';
import { PublicInfo } from '../../../core/public-info/public-info.service';

@Component({
  selector: 'app-login-info-panel',
  imports: [MarkdownText],
  template: `
    @if (hasCountdown()) {
      <div data-testid="countdown-box"><!-- Countdown-Komponente, siehe Task 28 --></div>
    }
    @if (info().defaultConditions) {
      <div data-testid="conditions-box" class="login-info-panel__conditions">
        <span>{{ info().defaultConditions!.commissionRate }} % Provision</span>
        <span>{{ info().defaultConditions!.itemFee }} € Gebühr/Artikel</span>
      </div>
    }
    @if (info().infoText) {
      <div data-testid="markdown-box"><app-markdown-text [content]="info().infoText" /></div>
    }
  `
})
export class LoginInfoPanel {
  readonly info = input.required<PublicInfo>();

  hasCountdown(): boolean {
    const i = this.info();
    return !!(i.registrationDeadline || i.dropOffFrom || i.dropOffUntil || i.bazaarFrom || i.bazaarUntil);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- public-info.service.spec.ts login-info-panel.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/public-info src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.ts src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.spec.ts
git commit -m "feat(bar-app): PublicInfoService und login-info-panel"
```

---

### Task 27: `login-layout`-Komponente

**Carries:** Epic_Login Abschnitt 1 — 2-Spalten-Split Desktop, mobile Info-Area ausgeblendet.

**Done when:** Zwei projizierte Content-Slots (`info`/`form`), Info-Slot per CSS ab ≤768px ausgeblendet.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.spec.ts`

**Interfaces:**
- Produces: `<app-login-layout>` mit `ng-content select="[info]"` und `select="[form]"`

- [ ] **Step 1: Write the failing test**

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginLayout } from './login-layout';

@Component({
  imports: [LoginLayout],
  template: `<app-login-layout><div info data-testid="info-slot"></div><div form data-testid="form-slot"></div></app-login-layout>`
})
class HostComponent {}

describe('LoginLayout', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects both info and form slots', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="info-slot"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="form-slot"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- login-layout.spec.ts`
Expected: FAIL — `LoginLayout` nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.html',
  styleUrl: './login-layout.scss'
})
export class LoginLayout {}
```

`login-layout.html`:

```html
<div class="login-layout">
  <div class="login-layout__info"><ng-content select="[info]" /></div>
  <div class="login-layout__form"><ng-content select="[form]" /></div>
</div>
```

`login-layout.scss` (Epic_Login Abschnitt 1/2/3 — Farben/Paddings verbindlich):

```scss
.login-layout {
  display: flex;
  min-height: 100vh;

  &__info {
    flex: 1 1 50%;
    background: #1b3a4b;
    padding: 60px 48px;
    color: #fff;
  }

  &__form {
    flex: 1 1 50%;
    background: #fff;
    padding: 60px 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    &__info {
      display: none;
    }

    &__form {
      flex: 1 1 100%;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- login-layout.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.ts src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.html src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.scss src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.spec.ts
git commit -m "feat(bar-app): login-layout Komponente (2-Spalten-Split)"
```

---

### Task 28: Countdown-Komponente (`variant="info-box"`)

**Carries:** Epic_Login Abschnitt 2 (Countdown-Box, Sequence-Mode-Phasen), [`docs/components/countdown/component.md`](../../../components/countdown/component.md).

**Done when:** `selectActivePhase(...)` wählt aus den fünf Terminen automatisch die aktuell relevante Phase (`registrationDeadline` → `dropOffFrom` → `dropOffUntil` → `bazaarFrom` → `bazaarUntil`, jeweils die erste noch nicht verstrichene); Komponente zeigt Tage + HH:MM:SS bis zu diesem Termin, aktualisiert sekündlich.

**Files:**
- Read first: `docs/components/countdown/component.md` — falls die Komponente dort bereits mit anderer Public API beschrieben ist (Props/Selector), **diese Beschreibung hat Vorrang** vor der folgenden Minimal-Implementierung; dann `select-active-phase.ts`/`countdown.ts` entsprechend anpassen statt 1:1 zu übernehmen.
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/select-active-phase.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/countdown.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/select-active-phase.spec.ts`

**Interfaces:**
- Produces: `selectActivePhase(phases: { key: string; label: string; at: Date | null }[], nowUtc: Date): { key: string; label: string; at: Date } | null`; Component `<app-countdown variant="info-box" [phases]="phases" />`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { selectActivePhase } from './select-active-phase';

describe('selectActivePhase', () => {
  const now = new Date('2026-09-09T12:00:00Z');

  it('returns the first phase that has not passed yet', () => {
    const phases = [
      { key: 'registrationDeadline', label: 'Anmeldeschluss', at: new Date('2026-09-01T00:00:00Z') }, // vorbei
      { key: 'dropOffFrom', label: 'Abgabe ab', at: new Date('2026-09-10T00:00:00Z') }, // naechste
      { key: 'dropOffUntil', label: 'Abgabe bis', at: new Date('2026-09-11T00:00:00Z') }
    ];

    expect(selectActivePhase(phases, now)?.key).toBe('dropOffFrom');
  });

  it('skips phases with null date', () => {
    const phases = [
      { key: 'registrationDeadline', label: 'x', at: null },
      { key: 'dropOffFrom', label: 'y', at: new Date('2026-09-10T00:00:00Z') }
    ];

    expect(selectActivePhase(phases, now)?.key).toBe('dropOffFrom');
  });

  it('returns null when every phase has passed or is unset', () => {
    const phases = [{ key: 'bazaarUntil', label: 'z', at: new Date('2026-01-01T00:00:00Z') }];

    expect(selectActivePhase(phases, now)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- select-active-phase.spec.ts`
Expected: FAIL — Funktion nicht gefunden.

- [ ] **Step 3: Write minimal implementation**

```typescript
export interface CountdownPhase {
  key: string;
  label: string;
  at: Date | null;
}

export function selectActivePhase(phases: CountdownPhase[], nowUtc: Date): (CountdownPhase & { at: Date }) | null {
  for (const phase of phases) {
    if (phase.at && phase.at.getTime() > nowUtc.getTime()) {
      return phase as CountdownPhase & { at: Date };
    }
  }
  return null;
}
```

```typescript
import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { selectActivePhase, CountdownPhase } from './select-active-phase';

@Component({
  selector: 'app-countdown',
  template: `
    @if (activePhase(); as phase) {
      <div class="countdown countdown--info-box">
        <span class="countdown__label">{{ phase.label }}</span>
        <span class="countdown__value">{{ daysLeft() }}</span>
        <span class="countdown__time">{{ timeLeft() }}</span>
      </div>
    }
  `
})
export class Countdown {
  readonly variant = input<'info-box'>('info-box');
  readonly phases = input.required<CountdownPhase[]>();

  private readonly now = signal(new Date());

  constructor() {
    const interval = setInterval(() => this.now.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(interval));
  }

  readonly activePhase = computed(() => selectActivePhase(this.phases(), this.now()));

  readonly remainingMs = computed(() => {
    const phase = this.activePhase();
    return phase ? Math.max(0, phase.at.getTime() - this.now().getTime()) : 0;
  });

  readonly daysLeft = computed(() => Math.floor(this.remainingMs() / 86_400_000));

  readonly timeLeft = computed(() => {
    const remainder = this.remainingMs() % 86_400_000;
    const hours = Math.floor(remainder / 3_600_000);
    const minutes = Math.floor((remainder % 3_600_000) / 60_000);
    const seconds = Math.floor((remainder % 60_000) / 1000);
    return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- select-active-phase.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/countdown
git commit -m "feat(bar-app): Countdown-Komponente mit Sequence-Mode-Phasenwahl"
```

---

### Task 29: `LoginPage` zusammensetzen (Login-Flow Ende-zu-Ende)

**Carries:** Epic_Login Abschnitt 4, AC-1/AC-2/AC-3; Verdrahtung aller Login-Bausteine aus Tasks 21–28.

**Done when:** `/login` zeigt Layout mit Info-Panel (echte Daten aus `GET /api/public/info`) und Login-Form; erfolgreicher Login speichert Token über `AuthService.login(...)` und navigiert nach `/home`; falsche Zugangsdaten zeigen den Fehlertext aus der `401`-Response.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.ts` — Platzhalter-`div[data-testid="countdown-box"]` durch echtes `<app-countdown [phases]="countdownPhases()" />` ersetzen
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.spec.ts`

**Interfaces:**
- Consumes: `AuthApiService` (Task 21), `AuthService.login()` (bestehend, R00), `PublicInfoService` (Task 26), `LoginLayout`/`LoginInfoPanel`/`LoginForm` (Tasks 24/26/27), `Countdown` (Task 28)

- [ ] **Step 1: Write the failing test**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();

    httpMock.expectOne('/api/public/info').flush({
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: null
    });
  });

  it('on successful login stores tokens and navigates to /home', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.onLoginSubmitted({ email: 'admin@bazaar.local', password: 'Admin123!' });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('on 401 shows the invalid-credentials error message', () => {
    fixture.componentInstance.onLoginSubmitted({ email: 'admin@bazaar.local', password: 'wrong' });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ detail: 'Ungültige Anmeldedaten', errorCode: 'auth.invalid_credentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('Ungültige Anmeldedaten');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- LoginPage.spec.ts`
Expected: FAIL — `onLoginSubmitted`/`errorMessage` existieren noch nicht.

- [ ] **Step 3: Write minimal implementation**

`login-info-panel.ts` — Platzhalter ersetzen:

```typescript
// countdown-box-Platzhalter (Task 26) ersetzen durch:
```
```html
@if (hasCountdown()) {
  <app-countdown [phases]="countdownPhases()" />
}
```

und im Component-Body ergänzen (sowie `Countdown` zu `imports` hinzufügen):

```typescript
  readonly countdownPhases = computed(() => {
    const i = this.info();
    return [
      { key: 'registrationDeadline', label: 'Anmeldeschluss', at: i.registrationDeadline ? new Date(i.registrationDeadline) : null },
      { key: 'dropOffFrom', label: 'Abgabe ab', at: i.dropOffFrom ? new Date(i.dropOffFrom) : null },
      { key: 'dropOffUntil', label: 'Abgabe bis', at: i.dropOffUntil ? new Date(i.dropOffUntil) : null },
      { key: 'bazaarFrom', label: 'Basar ab', at: i.bazaarFrom ? new Date(i.bazaarFrom) : null },
      { key: 'bazaarUntil', label: 'Basar bis', at: i.bazaarUntil ? new Date(i.bazaarUntil) : null }
    ];
  });
```

`LoginPage.ts`:

```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicInfoService, PublicInfo } from '../../../core/public-info/public-info.service';
import { LoginLayout } from '../components/login-layout';
import { LoginInfoPanel } from '../components/login-info-panel';
import { LoginForm } from '../components/login-form';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, LoginLayout, LoginInfoPanel, LoginForm],
  template: `
    <app-login-layout>
      @if (info(); as loadedInfo) {
        <app-login-info-panel info [info]="loadedInfo" />
      }
      <app-login-form form [errorMessage]="errorMessage()" (submitted)="onLoginSubmitted($event)" />
    </app-login-layout>
  `
})
export class LoginPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly publicInfo = inject(PublicInfoService);
  private readonly router = inject(Router);

  readonly info = signal<PublicInfo | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.publicInfo.get().subscribe((value) => this.info.set(value));
  }

  onLoginSubmitted(credentials: { email: string; password: string }): void {
    this.errorMessage.set(null);
    this.authApi.login(credentials.email, credentials.password).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.detail ?? 'Ungültige Anmeldedaten');
      }
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- LoginPage.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/login
git commit -m "feat(bar-app): LoginPage verdrahtet Layout, Info-Panel und Login-Form"
```

---

### Task 30: `RegisterPage` zusammensetzen (Registrierung Ende-zu-Ende)

**Carries:** Epic_Login Abschnitt 6 Ablauf 1–4, AC-8/AC-9/AC-10/AC-11.

**Done when:** Erfolgreiche Registrierung speichert Token und navigiert nach `/home` (AC-9, kein zweiter Login-Schritt); `409 seller.email_taken` setzt `emailTakenError`; `409 registration.not_enabled` zeigt eigenen Hinweistext.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/register/pages/RegisterPage.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/register/pages/RegisterPage.spec.ts`

**Interfaces:**
- Consumes: `AuthApiService` (Task 21), `AuthService.login()` (bestehend), `RegistrierungForm` (Task 25)

- [ ] **Step 1: Write the failing test**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';
import { AuthService } from '../../../core/auth/auth.service';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('on success stores tokens and navigates to /home without a second login step', () => {
    const router = TestBed.inject(Router);
    const authService = TestBed.inject(AuthService);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.onRegisterSubmitted({
      email: 'anna@example.com', password: 'geheim123!', firstName: 'Anna', lastName: 'Beispiel',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    });

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('on 409 seller.email_taken sets emailTakenError', () => {
    fixture.componentInstance.onRegisterSubmitted({
      email: 'anna@example.com', password: 'geheim123!', firstName: 'Anna', lastName: 'Beispiel',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    });

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ errorCode: 'seller.email_taken', detail: 'Diese E-Mail ist bereits registriert' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.emailTakenError()).toBe(true);
  });

  it('on 409 registration.not_enabled sets registrationNotEnabled', () => {
    fixture.componentInstance.onRegisterSubmitted({
      email: 'anna@example.com', password: 'geheim123!', firstName: 'Anna', lastName: 'Beispiel',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    });

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ errorCode: 'registration.not_enabled', detail: 'Registrierung ist noch nicht freigeschaltet' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.registrationNotEnabled()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- RegisterPage.spec.ts`
Expected: FAIL — `onRegisterSubmitted` existiert noch nicht.

- [ ] **Step 3: Write minimal implementation**

```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RegistrierungForm, RegistrierungFormValue } from '../components/registrierung-form';

@Component({
  selector: 'app-register-page',
  imports: [RegistrierungForm],
  template: `
    <h1>Registrierung</h1>
    @if (registrationNotEnabled()) {
      <p class="register-page__error">Registrierung ist noch nicht freigeschaltet.</p>
    } @else {
      <app-registrierung-form [emailTakenError]="emailTakenError()" (submitted)="onRegisterSubmitted($event)" />
    }
  `
})
export class RegisterPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly emailTakenError = signal(false);
  readonly registrationNotEnabled = signal(false);

  onRegisterSubmitted(value: RegistrierungFormValue): void {
    this.emailTakenError.set(false);
    this.authApi.register(value).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.errorCode === 'seller.email_taken') {
          this.emailTakenError.set(true);
        } else if (err.error?.errorCode === 'registration.not_enabled') {
          this.registrationNotEnabled.set(true);
        }
      }
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- RegisterPage.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/register
git commit -m "feat(bar-app): RegisterPage verdrahtet Registrierungs-Flow"
```

---

### Task 31: Demo-Hinweis (Dev-only) + DE-i18n-Schlüssel

**Carries:** Epic_Login Abschnitt 5 (Demo-Hinweis nur Entwicklung); R00-Vorgabe „DE vollständig gepflegt" für neue UI-Texte dieses Schritts.

**Done when:** In der Dev-Build zeigt die Login-Seite einen `<small>`-Hinweis mit den Demo-Zugangsdaten, in der Production-Build entfällt er vollständig; `de.json` enthält die in R01 neu verwendeten `ngx-translate`-Keys (Fehlertexte, Feld-Labels), `en.json` bleibt leer (R00-Entscheidung, Füllung erst R12).

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts` — Demo-Hinweis-Block ergänzen
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/de.json`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.spec.ts` — zwei Fälle ergänzen

**Interfaces:**
- Consumes: `environment.production` (Angular-Standard, aus R00-Scaffold vorhanden)

- [ ] **Step 1: Write the failing test (ergänzt in `LoginPage.spec.ts`)**

```typescript
  it('shows the demo hint outside production builds', () => {
    // environment.production ist im Test-Build false (Standard-Karma/Vitest-Config aus R00)
    expect(fixture.nativeElement.querySelector('[data-testid="demo-hint"]')).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- LoginPage.spec.ts`
Expected: FAIL — kein `[data-testid="demo-hint"]` im Template.

- [ ] **Step 3: Write minimal implementation**

`LoginPage.ts` — Import und Template ergänzen:

```typescript
import { environment } from '../../../../environments/environment';
```

```html
    @if (!isProduction) {
      <small data-testid="demo-hint" class="login-page__demo-hint">
        Demo-Zugang: admin&#64;bazaar.local / Admin123!
      </small>
    }
```

und im Component-Body:

```typescript
  readonly isProduction = environment.production;
```

> Falls `src/environments/environment.ts` in R00 noch nicht angelegt wurde,
> zuerst mit `export const environment = { production: false };` sowie
> `environment.prod.ts` mit `production: true` anlegen und in `angular.json`
> unter `fileReplacements` für die `production`-Konfiguration eintragen — Angular
> CLI generiert das normalerweise automatisch bei Projekterstellung; falls es in
> R00 fehlt, hier nachholen (nicht Teil des ursprünglichen R00-Scopes, aber ohne
> das keine Unterscheidung Dev/Prod möglich ist).

`de.json` — komplett ersetzen durch:

```json
{
  "login": {
    "title": "Anmelden",
    "email": "E-Mail",
    "password": "Passwort",
    "submit": "Anmelden",
    "forgotPassword": "Passwort vergessen?",
    "forgotPasswordHint": "Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.",
    "noAccount": "Noch kein Konto?",
    "registerLink": "Jetzt registrieren"
  },
  "register": {
    "title": "Registrierung",
    "email": "E-Mail",
    "password": "Passwort",
    "passwordConfirmation": "Passwort-Bestätigung",
    "submit": "Registrieren",
    "hasAccount": "Schon ein Konto?",
    "loginLink": "Zum Login",
    "passwordMismatch": "Passwörter stimmen nicht überein"
  },
  "errors": {
    "auth.invalid_credentials": "Ungültige Anmeldedaten",
    "seller.email_taken": "Diese E-Mail ist bereits registriert",
    "registration.not_enabled": "Registrierung ist noch nicht freigeschaltet"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test -- LoginPage.spec.ts`
Expected: PASS

Run: `npm --prefix src/advance-registration/frontend/BAR.App run test`
Expected: komplette Frontend-Testsuite grün.

Run: `npm --prefix src/advance-registration/frontend/BAR.App run lint`
Expected: keine neuen ESLint-Fehler (R00 hatte einen dedizierten Cleanup-Commit dafür — dieselbe Sorgfalt hier).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.spec.ts
git commit -m "feat(bar-app): Demo-Hinweis (Dev-only) und DE-Uebersetzungsschluessel fuer R01"
```

---

## Abschluss-Check (manuell, gegen R01 „Fertig, wenn")

Nach Task 31 alle 7 Punkte aus [`R01-zugang.md`](../../requirements/advance-registration/roadmap/R01-zugang.md) von Hand durchgehen (Registrieren → Login → falsches Passwort → Reload → geschützte Route ohne Login → Admin-Sidebar). Bei jedem Abweichen: zurück zum betroffenen Task, nicht am Ende pauschal nachbessern.

