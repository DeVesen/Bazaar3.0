# R03 Artikelerfassung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verkäufer können in der Voranmelde-App eigene Artikel anlegen, bearbeiten, löschen — mit automatischer Nummernvergabe aus dem eigenen Nummernblock und AutoComplete-Create für Marke/Kategorie.

**Architecture:** Hexagonal (Domain/Application/Infrastructure/Host) im Backend `BAR.*`, Feature-First Angular-Frontend. Backend wird vollständig nach API-Vertrag gebaut (Pagination/Filter/Sort, automatische Blockerweiterung, `expectedNumber`-Konfliktprüfung); Frontend nutzt in R03 nur den Teilausschnitt ohne Filter-Panel, ohne „Speichern + kopieren", ohne Nummernkonflikt-Dialog.

**Tech Stack:** .NET 10, EF Core (Npgsql), FluentValidation, xUnit v3 + Moq, Angular 22 (standalone, Zone.js, Signals), PrimeNG 22, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-09-r03-artikelerfassung-design.md](../specs/2026-09-09-r03-artikelerfassung-design.md)

## Global Constraints

- Domain-Entitäten: `sealed class`, privater Ctor, `private init`-Properties, statische Factory-Methode, Pflichtfeld-Guards via `ArgumentException`, IDs über `EntityId.New()` (8-stellig).
- Application-Handler: `sealed record` Command/Query, `sealed class XxxCommandHandler(deps...)` mit Primary-Constructor-DI, eine Methode `HandleAsync(Command, CancellationToken)`, keine MediatR. Validierung über `FluentValidation`-`AbstractValidator<T>`.
- Fehler: `throw new ConflictException(errorCode, detail)` / `NotFoundException` — nie manuell HTTP-Status bauen. `errorCode` immer `bereich.grund` (z. B. `article.number_taken`).
- Infrastructure: EF-Configurations mit explizitem `snake_case` über `.HasColumnName(...)`, Repository `sealed class XxxRepository(BarDbContext dbContext) : IXxxRepository`, `SaveChangesAsync` im Repository selbst.
- Host: `static class XxxEndpoints` mit `MapXxxEndpoints(this IEndpointRouteBuilder app)`, Command/Query direkt als Minimal-API-Parameter gebunden, `AddEndpointFilter<ValidationFilter<TCommand>>()` für 400, `.RequireAuthorization()` (default) bzw. `.RequireAuthorization("admin")`.
- Tests: xUnit v3 (`TestContext.Current.CancellationToken`), Moq, Testklasse `XxxTests`, Methode `Methode_Szenario_Ergebnis`, Ordnerstruktur spiegelt Source 1:1.
- Frontend: Standalone-Components, Inline-Template, Signals (`input`/`model`/`output`/`computed`/`effect`), kein `OnPush` explizit, `@Injectable({ providedIn: 'root' })` + `inject(HttpClient)`, relative `/api/...`-URLs, Page-Dateien PascalCase, Shared/Feature-Dateien kebab-case. Tests: Vitest + `TestBed`, `HttpTestingController`.
- DI-Registrierung: jeder neue Handler/Validator/Repository bekommt eine explizite Zeile in `BAR.Infrastructure/DependencyInjection.cs` (kein Assembly-Scanning).

---

## Backend — Domain

### Task 1: Article-Entity

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Articles/Article.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Articles/ArticleTests.cs`

**Interfaces:**
- Produces: `Article.Create(string sellerId, int number, string name, string brand, string category, decimal price, string? size, string? color, string? description, DateTime nowUtc) → Article`; `article.Update(string name, string brand, string category, decimal price, string? size, string? color, string? description, DateTime nowUtc) → void`; Properties `Id, Number, SellerId, Name, Brand, Category, Price, Size, Color, Description, CreatedAt, UpdatedAt`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Domain.Articles;

namespace BAR.Domain.UnitTests.Articles;

public class ArticleTests
{
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_ValidData_SetsAllFields()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, "116", "rot", "kaum getragen", Now);

        Assert.Equal(8, article.Id.Length);
        Assert.Equal(104, article.Number);
        Assert.Equal("s1234567", article.SellerId);
        Assert.Equal("Winterjacke", article.Name);
        Assert.Equal("Jako-O", article.Brand);
        Assert.Equal("Jacken", article.Category);
        Assert.Equal(12.50m, article.Price);
        Assert.Equal("116", article.Size);
        Assert.Equal("rot", article.Color);
        Assert.Equal("kaum getragen", article.Description);
        Assert.Equal(Now, article.CreatedAt);
        Assert.Equal(Now, article.UpdatedAt);
    }

    [Fact]
    public void Create_NoOptionalFields_LeavesThemNull()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);

        Assert.Null(article.Size);
        Assert.Null(article.Color);
        Assert.Null(article.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("s1234567", 104, name, "Jako-O", "Jacken", 12.50m, null, null, null, Now));
    }

    [Fact]
    public void Create_PriceNotPositive_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 0m, null, null, null, Now));
    }

    [Fact]
    public void Update_ChangesFieldsAndBumpsUpdatedAt()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);
        var later = Now.AddDays(1);

        article.Update("Sommerjacke", "H&M", "Jacken", 9.00m, "104", "blau", "neu", later);

        Assert.Equal("Sommerjacke", article.Name);
        Assert.Equal("H&M", article.Brand);
        Assert.Equal(9.00m, article.Price);
        Assert.Equal("104", article.Size);
        Assert.Equal("blau", article.Color);
        Assert.Equal("neu", article.Description);
        Assert.Equal(later, article.UpdatedAt);
        Assert.Equal(Now, article.CreatedAt);
        Assert.Equal(104, article.Number);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run (dev-mcp `test_dotnet_solution` or `dotnet test`): `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~ArticleTests`
Expected: FAIL — `Article` does not exist.

- [ ] **Step 3: Implement**

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.Articles;

public sealed class Article
{
    private Article() { }

    public string Id { get; private init; } = null!;
    public int Number { get; private init; }
    public string SellerId { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public string Brand { get; private set; } = null!;
    public string Category { get; private set; } = null!;
    public decimal Price { get; private set; }
    public string? Size { get; private set; }
    public string? Color { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private init; }
    public DateTime UpdatedAt { get; private set; }

    public static Article Create(
        string sellerId, int number, string name, string brand, string category,
        decimal price, string? size, string? color, string? description, DateTime nowUtc)
    {
        Validate(name, brand, category, price);

        return new Article
        {
            Id = EntityId.New(), Number = number, SellerId = sellerId,
            Name = name, Brand = brand, Category = category, Price = price,
            Size = size, Color = color, Description = description,
            CreatedAt = nowUtc, UpdatedAt = nowUtc
        };
    }

    public void Update(
        string name, string brand, string category, decimal price,
        string? size, string? color, string? description, DateTime nowUtc)
    {
        Validate(name, brand, category, price);

        Name = name; Brand = brand; Category = category; Price = price;
        Size = size; Color = color; Description = description;
        UpdatedAt = nowUtc;
    }

    private static void Validate(string name, string brand, string category, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));
        if (string.IsNullOrWhiteSpace(brand)) throw new ArgumentException("brand ist Pflicht.", nameof(brand));
        if (string.IsNullOrWhiteSpace(category)) throw new ArgumentException("category ist Pflicht.", nameof(category));
        if (price <= 0) throw new ArgumentException("price muss > 0 sein.", nameof(price));
    }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~ArticleTests`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Articles/Article.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Articles/ArticleTests.cs
git commit -m "feat(bar-app): Article-Domain-Entity"
```

---

### Task 2: Brand- und Category-Entities

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/MasterData/Brand.cs`
- Create: `src/advance-registration/backend/BAR.Domain/MasterData/Category.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/MasterData/BrandTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/MasterData/CategoryTests.cs`

**Interfaces:**
- Produces: `Brand.Create(string name, bool original) → Brand`, `brand.Rename(string name, bool original) → void`; identisch für `Category`. Properties `Id, Name, Original`.

- [ ] **Step 1: Write failing tests** (beide Dateien identisch bis auf Typnamen)

```csharp
using BAR.Domain.MasterData;

namespace BAR.Domain.UnitTests.MasterData;

public class BrandTests
{
    [Fact]
    public void Create_ValidName_SetsFields()
    {
        var brand = Brand.Create("Jako-O", original: true);

        Assert.Equal(8, brand.Id.Length);
        Assert.Equal("Jako-O", brand.Name);
        Assert.True(brand.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() => Brand.Create(name, original: false));
    }

    [Fact]
    public void Rename_ChangesNameAndOriginal()
    {
        var brand = Brand.Create("Nike", original: false);

        brand.Rename("Nike ", original: true);

        Assert.Equal("Nike ", brand.Name);
        Assert.True(brand.Original);
    }
}
```

```csharp
using BAR.Domain.MasterData;

namespace BAR.Domain.UnitTests.MasterData;

public class CategoryTests
{
    [Fact]
    public void Create_ValidName_SetsFields()
    {
        var category = Category.Create("Jacken", original: true);

        Assert.Equal(8, category.Id.Length);
        Assert.Equal("Jacken", category.Name);
        Assert.True(category.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() => Category.Create(name, original: false));
    }

    [Fact]
    public void Rename_ChangesNameAndOriginal()
    {
        var category = Category.Create("Jacken", original: false);

        category.Rename("Mäntel", original: true);

        Assert.Equal("Mäntel", category.Name);
        Assert.True(category.Original);
    }
}
```

- [ ] **Step 2: Run to verify both fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~BrandTests|FullyQualifiedName~CategoryTests`
Expected: FAIL — Typen fehlen.

- [ ] **Step 3: Implement**

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.MasterData;

public sealed class Brand
{
    private Brand() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public static Brand Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Brand { Id = EntityId.New(), Name = name, Original = original };
    }

    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        Name = name;
        Original = original;
    }
}
```

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.MasterData;

public sealed class Category
{
    private Category() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public static Category Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Category { Id = EntityId.New(), Name = name, Original = original };
    }

    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        Name = name;
        Original = original;
    }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~BrandTests|FullyQualifiedName~CategoryTests`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/MasterData/Brand.cs src/advance-registration/backend/BAR.Domain/MasterData/Category.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/MasterData/BrandTests.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/MasterData/CategoryTests.cs
git commit -m "feat(bar-app): Brand- und Category-Domain-Entities"
```

---

### Task 3: ArticleNumberAllocator (Vergabe-Kaskade)

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Articles/ArticleNumberAllocator.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Articles/ArticleNumberAllocatorTests.cs`

**Interfaces:**
- Consumes: `NumberBlock` (`Id, SellerId, FromNumber, ToNumber, AssignedAt`), `NumberBlockAllocator.Allocate(IReadOnlyList<NumberBlock> existingBlocks, string sellerId, int blockCount, int startNumber, int blockSize, DateTime nowUtc) → IReadOnlyList<NumberBlock>` (wirft `NoFreeRangeException`).
- Produces: `ArticleNumberAllocator.AllocateNext(IReadOnlyList<NumberBlock> sellerBlocks, IReadOnlyList<int> usedNumbersInSellerBlocks, IReadOnlyList<NumberBlock> allBlocksGlobal, string sellerId, int startNumber, int blockSize, DateTime nowUtc) → ArticleNumberAllocation` (wirft `NoFreeRangeException` bei Stufe 3). `ArticleNumberAllocation(int Number, NumberBlock? NewBlock)`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Articles;

public class ArticleNumberAllocatorTests
{
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void AllocateNext_FreeNumberInOwnBlock_ReturnsSmallestFreeNumber_NoNewBlock()
    {
        var block = NumberBlock.Assign("s1", 101, 10, Now); // 101-110
        var used = new List<int> { 101, 102, 104 };

        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [block], usedNumbersInSellerBlocks: used, allBlocksGlobal: [block],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(103, result.Number);
        Assert.Null(result.NewBlock);
    }

    [Fact]
    public void AllocateNext_OwnBlocksFull_AllocatesNewBlockGlobalFreeSpace()
    {
        var ownBlock = NumberBlock.Assign("s1", 101, 10, Now); // 101-110, komplett belegt
        var used = Enumerable.Range(101, 10).ToList();
        var otherBlock = NumberBlock.Assign("s2", 111, 10, Now); // 111-120 belegt anderer Verkaeufer

        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [ownBlock], usedNumbersInSellerBlocks: used, allBlocksGlobal: [ownBlock, otherBlock],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(121, result.Number);
        Assert.NotNull(result.NewBlock);
        Assert.Equal("s1", result.NewBlock!.SellerId);
        Assert.Equal(121, result.NewBlock.FromNumber);
        Assert.Equal(130, result.NewBlock.ToNumber);
    }

    [Fact]
    public void AllocateNext_NoOwnBlocks_AllocatesFirstBlockFromStartNumber()
    {
        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [], usedNumbersInSellerBlocks: [], allBlocksGlobal: [],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(1, result.Number);
        Assert.NotNull(result.NewBlock);
        Assert.Equal(1, result.NewBlock!.FromNumber);
    }

    [Fact]
    public void AllocateNext_NoFreeRangeGlobally_ThrowsNoFreeRangeException()
    {
        // Belegt lueckenlos von startNumber bis int.MaxValue in einem Block der Groesse blockSize=10,
        // sodass Stufe 2 keinen Platz mehr findet: ein einzelner Block, der bis kurz vor int.MaxValue reicht.
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);

        Assert.Throws<NoFreeRangeException>(() =>
            ArticleNumberAllocator.AllocateNext(
                sellerBlocks: [], usedNumbersInSellerBlocks: [], allBlocksGlobal: [wallToWall],
                sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now));
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~ArticleNumberAllocatorTests`
Expected: FAIL — `ArticleNumberAllocator` fehlt.

- [ ] **Step 3: Implement**

```csharp
namespace BAR.Domain.Articles;

public sealed record ArticleNumberAllocation(int Number, NumberBlocks.NumberBlock? NewBlock);

/// <summary>
/// Vergabe-Kaskade Stufe 1-3 (api/blocks.md Abschnitt 5) fuer POST /api/articles
/// und GET /api/articles/next-number. Stufe 2 delegiert an NumberBlockAllocator
/// (bereits vorhanden fuer Selbstregistrierung/Admin-Anlage) statt die
/// Ueberschneidungs-Suche zu duplizieren.
/// </summary>
public static class ArticleNumberAllocator
{
    public static ArticleNumberAllocation AllocateNext(
        IReadOnlyList<NumberBlocks.NumberBlock> sellerBlocks,
        IReadOnlyList<int> usedNumbersInSellerBlocks,
        IReadOnlyList<NumberBlocks.NumberBlock> allBlocksGlobal,
        string sellerId, int startNumber, int blockSize, DateTime nowUtc)
    {
        var used = usedNumbersInSellerBlocks.ToHashSet();

        foreach (var block in sellerBlocks.OrderBy(b => b.FromNumber))
        {
            for (var n = block.FromNumber; n <= block.ToNumber; n++)
            {
                if (!used.Contains(n))
                {
                    return new ArticleNumberAllocation(n, NewBlock: null);
                }
            }
        }

        var newBlocks = NumberBlocks.NumberBlockAllocator.Allocate(
            allBlocksGlobal, sellerId, blockCount: 1, startNumber, blockSize, nowUtc);
        var newBlock = newBlocks[0];

        return new ArticleNumberAllocation(newBlock.FromNumber, newBlock);
    }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~ArticleNumberAllocatorTests`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Articles/ArticleNumberAllocator.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Articles/ArticleNumberAllocatorTests.cs
git commit -m "feat(bar-app): ArticleNumberAllocator Vergabe-Kaskade Stufe 1-3"
```

---

## Backend — Infrastructure (Schema + Ports)

### Task 4: Ports, EF-Configurations, DbContext, Migration

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Ports/IArticleRepository.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/IBrandRepository.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Ports/ICategoryRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/ArticleConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/BrandConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/CategoryConfiguration.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/BarDbContext.cs`
- Create (via EF CLI): `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/*_AddArticlesAndMasterData.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/BarDbContextTests.cs` (erweitern, nicht neu anlegen)

**Interfaces:**
- Produces (Ports, Signaturen für spätere Tasks):
  - `IArticleRepository`: `GetByIdAsync(string id, CancellationToken) → Task<Article?>`; `GetUsedNumbersForSellerAsync(string sellerId, CancellationToken) → Task<IReadOnlyList<int>>`; `CreateAsync(Article article, NumberBlock? newBlock, CancellationToken) → Task`; `UpdateAsync(Article article, CancellationToken) → Task`; `DeleteAsync(Article article, CancellationToken) → Task`.
  - `IBrandRepository`/`ICategoryRepository` (identisch): `GetAllAsync(CancellationToken) → Task<IReadOnlyList<Brand>>`; `GetByIdAsync(string id, CancellationToken) → Task<Brand?>`; `ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken) → Task<bool>`; `AddAsync(Brand brand, CancellationToken) → Task`; `UpdateAsync(Brand brand, string? renameArticlesFrom, CancellationToken) → Task` (schreibt bei `renameArticlesFrom != null` den neuen Namen in alle betroffenen `Article`-Zeilen, gleiche Transaktion); `CountArticlesWithNameAsync(string name, CancellationToken) → Task<int>`; `DeleteAsync(Brand brand, CancellationToken) → Task`.

- [ ] **Step 1: Ports anlegen**

`IArticleRepository.cs`:
```csharp
using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.Ports;

public interface IArticleRepository
{
    Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task CreateAsync(Article article, NumberBlock? newBlock, CancellationToken cancellationToken);
    Task UpdateAsync(Article article, CancellationToken cancellationToken);
    Task DeleteAsync(Article article, CancellationToken cancellationToken);
}
```

`IBrandRepository.cs`:
```csharp
using BAR.Domain.MasterData;

namespace BAR.Domain.Ports;

public interface IBrandRepository
{
    Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken);
    Task<Brand?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(Brand brand, CancellationToken cancellationToken);
    Task UpdateAsync(Brand brand, string? renameArticlesFrom, CancellationToken cancellationToken);
    Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken);
    Task DeleteAsync(Brand brand, CancellationToken cancellationToken);
}
```

`ICategoryRepository.cs`:
```csharp
using BAR.Domain.MasterData;

namespace BAR.Domain.Ports;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken);
    Task<Category?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(Category category, CancellationToken cancellationToken);
    Task UpdateAsync(Category category, string? renameArticlesFrom, CancellationToken cancellationToken);
    Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken);
    Task DeleteAsync(Category category, CancellationToken cancellationToken);
}
```

- [ ] **Step 2: EF-Configurations anlegen**

`ArticleConfiguration.cs`:
```csharp
using BAR.Domain.Articles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.ToTable("article");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(a => a.Number).HasColumnName("number");
        builder.Property(a => a.SellerId).HasMaxLength(8).IsRequired().HasColumnName("seller_id");
        builder.HasIndex(a => a.SellerId);
        builder.Property(a => a.Name).IsRequired().HasColumnName("name");
        builder.Property(a => a.Brand).IsRequired().HasColumnName("brand");
        builder.Property(a => a.Category).IsRequired().HasColumnName("category");
        builder.Property(a => a.Price).HasPrecision(10, 2).HasColumnName("price");
        builder.Property(a => a.Size).HasColumnName("size");
        builder.Property(a => a.Color).HasColumnName("color");
        builder.Property(a => a.Description).HasColumnName("description");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");
    }
}
```

`BrandConfiguration.cs`:
```csharp
using BAR.Domain.MasterData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("brand");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(b => b.Name).IsRequired().HasColumnName("name");
        builder.Property(b => b.Original).HasColumnName("original");
        // Case-insensitiver Unique-Index (lower(name)) wird als raw SQL in der
        // Migration angelegt, nicht ueber Fluent API - EF Core kennt keinen
        // funktionalen Index-Ausdruck ueber HasIndex(...).
    }
}
```

`CategoryConfiguration.cs`:
```csharp
using BAR.Domain.MasterData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("category");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(c => c.Name).IsRequired().HasColumnName("name");
        builder.Property(c => c.Original).HasColumnName("original");
    }
}
```

- [ ] **Step 3: `BarDbContext` erweitern**

In `BarDbContext.cs`, `using`-Zeilen ergänzen (`BAR.Domain.Articles`, `BAR.Domain.MasterData`) und drei `DbSet`-Properties nach `NumberBlocks` einfügen:

```csharp
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
```

- [ ] **Step 4: Migration erzeugen**

Run (dev-mcp `run_ef_migration` bzw. `dotnet ef migrations add` im Projektordner `BAR.Infrastructure` mit Startprojekt `BAR.Host`):
```bash
dotnet ef migrations add AddArticlesAndMasterData --project src/advance-registration/backend/BAR.Infrastructure --startup-project src/advance-registration/backend/BAR.Host
```

In der generierten Migration `Up()` **nach** den drei `CreateTable`-Aufrufen zwei raw-SQL-Statements ergänzen (case-insensitive Eindeutigkeit, siehe `api/master-data.md` „Duplikat-Prüfung"):

```csharp
migrationBuilder.Sql(@"CREATE UNIQUE INDEX ux_brand_name_ci ON brand (lower(trim(name)));");
migrationBuilder.Sql(@"CREATE UNIQUE INDEX ux_category_name_ci ON category (lower(trim(name)));");
```

In `Down()` davor:
```csharp
migrationBuilder.Sql(@"DROP INDEX IF EXISTS ux_brand_name_ci;");
migrationBuilder.Sql(@"DROP INDEX IF EXISTS ux_category_name_ci;");
```

- [ ] **Step 5: Bestehenden Integrationstest erweitern**

`BarDbContextTests.cs`, Testmethode `DbContext_AfterMigration_ExposesAllFiveDbSets` umbenennen in `DbContext_AfterMigration_ExposesAllDbSets` und drei Assertions ergänzen:

```csharp
Assert.Empty(await db.Articles.ToListAsync(TestContext.Current.CancellationToken));
Assert.Empty(await db.Brands.ToListAsync(TestContext.Current.CancellationToken));
Assert.Empty(await db.Categories.ToListAsync(TestContext.Current.CancellationToken));
```

- [ ] **Step 6: Bauen und Test laufen lassen**

Run: `dotnet build src/advance-registration/backend/BAR.slnx` (Migration muss kompilieren), dann `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~BarDbContextTests`
Expected: Build PASS, Test PASS (Testcontainer zieht echtes Postgres hoch, Migration läuft real).

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/IArticleRepository.cs src/advance-registration/backend/BAR.Domain/Ports/IBrandRepository.cs src/advance-registration/backend/BAR.Domain/Ports/ICategoryRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/ArticleConfiguration.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/BrandConfiguration.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/CategoryConfiguration.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/BarDbContext.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/ src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/BarDbContextTests.cs
git commit -m "feat(bar-app): Schema fuer Article/Brand/Category (Ports, Configurations, Migration)"
```

---

### Task 5: ArticleRepository

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/ArticleRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleRepositoryTests.cs`

**Interfaces:**
- Consumes: `IArticleRepository` (Task 4), `Article`/`NumberBlock` Domain-Typen, `BarDbContext`.
- Produces: `ArticleRepository : IArticleRepository` — für DI registriert unter `IArticleRepository`.

- [ ] **Step 1: Write failing integration tests**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ArticleRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task CreateAsync_WithoutNewBlock_PersistsArticle()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);

        await repo.CreateAsync(article, newBlock: null, ct);
        var found = await repo.GetByIdAsync(article.Id, ct);

        Assert.NotNull(found);
        Assert.Equal(104, found!.Number);
    }

    [Fact]
    public async Task CreateAsync_WithNewBlock_PersistsBothInOneCall()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var blocks = scope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var newBlock = NumberBlock.Assign(sellerId, 5001, 10, Now);
        var article = Article.Create(sellerId, 5001, "Body", "H&M", "Bodys", 3.00m, null, null, null, Now);

        await repo.CreateAsync(article, newBlock, ct);

        var persistedBlocks = await blocks.GetForSellerAsync(sellerId, ct);
        Assert.Single(persistedBlocks);
        Assert.Equal(5001, persistedBlocks[0].FromNumber);
    }

    [Fact]
    public async Task GetUsedNumbersForSellerAsync_ReturnsOnlyThatSellersNumbers()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var otherSellerId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 201, "A", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 202, "A", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(otherSellerId, 301, "A", "B", "C", 1m, null, null, null, Now), null, ct);

        var used = await repo.GetUsedNumbersForSellerAsync(sellerId, ct);

        Assert.Equal([201, 202], used.OrderBy(n => n));
    }

    [Fact]
    public async Task DeleteAsync_RemovesArticle()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 401, "A", "B", "C", 1m, null, null, null, Now);
        await repo.CreateAsync(article, null, ct);

        await repo.DeleteAsync(article, ct);

        Assert.Null(await repo.GetByIdAsync(article.Id, ct));
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticleRepositoryTests`
Expected: FAIL — kein `IArticleRepository` in DI registriert / `ArticleRepository` fehlt.

- [ ] **Step 3: Implement**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class ArticleRepository(BarDbContext dbContext) : IArticleRepository
{
    public Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Articles.SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.Articles.Where(a => a.SellerId == sellerId).Select(a => a.Number).ToListAsync(cancellationToken);

    public async Task CreateAsync(Article article, NumberBlock? newBlock, CancellationToken cancellationToken)
    {
        if (newBlock is not null)
        {
            dbContext.NumberBlocks.Add(newBlock);
        }

        dbContext.Articles.Add(article);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Article article, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Article article, CancellationToken cancellationToken)
    {
        dbContext.Articles.Remove(article);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

`DependencyInjection.cs` — Zeile nach `services.AddScoped<INumberBlockRepository, NumberBlockRepository>();` ergänzen:

```csharp
        services.AddScoped<IArticleRepository, ArticleRepository>();
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticleRepositoryTests`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/ArticleRepository.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleRepositoryTests.cs
git commit -m "feat(bar-app): ArticleRepository"
```

---

### Task 6: BrandRepository und CategoryRepository

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/BrandRepository.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/CategoryRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/BrandRepositoryTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/CategoryRepositoryTests.cs`

**Interfaces:**
- Consumes: `IBrandRepository`/`ICategoryRepository` (Task 4).
- Produces: `BrandRepository : IBrandRepository`, `CategoryRepository : ICategoryRepository` — DI-registriert.

- [ ] **Step 1: Write failing integration tests** (Brand gezeigt, Category identisch mit `Category`/`category`/`Categories`/`brand.md`→`categories.md` ersetzt)

```csharp
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class BrandRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BrandRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetAll_ContainsBrand()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = Brand.Create($"Jako-O-{Guid.NewGuid():N}", original: true);

        await repo.AddAsync(brand, ct);
        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, b => b.Id == brand.Id);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_DifferentCasingAndWhitespace_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        await repo.AddAsync(Brand.Create($"nike-{unique}", original: false), ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"  NIKE-{unique} ".Trim().ToUpperInvariant(), excludeId: null, ct);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_ExcludeOwnId_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        var brand = Brand.Create($"Puma-{unique}", original: false);
        await repo.AddAsync(brand, ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"puma-{unique}", excludeId: brand.Id, ct);

        Assert.False(exists);
    }

    [Fact]
    public async Task UpdateAsync_RenameWithCascade_UpdatesArticleBrandField()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var brands = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var oldName = $"Alt-{Guid.NewGuid():N}";
        var brand = Brand.Create(oldName, original: false);
        await brands.AddAsync(brand, ct);
        var article = BAR.Domain.Articles.Article.Create(sellerId, 501, "Jacke", oldName, "Jacken", 5m, null, null, null, DateTime.UtcNow);
        await articles.CreateAsync(article, null, ct);

        brand.Rename("Neu", original: true);
        await brands.UpdateAsync(brand, renameArticlesFrom: oldName, ct);

        var updatedArticle = await articles.GetByIdAsync(article.Id, ct);
        Assert.Equal("Neu", updatedArticle!.Brand);
    }

    [Fact]
    public async Task CountArticlesWithNameAsync_NoMatches_ReturnsZero()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();

        var count = await repo.CountArticlesWithNameAsync($"unbenutzt-{Guid.NewGuid():N}", TestContext.Current.CancellationToken);

        Assert.Equal(0, count);
    }

    [Fact]
    public async Task DeleteAsync_RemovesBrand()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = Brand.Create($"Weg-{Guid.NewGuid():N}", original: false);
        await repo.AddAsync(brand, ct);

        await repo.DeleteAsync(brand, ct);

        Assert.Null(await repo.GetByIdAsync(brand.Id, ct));
    }
}
```

Für `CategoryRepositoryTests.cs`: identische sechs Tests, `Brand`→`Category`, `IBrandRepository`→`ICategoryRepository`, `"category"`-Feld statt `"brand"`-Feld am `Article` (`Article.Create(..., "Marke", oldName, ...)` → Kategorie steht an vierter Stelle: `Article.Create(sellerId, 501, "Jacke", "Marke", oldName, 5m, null, null, null, DateTime.UtcNow)`), `updatedArticle!.Category` statt `.Brand`.

- [ ] **Step 2: Run to verify both fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~BrandRepositoryTests|FullyQualifiedName~CategoryRepositoryTests`
Expected: FAIL.

- [ ] **Step 3: Implement**

`BrandRepository.cs`:
```csharp
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class BrandRepository(BarDbContext dbContext) : IBrandRepository
{
    public async Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Brands.OrderBy(b => b.Name).ToListAsync(cancellationToken);

    public Task<Brand?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Brands.SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

    public Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLower();
        return dbContext.Brands
            .Where(b => excludeId == null || b.Id != excludeId)
            .AnyAsync(b => b.Name.Trim().ToLower() == normalized, cancellationToken);
    }

    public async Task AddAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Add(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Brand brand, string? renameArticlesFrom, CancellationToken cancellationToken)
    {
        if (renameArticlesFrom is not null)
        {
            await dbContext.Articles
                .Where(a => a.Brand == renameArticlesFrom)
                .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Brand, brand.Name), cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Brand == name, cancellationToken);

    public async Task DeleteAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

`CategoryRepository.cs` (identisch, `Category`/`Categories`/`.Category`-Property am Artikel):
```csharp
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository(BarDbContext dbContext) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Categories.OrderBy(c => c.Name).ToListAsync(cancellationToken);

    public Task<Category?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Categories.SingleOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLower();
        return dbContext.Categories
            .Where(c => excludeId == null || c.Id != excludeId)
            .AnyAsync(c => c.Name.Trim().ToLower() == normalized, cancellationToken);
    }

    public async Task AddAsync(Category category, CancellationToken cancellationToken)
    {
        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Category category, string? renameArticlesFrom, CancellationToken cancellationToken)
    {
        if (renameArticlesFrom is not null)
        {
            await dbContext.Articles
                .Where(a => a.Category == renameArticlesFrom)
                .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Category, category.Name), cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Category == name, cancellationToken);

    public async Task DeleteAsync(Category category, CancellationToken cancellationToken)
    {
        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

`DependencyInjection.cs` — zwei weitere Zeilen nach `IArticleRepository`:
```csharp
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~BrandRepositoryTests|FullyQualifiedName~CategoryRepositoryTests`
Expected: PASS (12 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/BrandRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/CategoryRepository.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/BrandRepositoryTests.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/CategoryRepositoryTests.cs
git commit -m "feat(bar-app): BrandRepository und CategoryRepository inkl. Namens-Kaskade"
```

---

### Task 7: IArticleQueries (Pagination/Filter/Sort, `mine` + Admin)

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Ports/Queries/IArticleQueries.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ArticleQueries.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleQueriesTests.cs`

**Interfaces:**
- Produces: `IArticleQueries.SearchMineAsync(string sellerId, string? brand, string? category, string? search, int page, int pageSize, string? sort, CancellationToken) → Task<ArticleSearchPage>`; `SearchAllAsync(string? brand, string? category, string? search, string? sellerId, int page, int pageSize, string? sort, CancellationToken) → Task<ArticleAdminSearchPage>`. `ArticleSearchPage(IReadOnlyList<Article> Items, int TotalCount)`. `ArticleAdminSearchPage(IReadOnlyList<ArticleWithSeller> Items, int TotalCount)`. `ArticleWithSeller(Article Article, string SellerId, int SellerStartNumber, string SellerFirstName, string SellerLastName)`.

**Vereinfachung gegenüber `cross-cutting.md` Abschnitt 4:** `search` nutzt case-insensitiven Teilwort-Match (`ILike '%term%'`) auf den vier Feldern, **keine** volle Token-Zerlegung mehrerer Suchbegriffe — für den Basar-Datenumfang (zweistellige bis niedrig-dreistellige Artikelanzahl je Verkäufer) ausreichend. Bei Bedarf später erweiterbar, ohne den Port-Vertrag zu ändern.

- [ ] **Step 1: Write failing integration tests**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ArticleQueriesTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleQueriesTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task SearchMineAsync_FiltersByBrandAndPaginates()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 1001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 1002, "A2", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 1003, "A3", "Adidas", "Schuhe", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchMineAsync(sellerId, brand: "Nike", category: null, search: null, page: 1, pageSize: 25, sort: null, ct);

        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Items, a => Assert.Equal("Nike", a.Brand));
    }

    [Fact]
    public async Task SearchMineAsync_SortByPriceDescending_OrdersResults()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 2001, "Billig", "M", "K", 3m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 2002, "Teuer", "M", "K", 30m, null, null, null, Now), null, ct);

        var page = await queries.SearchMineAsync(sellerId, null, null, null, 1, 25, sort: "price:desc", ct);

        Assert.Equal("Teuer", page.Items[0].Name);
        Assert.Equal("Billig", page.Items[1].Name);
    }

    [Fact]
    public async Task SearchAllAsync_ReturnsSellerInfoPerItem()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var blocks = scope.ServiceProvider.GetRequiredService<Domain.Ports.INumberBlockRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await blocks.AddAsync(Domain.NumberBlocks.NumberBlock.Assign(seller.Id, 3001, 10, Now), ct);
        await articles.CreateAsync(Article.Create(seller.Id, 3001, "X", "M", "K", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchAllAsync(null, null, search: "3001", sellerId: null, 1, 25, null, ct);

        Assert.Single(page.Items);
        Assert.Equal("Anna", page.Items[0].SellerFirstName);
        Assert.Equal(3001, page.Items[0].SellerStartNumber);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticleQueriesTests`
Expected: FAIL — `IArticleQueries` fehlt.

- [ ] **Step 3: Implement**

`IArticleQueries.cs`:
```csharp
using BAR.Domain.Articles;

namespace BAR.Domain.Ports.Queries;

public sealed record ArticleSearchPage(IReadOnlyList<Article> Items, int TotalCount);
public sealed record ArticleWithSeller(Article Article, string SellerId, int SellerStartNumber, string SellerFirstName, string SellerLastName);
public sealed record ArticleAdminSearchPage(IReadOnlyList<ArticleWithSeller> Items, int TotalCount);

public interface IArticleQueries
{
    Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);

    Task<ArticleAdminSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);
}
```

`ArticleQueries.cs`:
```csharp
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class ArticleQueries(BarDbContext dbContext) : IArticleQueries
{
    public async Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var query = dbContext.Articles.Where(a => a.SellerId == sellerId);
        query = ApplyFilters(query, brand, category, search);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await ApplySort(query, sort)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ArticleSearchPage(items, totalCount);
    }

    public async Task<ArticleAdminSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var articleQuery = dbContext.Articles.AsQueryable();
        if (sellerId is not null) articleQuery = articleQuery.Where(a => a.SellerId == sellerId);
        articleQuery = ApplyFilters(articleQuery, brand, category, search: null);

        var joined =
            from a in articleQuery
            join s in dbContext.Sellers on a.SellerId equals s.Id
            select new { Article = a, Seller = s };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            joined = joined.Where(x =>
                EF.Functions.ILike(x.Article.Number.ToString(), term) ||
                EF.Functions.ILike(x.Article.Name, term) ||
                EF.Functions.ILike(x.Article.Category, term) ||
                EF.Functions.ILike(x.Article.Brand, term) ||
                EF.Functions.ILike(x.Seller.FirstName, term) ||
                EF.Functions.ILike(x.Seller.LastName, term));
        }

        var totalCount = await joined.CountAsync(cancellationToken);

        var pageItems = await ApplySort(joined.Select(x => x.Article), sort)
            .Join(joined, a => a.Id, x => x.Article.Id, (a, x) => x)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        var startNumbers = await dbContext.NumberBlocks
            .Where(b => pageItems.Select(x => x.Seller.Id).Contains(b.SellerId))
            .GroupBy(b => b.SellerId)
            .Select(g => new { SellerId = g.Key, StartNumber = g.Min(b => b.FromNumber) })
            .ToDictionaryAsync(x => x.SellerId, x => x.StartNumber, cancellationToken);

        var result = pageItems
            .Select(x => new ArticleWithSeller(
                x.Article, x.Seller.Id, startNumbers.GetValueOrDefault(x.Seller.Id), x.Seller.FirstName, x.Seller.LastName))
            .ToList();

        return new ArticleAdminSearchPage(result, totalCount);
    }

    private static IQueryable<Article> ApplyFilters(IQueryable<Article> query, string? brand, string? category, string? search)
    {
        if (!string.IsNullOrWhiteSpace(brand)) query = query.Where(a => a.Brand == brand);
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(a =>
                EF.Functions.ILike(a.Number.ToString(), term) ||
                EF.Functions.ILike(a.Name, term) ||
                EF.Functions.ILike(a.Category, term) ||
                EF.Functions.ILike(a.Brand, term));
        }

        return query;
    }

    private static IQueryable<Article> ApplySort(IQueryable<Article> query, string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return query.OrderBy(a => a.Number);
        }

        IOrderedQueryable<Article>? ordered = null;
        foreach (var part in sort.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var pieces = part.Split(':');
            var field = pieces[0].Trim().ToLowerInvariant();
            var descending = pieces.Length > 1 && pieces[1].Trim().Equals("desc", StringComparison.OrdinalIgnoreCase);

            ordered = (ordered is null, field) switch
            {
                (true, "number") => descending ? query.OrderByDescending(a => a.Number) : query.OrderBy(a => a.Number),
                (true, "name") => descending ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name),
                (true, "category") => descending ? query.OrderByDescending(a => a.Category) : query.OrderBy(a => a.Category),
                (true, "brand") => descending ? query.OrderByDescending(a => a.Brand) : query.OrderBy(a => a.Brand),
                (true, "price") => descending ? query.OrderByDescending(a => a.Price) : query.OrderBy(a => a.Price),
                (false, "number") => descending ? ordered!.ThenByDescending(a => a.Number) : ordered!.ThenBy(a => a.Number),
                (false, "name") => descending ? ordered!.ThenByDescending(a => a.Name) : ordered!.ThenBy(a => a.Name),
                (false, "category") => descending ? ordered!.ThenByDescending(a => a.Category) : ordered!.ThenBy(a => a.Category),
                (false, "brand") => descending ? ordered!.ThenByDescending(a => a.Brand) : ordered!.ThenBy(a => a.Brand),
                (false, "price") => descending ? ordered!.ThenByDescending(a => a.Price) : ordered!.ThenBy(a => a.Price),
                _ => ordered ?? query.OrderBy(a => a.Number)
            };
        }

        return ordered ?? query.OrderBy(a => a.Number);
    }
}
```

`DependencyInjection.cs` — Zeile nach den drei Repository-Zeilen aus Task 5/6:
```csharp
        services.AddScoped<IArticleQueries, ArticleQueries>();
```
(Namespace `BAR.Infrastructure.Persistence.Queries` und `BAR.Domain.Ports.Queries` ergänzen die `using`-Liste am Kopf der Datei.)

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticleQueriesTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/Queries/IArticleQueries.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ArticleQueries.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleQueriesTests.cs
git commit -m "feat(bar-app): ArticleQueries Pagination/Filter/Sort fuer mine und Admin"
```

---

## Backend — Application

### Task 8: CreateArticleCommandHandler (inkl. Vergabe, `expectedNumber`, `nextNumber`)

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Articles/Create/CreateArticleCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Create/CreateArticleCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Create/CreateArticleResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Create/CreateArticleCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Domain/Exceptions/ArticleNumberConflictException.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Create/CreateArticleCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ArticleNumberAllocator.AllocateNext(...)` (Task 3), `IArticleRepository` (Task 5), `INumberBlockRepository.GetForSellerAsync`/`GetAllOrderedByFromNumberAsync` (bestehend), `ISettingsRepository.GetAsync` (bestehend), `IClock.UtcNow` (bestehend).
- Produces: `CreateArticleCommand(string SellerId, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description, int? ExpectedNumber)`; `CreateArticleCommandHandler.HandleAsync(CreateArticleCommand, CancellationToken) → Task<CreateArticleResult>`; `CreateArticleResult(string Id, int Number, string SellerId, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt, int? NextNumber)`.

- [ ] **Step 1: `ArticleNumberConflictException` (trägt `NextNumber` zusätzlich zu `ErrorCode`/`Detail`)**

```csharp
namespace BAR.Domain.Exceptions;

public sealed class ArticleNumberConflictException(string detail, int nextNumber)
    : ConflictException("article.number_taken", detail)
{
    public int NextNumber { get; } = nextNumber;
}
```

- [ ] **Step 2: Write failing tests**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Articles.Create;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Articles.Create;

public class CreateArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IClock> _clock = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private CreateArticleCommandHandler CreateHandler() =>
        new(_articles.Object, _blocks.Object, _settings.Object, _clock.Object);

    private void SetUpCommonMocks(string sellerId, IReadOnlyList<NumberBlock> sellerBlocks, IReadOnlyList<int> usedNumbers, IReadOnlyList<NumberBlock> allBlocks)
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
                "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(sellerBlocks);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync(allBlocks);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(usedNumbers);
        _clock.Setup(c => c.UtcNow).Returns(Now);
    }

    private static CreateArticleCommand ValidCommand(string sellerId, int? expectedNumber = null) =>
        new(sellerId, "Winterjacke", "Jako-O", "Jacken", 12.50m, "116", "rot", "kaum getragen", expectedNumber);

    [Fact]
    public async Task HandleAsync_FreeNumberInOwnBlock_CreatesArticleWithoutNewBlock()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101, 102], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        _articles.Verify(a => a.CreateAsync(
            It.Is<BAR.Domain.Articles.Article>(x => x.Number == 103),
            It.Is<NumberBlock?>(b => b == null),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_OwnBlockFull_CreatesArticleWithNewBlock()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: Enumerable.Range(101, 10).ToList(), allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(111, result.Number);
        _articles.Verify(a => a.CreateAsync(
            It.IsAny<BAR.Domain.Articles.Article>(),
            It.Is<NumberBlock?>(b => b != null && b.FromNumber == 111),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExpectedNumberDoesNotMatch_ThrowsArticleNumberConflictAndDoesNotCreate()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101], allBlocks: [block]);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ArticleNumberConflictException>(() =>
            handler.HandleAsync(ValidCommand(sellerId, expectedNumber: 999), TestContext.Current.CancellationToken));

        Assert.Equal(102, ex.NextNumber);
        Assert.Equal("article.number_taken", ex.ErrorCode);
        _articles.Verify(a => a.CreateAsync(It.IsAny<BAR.Domain.Articles.Article>(), It.IsAny<NumberBlock?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_ExpectedNumberMatches_Creates()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId, expectedNumber: 102), TestContext.Current.CancellationToken);

        Assert.Equal(102, result.Number);
    }

    [Fact]
    public async Task HandleAsync_NoFreeNumberAnywhere_ThrowsConflictNoFreeNumber()
    {
        var sellerId = "s1234567";
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);
        SetUpCommonMocks(sellerId, sellerBlocks: [], usedNumbers: [], allBlocks: [wallToWall]);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken));

        Assert.Equal("article.no_free_number", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_Success_NextNumberReflectsFollowingAllocation()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101, 102], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        Assert.Equal(104, result.NextNumber);
    }
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~CreateArticleCommandHandlerTests`
Expected: FAIL — Typen fehlen.

- [ ] **Step 4: Implement**

`CreateArticleCommand.cs`:
```csharp
namespace BAR.Application.Articles.Create;

public sealed record CreateArticleCommand(
    string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, int? ExpectedNumber);
```

`CreateArticleCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.Articles.Create;

public sealed class CreateArticleCommandValidator : AbstractValidator<CreateArticleCommand>
{
    public CreateArticleCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.Brand).NotEmpty();
        RuleFor(c => c.Category).NotEmpty();
        RuleFor(c => c.Price).GreaterThan(0).WithMessage("Preis muss größer als 0 sein");
    }
}
```

`CreateArticleResult.cs`:
```csharp
namespace BAR.Application.Articles.Create;

public sealed record CreateArticleResult(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description,
    DateTime CreatedAt, DateTime UpdatedAt, int? NextNumber);
```

`CreateArticleCommandHandler.cs`:
```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.Create;

public sealed class CreateArticleCommandHandler(
    IArticleRepository articles, INumberBlockRepository blocks, ISettingsRepository settingsRepository, IClock clock)
{
    public async Task<CreateArticleResult> HandleAsync(CreateArticleCommand command, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");

        var sellerBlocks = await blocks.GetForSellerAsync(command.SellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(command.SellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        ArticleNumberAllocation allocation;
        try
        {
            allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, command.SellerId, settings.StartNumber, settings.BlockSize, clock.UtcNow);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }

        if (command.ExpectedNumber.HasValue && command.ExpectedNumber.Value != allocation.Number)
        {
            throw new ArticleNumberConflictException(
                $"Artikelnummer {command.ExpectedNumber} ist inzwischen vergeben — neue Nummer: {allocation.Number}",
                allocation.Number);
        }

        var article = Article.Create(
            command.SellerId, allocation.Number, command.Name, command.Brand, command.Category,
            command.Price, command.Size, command.Color, command.Description, clock.UtcNow);

        await articles.CreateAsync(article, allocation.NewBlock, cancellationToken);

        var nextNumber = await TryPeekNextNumberAsync(command.SellerId, settings, allocation, cancellationToken);

        return new CreateArticleResult(
            article.Id, article.Number, article.SellerId, article.Name, article.Brand, article.Category,
            article.Price, article.Size, article.Color, article.Description,
            article.CreatedAt, article.UpdatedAt, nextNumber);
    }

    private async Task<int?> TryPeekNextNumberAsync(
        string sellerId, Domain.Settings.Settings settings, ArticleNumberAllocation justAllocated, CancellationToken cancellationToken)
    {
        var sellerBlocks = (await blocks.GetForSellerAsync(sellerId, cancellationToken)).ToList();
        var allBlocks = (await blocks.GetAllOrderedByFromNumberAsync(cancellationToken)).ToList();
        if (justAllocated.NewBlock is not null)
        {
            sellerBlocks.Add(justAllocated.NewBlock);
            allBlocks.Add(justAllocated.NewBlock);
        }

        var used = await articles.GetUsedNumbersForSellerAsync(sellerId, cancellationToken);

        try
        {
            var next = ArticleNumberAllocator.AllocateNext(sellerBlocks, used, allBlocks, sellerId, settings.StartNumber, settings.BlockSize, clock.UtcNow);
            return next.Number;
        }
        catch (NoFreeRangeException)
        {
            return null;
        }
    }
}
```

`DependencyInjection.cs` — zwei Zeilen ergänzen:
```csharp
        services.AddScoped<CreateArticleCommandHandler>();
        services.AddScoped<IValidator<CreateArticleCommand>, CreateArticleCommandValidator>();
```

- [ ] **Step 5: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~CreateArticleCommandHandlerTests`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Articles/Create/ src/advance-registration/backend/BAR.Domain/Exceptions/ArticleNumberConflictException.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Create/CreateArticleCommandHandlerTests.cs
git commit -m "feat(bar-app): CreateArticleCommandHandler mit Vergabe-Kaskade und expectedNumber-Pruefung"
```

---

### Task 9: GetNextNumberQueryHandler (Dry-Run)

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetNextNumber/NextNumberResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetNextNumber/GetNextNumberQueryHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetNextNumber/GetNextNumberQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `ArticleNumberAllocator.AllocateNext` (Task 3), `IArticleRepository.GetUsedNumbersForSellerAsync` (Task 5), `INumberBlockRepository` (bestehend), `ISettingsRepository` (bestehend).
- Produces: `GetNextNumberQueryHandler.HandleAsync(string sellerId, CancellationToken) → Task<NextNumberResult>`; `NextNumberResult(int Number)`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.Articles.GetNextNumber;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetNextNumber;

public class GetNextNumberQueryHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetNextNumberQueryHandler CreateHandler() => new(_articles.Object, _blocks.Object, _settings.Object);

    [Fact]
    public async Task HandleAsync_FreeNumberExists_ReturnsItWithoutPersisting()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
                "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([101, 102]);

        var result = await CreateHandler().HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        _blocks.Verify(b => b.AddAsync(It.IsAny<NumberBlock>(), It.IsAny<CancellationToken>()), Times.Never);
        _articles.Verify(a => a.CreateAsync(It.IsAny<BAR.Domain.Articles.Article>(), It.IsAny<NumberBlock?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoFreeRange_ThrowsConflictNoFreeNumber()
    {
        var sellerId = "s1234567";
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
                "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([wallToWall]);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateHandler().HandleAsync(sellerId, TestContext.Current.CancellationToken));

        Assert.Equal("article.no_free_number", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetNextNumberQueryHandlerTests`
Expected: FAIL.

- [ ] **Step 3: Implement**

`NextNumberResult.cs`:
```csharp
namespace BAR.Application.Articles.GetNextNumber;

public sealed record NextNumberResult(int Number);
```

`GetNextNumberQueryHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Articles;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.GetNextNumber;

public sealed class GetNextNumberQueryHandler(
    IArticleRepository articles, INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<NextNumberResult> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");

        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(sellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        try
        {
            var allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, sellerId, settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
            return new NextNumberResult(allocation.Number);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }
    }
}
```

`DependencyInjection.cs` — eine Zeile ergänzen:
```csharp
        services.AddScoped<GetNextNumberQueryHandler>();
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetNextNumberQueryHandlerTests`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Articles/GetNextNumber/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetNextNumber/GetNextNumberQueryHandlerTests.cs
git commit -m "feat(bar-app): GetNextNumberQueryHandler (Dry-Run)"
```

---

### Task 10: GetMyArticlesQueryHandler

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetMine/ArticleResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetMine/ArticleListResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetMine/GetMyArticlesQuery.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetMine/GetMyArticlesQueryHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetMine/GetMyArticlesQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `IArticleQueries.SearchMineAsync` (Task 7).
- Produces: `GetMyArticlesQuery(string SellerId, string? Brand, string? Category, string? Search, int Page, int PageSize, string? Sort)`; `GetMyArticlesQueryHandler.HandleAsync(GetMyArticlesQuery, CancellationToken) → Task<ArticleListResult>`; `ArticleListResult(IReadOnlyList<ArticleResult> Items, int TotalCount, int Page, int PageSize)`; `ArticleResult(string Id, int Number, string SellerId, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt)`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.Articles.GetMine;
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetMine;

public class GetMyArticlesQueryHandlerTests
{
    private readonly Mock<IArticleQueries> _queries = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_MapsPageToResult()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _queries.Setup(q => q.SearchMineAsync("s1", "Nike", null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleSearchPage([article], 1));
        var handler = new GetMyArticlesQueryHandler(_queries.Object);

        var result = await handler.HandleAsync(
            new GetMyArticlesQuery("s1", "Nike", null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(101, result.Items[0].Number);
        Assert.Equal(1, result.Page);
        Assert.Equal(25, result.PageSize);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetMyArticlesQueryHandlerTests`
Expected: FAIL.

- [ ] **Step 3: Implement**

`ArticleResult.cs`:
```csharp
namespace BAR.Application.Articles.GetMine;

public sealed record ArticleResult(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt);
```

`ArticleListResult.cs`:
```csharp
namespace BAR.Application.Articles.GetMine;

public sealed record ArticleListResult(IReadOnlyList<ArticleResult> Items, int TotalCount, int Page, int PageSize);
```

`GetMyArticlesQuery.cs`:
```csharp
namespace BAR.Application.Articles.GetMine;

public sealed record GetMyArticlesQuery(
    string SellerId, string? Brand, string? Category, string? Search, int Page, int PageSize, string? Sort);
```

`GetMyArticlesQueryHandler.cs`:
```csharp
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Articles.GetMine;

public sealed class GetMyArticlesQueryHandler(IArticleQueries queries)
{
    public async Task<ArticleListResult> HandleAsync(GetMyArticlesQuery query, CancellationToken cancellationToken)
    {
        var page = await queries.SearchMineAsync(
            query.SellerId, query.Brand, query.Category, query.Search, query.Page, query.PageSize, query.Sort, cancellationToken);

        var items = page.Items.Select(a => new ArticleResult(
            a.Id, a.Number, a.SellerId, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description, a.CreatedAt, a.UpdatedAt)).ToList();

        return new ArticleListResult(items, page.TotalCount, query.Page, query.PageSize);
    }
}
```

`DependencyInjection.cs` — eine Zeile ergänzen:
```csharp
        services.AddScoped<GetMyArticlesQueryHandler>();
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetMyArticlesQueryHandlerTests`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Articles/GetMine/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetMine/GetMyArticlesQueryHandlerTests.cs
git commit -m "feat(bar-app): GetMyArticlesQueryHandler"
```

---

### Task 11: UpdateArticleCommandHandler und DeleteArticleCommandHandler

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Articles/Update/UpdateArticleCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Update/UpdateArticleCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Update/UpdateArticleResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Update/UpdateArticleCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Delete/DeleteArticleCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/Delete/DeleteArticleCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Update/UpdateArticleCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Delete/DeleteArticleCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `IArticleRepository.GetByIdAsync`/`UpdateAsync`/`DeleteAsync` (Task 5), `IClock` (bestehend).
- Produces: `UpdateArticleCommand(string Id, string SellerId, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description)`; `UpdateArticleCommandHandler.HandleAsync(UpdateArticleCommand, CancellationToken) → Task<UpdateArticleResult>`; `DeleteArticleCommand(string Id, string SellerId)`; `DeleteArticleCommandHandler.HandleAsync(DeleteArticleCommand, CancellationToken) → Task`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Articles.Update;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Articles.Update;

public class UpdateArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<IClock> _clock = new();
    private static readonly DateTime Now = new(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc);

    private UpdateArticleCommandHandler CreateHandler() => new(_articles.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_OwnArticle_UpdatesFields()
    {
        var article = Article.Create("s1", 101, "Alt", "M", "K", 5m, null, null, null, Now.AddDays(-1));
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _clock.Setup(c => c.UtcNow).Returns(Now);
        var command = new UpdateArticleCommand("a1", "s1", "Neu", "N", "K2", 9m, "104", "blau", "desc");

        var result = await CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.Equal(9m, result.Price);
        _articles.Verify(a => a.UpdateAsync(article, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownArticle_ThrowsNotFound()
    {
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync((Article?)null);
        var command = new UpdateArticleCommand("a1", "s1", "Neu", "N", "K", 9m, null, null, null);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_ForeignArticle_ThrowsNotFound()
    {
        var article = Article.Create("owner", 101, "Alt", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var command = new UpdateArticleCommand("a1", "attacker", "Neu", "N", "K", 9m, null, null, null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));
    }
}
```

```csharp
using BAR.Application.Articles.Delete;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Articles.Delete;

public class DeleteArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private static readonly DateTime Now = new(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_OwnArticle_Deletes()
    {
        var article = Article.Create("s1", 101, "A", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var handler = new DeleteArticleCommandHandler(_articles.Object);

        await handler.HandleAsync(new DeleteArticleCommand("a1", "s1"), TestContext.Current.CancellationToken);

        _articles.Verify(a => a.DeleteAsync(article, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ForeignArticle_ThrowsNotFoundAndDoesNotDelete()
    {
        var article = Article.Create("owner", 101, "A", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var handler = new DeleteArticleCommandHandler(_articles.Object);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync(new DeleteArticleCommand("a1", "attacker"), TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
        _articles.Verify(a => a.DeleteAsync(It.IsAny<Article>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

- [ ] **Step 2: Run to verify both fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~UpdateArticleCommandHandlerTests|FullyQualifiedName~DeleteArticleCommandHandlerTests`
Expected: FAIL.

- [ ] **Step 3: Implement**

`UpdateArticleCommand.cs`:
```csharp
namespace BAR.Application.Articles.Update;

public sealed record UpdateArticleCommand(
    string Id, string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description);
```

`UpdateArticleCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.Articles.Update;

public sealed class UpdateArticleCommandValidator : AbstractValidator<UpdateArticleCommand>
{
    public UpdateArticleCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.Brand).NotEmpty();
        RuleFor(c => c.Category).NotEmpty();
        RuleFor(c => c.Price).GreaterThan(0).WithMessage("Preis muss größer als 0 sein");
    }
}
```

`UpdateArticleResult.cs`:
```csharp
namespace BAR.Application.Articles.Update;

public sealed record UpdateArticleResult(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt);
```

`UpdateArticleCommandHandler.cs`:
```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.Update;

public sealed class UpdateArticleCommandHandler(IArticleRepository articles, IClock clock)
{
    public async Task<UpdateArticleResult> HandleAsync(UpdateArticleCommand command, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(command.Id, cancellationToken);
        if (article is null || article.SellerId != command.SellerId)
        {
            throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");
        }

        article.Update(command.Name, command.Brand, command.Category, command.Price, command.Size, command.Color, command.Description, clock.UtcNow);
        await articles.UpdateAsync(article, cancellationToken);

        return new UpdateArticleResult(
            article.Id, article.Number, article.SellerId, article.Name, article.Brand, article.Category,
            article.Price, article.Size, article.Color, article.Description, article.CreatedAt, article.UpdatedAt);
    }
}
```

`DeleteArticleCommand.cs`:
```csharp
namespace BAR.Application.Articles.Delete;

public sealed record DeleteArticleCommand(string Id, string SellerId);
```

`DeleteArticleCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.Delete;

public sealed class DeleteArticleCommandHandler(IArticleRepository articles)
{
    public async Task HandleAsync(DeleteArticleCommand command, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(command.Id, cancellationToken);
        if (article is null || article.SellerId != command.SellerId)
        {
            throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");
        }

        await articles.DeleteAsync(article, cancellationToken);
    }
}
```

`DependencyInjection.cs` — drei Zeilen ergänzen:
```csharp
        services.AddScoped<UpdateArticleCommandHandler>();
        services.AddScoped<IValidator<UpdateArticleCommand>, UpdateArticleCommandValidator>();
        services.AddScoped<DeleteArticleCommandHandler>();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~UpdateArticleCommandHandlerTests|FullyQualifiedName~DeleteArticleCommandHandlerTests`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Articles/Update/ src/advance-registration/backend/BAR.Application/Articles/Delete/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Update/UpdateArticleCommandHandlerTests.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/Delete/DeleteArticleCommandHandlerTests.cs
git commit -m "feat(bar-app): UpdateArticleCommandHandler und DeleteArticleCommandHandler mit Ownership-Check"
```

---

### Task 12: GetAllArticlesQueryHandler und GetArticleByIdQueryHandler (Admin)

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetAll/SellerSummary.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetAll/AdminArticleResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetAll/AdminArticleListResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetAll/GetAllArticlesQuery.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetAll/GetAllArticlesQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Articles/GetById/GetArticleByIdQueryHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetAll/GetAllArticlesQueryHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetById/GetArticleByIdQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `IArticleQueries.SearchAllAsync` (Task 7), `IArticleRepository.GetByIdAsync` (Task 5), `ISellerRepository.GetByIdAsync` (bestehend), `INumberBlockRepository.GetForSellerAsync` (bestehend).
- Produces: `GetAllArticlesQuery(string? Brand, string? Category, string? Search, string? SellerId, int Page, int PageSize, string? Sort)`; `GetAllArticlesQueryHandler.HandleAsync(...) → Task<AdminArticleListResult>`; `GetArticleByIdQueryHandler.HandleAsync(string id, CancellationToken) → Task<AdminArticleResult>` (wirft `NotFoundException` bei unbekannter ID).

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.Articles.GetAll;
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetAll;

public class GetAllArticlesQueryHandlerTests
{
    private readonly Mock<IArticleQueries> _queries = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_MapsSellerInfoIntoResult()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        var withSeller = new ArticleWithSeller(article, "s1", 101, "Anna", "Beispiel");
        _queries.Setup(q => q.SearchAllAsync(null, null, null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleAdminSearchPage([withSeller], 1));
        var handler = new GetAllArticlesQueryHandler(_queries.Object);

        var result = await handler.HandleAsync(
            new GetAllArticlesQuery(null, null, null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].Seller.FirstName);
        Assert.Equal(101, result.Items[0].Seller.StartNumber);
    }
}
```

```csharp
using BAR.Application.Articles.GetById;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetById;

public class GetArticleByIdQueryHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetArticleByIdQueryHandler CreateHandler() => new(_articles.Object, _sellers.Object, _blocks.Object);

    [Fact]
    public async Task HandleAsync_KnownId_ReturnsArticleWithSeller()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000", "a@example.com", "t0000001", "hash");
        var article = Article.Create(seller.Id, 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _blocks.Setup(b => b.GetForSellerAsync(seller.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([NumberBlock.Assign(seller.Id, 101, 10, Now)]);

        var result = await CreateHandler().HandleAsync("a1", TestContext.Current.CancellationToken);

        Assert.Equal("Anna", result.Seller.FirstName);
        Assert.Equal(101, result.Seller.StartNumber);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync((Article?)null);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync("a1", TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run to verify both fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetAllArticlesQueryHandlerTests|FullyQualifiedName~GetArticleByIdQueryHandlerTests`
Expected: FAIL.

- [ ] **Step 3: Implement**

`SellerSummary.cs`:
```csharp
namespace BAR.Application.Articles.GetAll;

public sealed record SellerSummary(string Id, int StartNumber, string FirstName, string LastName);
```

`AdminArticleResult.cs`:
```csharp
namespace BAR.Application.Articles.GetAll;

public sealed record AdminArticleResult(
    string Id, int Number, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt, SellerSummary Seller);
```

`AdminArticleListResult.cs`:
```csharp
namespace BAR.Application.Articles.GetAll;

public sealed record AdminArticleListResult(IReadOnlyList<AdminArticleResult> Items, int TotalCount, int Page, int PageSize);
```

`GetAllArticlesQuery.cs`:
```csharp
namespace BAR.Application.Articles.GetAll;

public sealed record GetAllArticlesQuery(
    string? Brand, string? Category, string? Search, string? SellerId, int Page, int PageSize, string? Sort);
```

`GetAllArticlesQueryHandler.cs`:
```csharp
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Articles.GetAll;

public sealed class GetAllArticlesQueryHandler(IArticleQueries queries)
{
    public async Task<AdminArticleListResult> HandleAsync(GetAllArticlesQuery query, CancellationToken cancellationToken)
    {
        var page = await queries.SearchAllAsync(
            query.Brand, query.Category, query.Search, query.SellerId, query.Page, query.PageSize, query.Sort, cancellationToken);

        var items = page.Items.Select(x => new AdminArticleResult(
            x.Article.Id, x.Article.Number, x.Article.Name, x.Article.Brand, x.Article.Category, x.Article.Price,
            x.Article.Size, x.Article.Color, x.Article.Description, x.Article.CreatedAt, x.Article.UpdatedAt,
            new SellerSummary(x.SellerId, x.SellerStartNumber, x.SellerFirstName, x.SellerLastName))).ToList();

        return new AdminArticleListResult(items, page.TotalCount, query.Page, query.PageSize);
    }
}
```

`GetArticleByIdQueryHandler.cs`:
```csharp
using BAR.Application.Articles.GetAll;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.GetById;

public sealed class GetArticleByIdQueryHandler(IArticleRepository articles, ISellerRepository sellers, INumberBlockRepository blocks)
{
    public async Task<AdminArticleResult> HandleAsync(string id, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var seller = await sellers.GetByIdAsync(article.SellerId, cancellationToken)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var sellerBlocks = await blocks.GetForSellerAsync(seller.Id, cancellationToken);
        var startNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : 0;

        return new AdminArticleResult(
            article.Id, article.Number, article.Name, article.Brand, article.Category, article.Price,
            article.Size, article.Color, article.Description, article.CreatedAt, article.UpdatedAt,
            new SellerSummary(seller.Id, startNumber, seller.FirstName, seller.LastName));
    }
}
```

`DependencyInjection.cs` — zwei Zeilen ergänzen:
```csharp
        services.AddScoped<GetAllArticlesQueryHandler>();
        services.AddScoped<GetArticleByIdQueryHandler>();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~GetAllArticlesQueryHandlerTests|FullyQualifiedName~GetArticleByIdQueryHandlerTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Articles/GetAll/ src/advance-registration/backend/BAR.Application/Articles/GetById/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetAll/GetAllArticlesQueryHandlerTests.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Articles/GetById/GetArticleByIdQueryHandlerTests.cs
git commit -m "feat(bar-app): Admin-Query-Handler GetAllArticles/GetArticleById"
```

---

### Task 13: Brand-Handler (GetAll, Create, Update, Delete)

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/BrandResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/GetAll/GetAllBrandsQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Create/CreateBrandCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Create/CreateBrandCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Create/CreateBrandCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Update/UpdateBrandCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Update/UpdateBrandCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Update/UpdateBrandCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Brands/Delete/DeleteBrandCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Brands/Create/CreateBrandCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Brands/Update/UpdateBrandCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Brands/Delete/DeleteBrandCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `IBrandRepository` (Task 4/6).
- Produces: `BrandResult(string Id, string Name, bool Original, int? ArticleCount)`; `CreateBrandCommand(string Name, bool IsAdmin)`; `CreateBrandCommandHandler.HandleAsync(...) → Task<BrandResult>`; `UpdateBrandCommand(string Id, string Name, bool Original)`; `UpdateBrandCommandHandler.HandleAsync(...) → Task<BrandResult>`; `DeleteBrandCommandHandler.HandleAsync(string id, CancellationToken) → Task`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.MasterData.Brands.Create;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Brands.Create;

public class CreateBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_AdminCaller_SetsOriginalTrue()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Jako-O", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new CreateBrandCommand("Jako-O", IsAdmin: true), TestContext.Current.CancellationToken);

        Assert.True(result.Original);
    }

    [Fact]
    public async Task HandleAsync_SellerCaller_SetsOriginalFalse()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Nike", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new CreateBrandCommand("Nike", IsAdmin: false), TestContext.Current.CancellationToken);

        Assert.False(result.Original);
    }

    [Fact]
    public async Task HandleAsync_DuplicateName_ThrowsConflict()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("nike", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateBrandCommand("nike", IsAdmin: false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
```

```csharp
using BAR.Application.MasterData.Brands.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Brands.Update;

public class UpdateBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_RenamesAndCascades()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Neu", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new UpdateBrandCommand(brand.Id, "Neu", true), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.True(result.Original);
        _brands.Verify(b => b.UpdateAsync(brand, "Alt", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _brands.Setup(b => b.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((Brand?)null);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync(new UpdateBrandCommand("x", "Neu", true), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Belegt", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new UpdateBrandCommand(brand.Id, "Belegt", false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
```

```csharp
using BAR.Application.MasterData.Brands.Delete;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Brands.Delete;

public class DeleteBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var brand = Brand.Create("Frei", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.CountArticlesWithNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = new DeleteBrandCommandHandler(_brands.Object);

        await handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken);

        _brands.Verify(b => b.DeleteAsync(brand, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var brand = Brand.Create("Belegt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.CountArticlesWithNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = new DeleteBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken));

        Assert.Equal("brand.in_use", ex.ErrorCode);
        _brands.Verify(b => b.DeleteAsync(It.IsAny<Brand>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

- [ ] **Step 2: Run to verify all fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~MasterData.Brands`
Expected: FAIL.

- [ ] **Step 3: Implement**

`BrandResult.cs`:
```csharp
namespace BAR.Application.MasterData.Brands;

public sealed record BrandResult(string Id, string Name, bool Original, int? ArticleCount);
```

`GetAllBrandsQueryHandler.cs`:
```csharp
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.GetAll;

public sealed class GetAllBrandsQueryHandler(IBrandRepository brands)
{
    public async Task<IReadOnlyList<BrandResult>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await brands.GetAllAsync(cancellationToken);
        var result = new List<BrandResult>(all.Count);

        foreach (var brand in all)
        {
            int? count = isAdmin ? await brands.CountArticlesWithNameAsync(brand.Name, cancellationToken) : null;
            result.Add(new BrandResult(brand.Id, brand.Name, brand.Original, count));
        }

        return result;
    }
}
```

`CreateBrandCommand.cs`:
```csharp
namespace BAR.Application.MasterData.Brands.Create;

public sealed record CreateBrandCommand(string Name, bool IsAdmin);
```

`CreateBrandCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
```

`CreateBrandCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandResult> HandleAsync(CreateBrandCommand command, CancellationToken cancellationToken)
    {
        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var brand = Brand.Create(command.Name, original: command.IsAdmin);
        await brands.AddAsync(brand, cancellationToken);

        return new BrandResult(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
```

`UpdateBrandCommand.cs`:
```csharp
namespace BAR.Application.MasterData.Brands.Update;

public sealed record UpdateBrandCommand(string Id, string Name, bool Original);
```

`UpdateBrandCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.MasterData.Brands.Update;

public sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
```

`UpdateBrandCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Update;

public sealed class UpdateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandResult> HandleAsync(UpdateBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, command.Id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var oldName = brand.Name;
        brand.Rename(command.Name, command.Original);
        await brands.UpdateAsync(brand, oldName == command.Name ? null : oldName, cancellationToken);

        return new BrandResult(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
```

`DeleteBrandCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Delete;

public sealed class DeleteBrandCommandHandler(IBrandRepository brands)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        var count = await brands.CountArticlesWithNameAsync(brand.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("brand.in_use", "Marke wird noch verwendet");
        }

        await brands.DeleteAsync(brand, cancellationToken);
    }
}
```

`DependencyInjection.cs` — Zeilen ergänzen:
```csharp
        services.AddScoped<GetAllBrandsQueryHandler>();
        services.AddScoped<CreateBrandCommandHandler>();
        services.AddScoped<IValidator<CreateBrandCommand>, CreateBrandCommandValidator>();
        services.AddScoped<UpdateBrandCommandHandler>();
        services.AddScoped<IValidator<UpdateBrandCommand>, UpdateBrandCommandValidator>();
        services.AddScoped<DeleteBrandCommandHandler>();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~MasterData.Brands`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/MasterData/Brands/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Brands/
git commit -m "feat(bar-app): Brand-Handler (GetAll, Create, Update, Delete)"
```

---

### Task 14: Category-Handler (GetAll, Create, Update, Delete)

Identisch zu Task 13, `Brand`→`Category`, `brand.in_use`→`category.in_use`, Namespace `BAR.Application.MasterData.Categories`.

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/CategoryResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/GetAll/GetAllCategoriesQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Create/CreateCategoryCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Create/CreateCategoryCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Create/CreateCategoryCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Update/UpdateCategoryCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Update/UpdateCategoryCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Update/UpdateCategoryCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/MasterData/Categories/Delete/DeleteCategoryCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Categories/Create/CreateCategoryCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Categories/Update/UpdateCategoryCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Categories/Delete/DeleteCategoryCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ICategoryRepository` (Task 4/6).
- Produces: `CategoryResult(string Id, string Name, bool Original, int? ArticleCount)`; `CreateCategoryCommandHandler.HandleAsync(CreateCategoryCommand, CancellationToken) → Task<CategoryResult>`; `UpdateCategoryCommandHandler.HandleAsync(UpdateCategoryCommand, CancellationToken) → Task<CategoryResult>`; `DeleteCategoryCommandHandler.HandleAsync(string id, CancellationToken) → Task`.

- [ ] **Step 1: Write failing tests** (drei Dateien, 1:1 Übertragung der drei Brand-Testdateien aus Task 13 mit `Category`/`ICategoryRepository`/`category.in_use` statt `Brand`/`IBrandRepository`/`brand.in_use`; Beispiel Create-Test-Datei)

```csharp
using BAR.Application.MasterData.Categories.Create;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Categories.Create;

public class CreateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();

    [Fact]
    public async Task HandleAsync_AdminCaller_SetsOriginalTrue()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Jacken", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(new CreateCategoryCommand("Jacken", IsAdmin: true), TestContext.Current.CancellationToken);

        Assert.True(result.Original);
    }

    [Fact]
    public async Task HandleAsync_SellerCaller_SetsOriginalFalse()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Schuhe", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(new CreateCategoryCommand("Schuhe", IsAdmin: false), TestContext.Current.CancellationToken);

        Assert.False(result.Original);
    }

    [Fact]
    public async Task HandleAsync_DuplicateName_ThrowsConflict()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("jacken", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateCategoryCommand("jacken", IsAdmin: false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
```

Die zwei übrigen Testdateien (`Update`, `Delete`) entstehen durch dieselbe Übertragung wie oben beschrieben — `Update` mit den drei Fällen „Renamed+Cascade", „UnknownId→NotFound", „NameTakenByOther→Conflict"; `Delete` mit „Unused→Deletes" und „InUse→Conflict `category.in_use`".

- [ ] **Step 2: Run to verify all fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~MasterData.Categories`
Expected: FAIL.

- [ ] **Step 3: Implement**

`CategoryResult.cs`:
```csharp
namespace BAR.Application.MasterData.Categories;

public sealed record CategoryResult(string Id, string Name, bool Original, int? ArticleCount);
```

`GetAllCategoriesQueryHandler.cs`:
```csharp
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.GetAll;

public sealed class GetAllCategoriesQueryHandler(ICategoryRepository categories)
{
    public async Task<IReadOnlyList<CategoryResult>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await categories.GetAllAsync(cancellationToken);
        var result = new List<CategoryResult>(all.Count);

        foreach (var category in all)
        {
            int? count = isAdmin ? await categories.CountArticlesWithNameAsync(category.Name, cancellationToken) : null;
            result.Add(new CategoryResult(category.Id, category.Name, category.Original, count));
        }

        return result;
    }
}
```

`CreateCategoryCommand.cs`:
```csharp
namespace BAR.Application.MasterData.Categories.Create;

public sealed record CreateCategoryCommand(string Name, bool IsAdmin);
```

`CreateCategoryCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.MasterData.Categories.Create;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
```

`CreateCategoryCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Create;

public sealed class CreateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryResult> HandleAsync(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var category = Category.Create(command.Name, original: command.IsAdmin);
        await categories.AddAsync(category, cancellationToken);

        return new CategoryResult(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
```

`UpdateCategoryCommand.cs`:
```csharp
namespace BAR.Application.MasterData.Categories.Update;

public sealed record UpdateCategoryCommand(string Id, string Name, bool Original);
```

`UpdateCategoryCommandValidator.cs`:
```csharp
using FluentValidation;

namespace BAR.Application.MasterData.Categories.Update;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
```

`UpdateCategoryCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Update;

public sealed class UpdateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryResult> HandleAsync(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, command.Id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var oldName = category.Name;
        category.Rename(command.Name, command.Original);
        await categories.UpdateAsync(category, oldName == command.Name ? null : oldName, cancellationToken);

        return new CategoryResult(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
```

`DeleteCategoryCommandHandler.cs`:
```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Delete;

public sealed class DeleteCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        var count = await categories.CountArticlesWithNameAsync(category.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("category.in_use", "Kategorie wird noch verwendet");
        }

        await categories.DeleteAsync(category, cancellationToken);
    }
}
```

`DependencyInjection.cs` — Zeilen ergänzen:
```csharp
        services.AddScoped<GetAllCategoriesQueryHandler>();
        services.AddScoped<CreateCategoryCommandHandler>();
        services.AddScoped<IValidator<CreateCategoryCommand>, CreateCategoryCommandValidator>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<IValidator<UpdateCategoryCommand>, UpdateCategoryCommandValidator>();
        services.AddScoped<DeleteCategoryCommandHandler>();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~MasterData.Categories`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/MasterData/Categories/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/MasterData/Categories/
git commit -m "feat(bar-app): Category-Handler (GetAll, Create, Update, Delete)"
```

---

## Backend — Host

### Task 15: DomainExceptionHandler um `nextNumber`-Extension erweitern, ArticlesEndpoints

**Files:**
- Modify: `src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/Articles/ArticlesEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/DomainExceptionHandlerTests.cs` (erweitern)
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/ArticlesEndpointsTests.cs`

**Interfaces:**
- Consumes: alle Application-Handler aus Task 8-12, `ArticleNumberConflictException` (Task 8).
- Produces: HTTP-Routen `GET /api/articles/mine`, `GET /api/articles/next-number`, `POST /api/articles`, `PUT /api/articles/{id}`, `DELETE /api/articles/{id}`, `GET /api/articles` (admin), `GET /api/articles/{id}` (admin).

- [ ] **Step 1: Write failing test für die `nextNumber`-Extension**

In `DomainExceptionHandlerTests.cs` (Datei existiert bereits — Testmethode ergänzen, exakter bestehender Aufbau vorher lesen und Muster übernehmen):

```csharp
[Fact]
public async Task TryHandleAsync_ArticleNumberConflictException_AddsNextNumberExtension()
{
    var handler = new DomainExceptionHandler();
    var httpContext = new DefaultHttpContext();
    httpContext.Response.Body = new MemoryStream();

    var handled = await handler.TryHandleAsync(
        httpContext, new BAR.Domain.Exceptions.ArticleNumberConflictException("Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105", 105),
        TestContext.Current.CancellationToken);

    Assert.True(handled);
    httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
    var json = await new StreamReader(httpContext.Response.Body).ReadToEndAsync(TestContext.Current.CancellationToken);
    Assert.Contains("\"nextNumber\":105", json);
    Assert.Equal(409, httpContext.Response.StatusCode);
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~DomainExceptionHandlerTests`
Expected: FAIL — Extension `nextNumber` fehlt im JSON.

- [ ] **Step 3: `DomainExceptionHandler.cs` erweitern**

Nach der Zeile `problemDetails.Extensions["errorCode"] = domainException.ErrorCode;` ergänzen:

```csharp
        if (domainException is BAR.Domain.Exceptions.ArticleNumberConflictException numberConflict)
        {
            problemDetails.Extensions["nextNumber"] = numberConflict.NextNumber;
        }
```

- [ ] **Step 4: Run to verify Step-1-Test passt**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~DomainExceptionHandlerTests`
Expected: PASS.

- [ ] **Step 5: Write failing Endpoint-Integrationstests**

```csharp
using System.Net;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Articles;

public class ArticlesEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticlesEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetMine_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateThenGetMine_AuthenticatedSeller_RoundTrips()
    {
        var client = await AuthenticatedClientFactory.CreateSellerClientAsync(_factory, TestContext.Current.CancellationToken);

        var createResponse = await client.PostAsJsonAsync("/api/articles", new
        {
            name = "Winterjacke", brand = "Jako-O", category = "Jacken", price = 12.50m,
            size = "116", color = "rot", description = "kaum getragen"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var mineResponse = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);
        var body = await mineResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Contains("Winterjacke", body);
    }

    [Fact]
    public async Task Update_ForeignArticle_Returns404()
    {
        var owner = await AuthenticatedClientFactory.CreateSellerClientAsync(_factory, TestContext.Current.CancellationToken);
        var attacker = await AuthenticatedClientFactory.CreateSellerClientAsync(_factory, TestContext.Current.CancellationToken);
        var created = await owner.PostAsJsonAsync("/api/articles", new
        {
            name = "A", brand = "B", category = "C", price = 1m
        }, TestContext.Current.CancellationToken);
        var createdBody = await created.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        var id = createdBody.GetProperty("id").GetString();

        var response = await attacker.PutAsJsonAsync($"/api/articles/{id}", new
        {
            name = "Neu", brand = "B", category = "C", price = 1m
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

**Hinweis für den Ausführenden:** `AuthenticatedClientFactory.CreateSellerClientAsync` und `using System.Text.Json;` (`JsonElement`) müssen ggf. an bestehende Test-Helfer angepasst werden — vor dem Schreiben `tests/BAR.Host.IntegrationTests/Features/Auth/AuthEndpointsTests.cs` lesen und den dortigen Login/Registrierungs-Helfer für authentifizierte Requests wiederverwenden statt einen neuen zu erfinden, falls einer existiert.

- [ ] **Step 6: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticlesEndpointsTests`
Expected: FAIL — Route `/api/articles/...` existiert nicht (404 statt erwartetem Status).

- [ ] **Step 7: Implement `ArticlesEndpoints.cs`**

```csharp
using System.Security.Claims;
using BAR.Application.Articles.Create;
using BAR.Application.Articles.Delete;
using BAR.Application.Articles.GetAll;
using BAR.Application.Articles.GetById;
using BAR.Application.Articles.GetMine;
using BAR.Application.Articles.GetNextNumber;
using BAR.Application.Articles.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.Articles;

public static class ArticlesEndpoints
{
    public static IEndpointRouteBuilder MapArticlesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine", async (
            ClaimsPrincipal user, string? brand, string? category, string? search,
            int page, int pageSize, string? sort, GetMyArticlesQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await handler.HandleAsync(
                new GetMyArticlesQuery(sellerId, brand, category, search, page == 0 ? 1 : page, pageSize == 0 ? 25 : pageSize, sort), ct);
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/articles/next-number", async (ClaimsPrincipal user, GetNextNumberQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPost("/api/articles", async (
            ClaimsPrincipal user, CreateArticleRequest request, CreateArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var command = new CreateArticleCommand(
                sellerId, request.Name, request.Brand, request.Category, request.Price,
                request.Size, request.Color, request.Description, request.ExpectedNumber);
            var result = await handler.HandleAsync(command, ct);
            return Results.Created($"/api/articles/{result.Id}", result);
        }).RequireAuthorization();

        app.MapPut("/api/articles/{id}", async (
            ClaimsPrincipal user, string id, UpdateArticleRequest request, UpdateArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var command = new UpdateArticleCommand(
                id, sellerId, request.Name, request.Brand, request.Category, request.Price,
                request.Size, request.Color, request.Description);
            return Results.Ok(await handler.HandleAsync(command, ct));
        }).RequireAuthorization();

        app.MapDelete("/api/articles/{id}", async (ClaimsPrincipal user, string id, DeleteArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await handler.HandleAsync(new DeleteArticleCommand(id, sellerId), ct);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapGet("/api/articles", async (
            string? brand, string? category, string? search, string? sellerId,
            int page, int pageSize, string? sort, GetAllArticlesQueryHandler handler, CancellationToken ct) =>
        {
            var query = new GetAllArticlesQuery(brand, category, search, sellerId, page == 0 ? 1 : page, pageSize == 0 ? 25 : pageSize, sort);
            return Results.Ok(await handler.HandleAsync(query, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/articles/{id}", async (string id, GetArticleByIdQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(id, ct))
        ).RequireAuthorization("admin");

        return app;
    }
}

public sealed record CreateArticleRequest(
    string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, int? ExpectedNumber);

public sealed record UpdateArticleRequest(
    string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description);
```

`Program.cs` — `using BAR.Host.Features.Articles;` ergänzen und nach `app.MapBlocksEndpoints();`:
```csharp
app.MapArticlesEndpoints();
```

- [ ] **Step 8: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticlesEndpointsTests`
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs src/advance-registration/backend/BAR.Host/Features/Articles/ src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/DomainExceptionHandlerTests.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/
git commit -m "feat(bar-app): Articles-Endpoints und nextNumber-Extension im DomainExceptionHandler"
```

---

### Task 16: BrandsEndpoints und CategoriesEndpoints

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/MasterData/BrandsEndpoints.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/MasterData/CategoriesEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/MasterData/BrandsEndpointsTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/MasterData/CategoriesEndpointsTests.cs`

**Interfaces:**
- Consumes: Handler aus Task 13/14.
- Produces: `GET`/`POST /api/brands`, `PUT`/`DELETE /api/brands/{id}`; identisch für `/api/categories`.

- [ ] **Step 1: Write failing tests** (Brand gezeigt, Category identisch mit `/api/categories`)

```csharp
using System.Net;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.MasterData;

public class BrandsEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BrandsEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Post_AuthenticatedSeller_Creates201WithOriginalFalse()
    {
        var client = await AuthenticatedClientFactory.CreateSellerClientAsync(_factory, TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync("/api/brands", new { name = $"Nike-{Guid.NewGuid():N}" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"original\":false", body);
    }

    [Fact]
    public async Task Put_AsSeller_Returns403()
    {
        var client = await AuthenticatedClientFactory.CreateSellerClientAsync(_factory, TestContext.Current.CancellationToken);
        var created = await client.PostAsJsonAsync("/api/brands", new { name = $"X-{Guid.NewGuid():N}" }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.PutAsJsonAsync($"/api/brands/{id}", new { name = "Y", original = true }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/brands", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
```

`CategoriesEndpointsTests.cs`: dieselben drei Tests, `/api/brands` → `/api/categories`, `Nike-`/`X-` → beliebige Kategorienamen.

- [ ] **Step 2: Run to verify all fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~BrandsEndpointsTests|FullyQualifiedName~CategoriesEndpointsTests`
Expected: FAIL — Routen fehlen.

- [ ] **Step 3: Implement**

`BrandsEndpoints.cs`:
```csharp
using System.Security.Claims;
using BAR.Application.MasterData.Brands.Create;
using BAR.Application.MasterData.Brands.Delete;
using BAR.Application.MasterData.Brands.GetAll;
using BAR.Application.MasterData.Brands.Update;

namespace BAR.Host.Features.MasterData;

public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrandsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/brands", async (ClaimsPrincipal user, GetAllBrandsQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/brands", async (ClaimsPrincipal user, CreateBrandRequest request, CreateBrandCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new CreateBrandCommand(request.Name, user.IsInRole("admin")), ct);
            return Results.Created($"/api/brands/{result.Id}", result);
        }).RequireAuthorization();

        app.MapPut("/api/brands/{id}", async (string id, UpdateBrandRequest request, UpdateBrandCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(new UpdateBrandCommand(id, request.Name, request.Original), ct))
        ).RequireAuthorization("admin");

        app.MapDelete("/api/brands/{id}", async (string id, DeleteBrandCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}

public sealed record CreateBrandRequest(string Name);
public sealed record UpdateBrandRequest(string Name, bool Original);
```

`CategoriesEndpoints.cs`:
```csharp
using System.Security.Claims;
using BAR.Application.MasterData.Categories.Create;
using BAR.Application.MasterData.Categories.Delete;
using BAR.Application.MasterData.Categories.GetAll;
using BAR.Application.MasterData.Categories.Update;

namespace BAR.Host.Features.MasterData;

public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (ClaimsPrincipal user, GetAllCategoriesQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/categories", async (ClaimsPrincipal user, CreateCategoryRequest request, CreateCategoryCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new CreateCategoryCommand(request.Name, user.IsInRole("admin")), ct);
            return Results.Created($"/api/categories/{result.Id}", result);
        }).RequireAuthorization();

        app.MapPut("/api/categories/{id}", async (string id, UpdateCategoryRequest request, UpdateCategoryCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(new UpdateCategoryCommand(id, request.Name, request.Original), ct))
        ).RequireAuthorization("admin");

        app.MapDelete("/api/categories/{id}", async (string id, DeleteCategoryCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}

public sealed record CreateCategoryRequest(string Name);
public sealed record UpdateCategoryRequest(string Name, bool Original);
```

`Program.cs` — `using BAR.Host.Features.MasterData;` ergänzen und nach `app.MapArticlesEndpoints();`:
```csharp
app.MapBrandsEndpoints();
app.MapCategoriesEndpoints();
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~BrandsEndpointsTests|FullyQualifiedName~CategoriesEndpointsTests`
Expected: PASS (6 tests)

- [ ] **Step 5: Volle Backend-Testsuite laufen lassen**

Run: `dotnet test src/advance-registration/backend/BAR.slnx`
Expected: alle Tests PASS (Domain, Application, Host-Integration, Architecture).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/MasterData/ src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/MasterData/
git commit -m "feat(bar-app): Brands- und CategoriesEndpoints"
```

---

## Frontend

### Task 17: ArticlesApiService und MasterDataApiService

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.spec.ts`

**Interfaces:**
- Produces: `ArticlesApiService.getMine() → Observable<ArticleListResponse>`; `.getNextNumber() → Observable<{ number: number }>`; `.create(payload: CreateArticlePayload) → Observable<ArticleResponse & { nextNumber?: number }>`; `.update(id: string, payload: UpdateArticlePayload) → Observable<ArticleResponse>`; `.delete(id: string) → Observable<void>`. `MasterDataApiService.getAll(resource: 'brands' | 'categories') → Observable<MasterDataItem[]>`; `.create(resource, name: string) → Observable<MasterDataItem>`. `MasterDataItem { id: string; name: string; original: boolean }`.

- [ ] **Step 1: Write failing tests**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticlesApiService } from './articles-api.service';

describe('ArticlesApiService', () => {
  let service: ArticlesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ArticlesApiService]
    });
    service = TestBed.inject(ArticlesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMine() requests /api/articles/mine', () => {
    let result: unknown;
    service.getMine().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/mine');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });

    expect(result).toEqual({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('getNextNumber() requests /api/articles/next-number', () => {
    let result: { number: number } | undefined;
    service.getNextNumber().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/next-number');
    expect(req.request.method).toBe('GET');
    req.flush({ number: 104 });

    expect(result).toEqual({ number: 104 });
  });

  it('create() posts payload to /api/articles', () => {
    const payload = { name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5, expectedNumber: 104 };
    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/articles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'a1', number: 104 });
  });

  it('update() puts payload to /api/articles/:id', () => {
    const payload = { name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 };
    service.update('a1', payload).subscribe();

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 'a1' });
  });

  it('delete() deletes /api/articles/:id', () => {
    service.delete('a1').subscribe();

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
```

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MasterDataApiService } from './master-data-api.service';

describe('MasterDataApiService', () => {
  let service: MasterDataApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), MasterDataApiService]
    });
    service = TestBed.inject(MasterDataApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll("brands") requests /api/brands', () => {
    service.getAll('brands').subscribe();

    const req = httpMock.expectOne('/api/brands');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAll("categories") requests /api/categories', () => {
    service.getAll('categories').subscribe();

    const req = httpMock.expectOne('/api/categories');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create("brands", name) posts to /api/brands', () => {
    service.create('brands', 'Nike').subscribe();

    const req = httpMock.expectOne('/api/brands');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Nike' });
    req.flush({ id: 'b1', name: 'Nike', original: false });
  });
});
```

- [ ] **Step 2: Run to verify both fail**

Run (dev-mcp `test_angular_project` bzw. `ng test`): `npx vitest run src/app/features/my-articles/articles-api.service.spec.ts src/app/features/my-articles/master-data-api.service.spec.ts` (im Ordner `src/advance-registration/frontend/BAR.App`)
Expected: FAIL — Services fehlen.

- [ ] **Step 3: Implement**

`articles-api.service.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ArticleResponse {
  id: string;
  number: number;
  sellerId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleResponse extends ArticleResponse {
  nextNumber?: number;
}

export interface ArticleListResponse {
  items: ArticleResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ArticlePayload {
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string;
  color?: string;
  description?: string;
}

export interface CreateArticlePayload extends ArticlePayload {
  expectedNumber?: number;
}

@Injectable({ providedIn: 'root' })
export class ArticlesApiService {
  private readonly http = inject(HttpClient);

  getMine(): Observable<ArticleListResponse> {
    return this.http.get<ArticleListResponse>('/api/articles/mine');
  }

  getNextNumber(): Observable<{ number: number }> {
    return this.http.get<{ number: number }>('/api/articles/next-number');
  }

  create(payload: CreateArticlePayload): Observable<CreateArticleResponse> {
    return this.http.post<CreateArticleResponse>('/api/articles', payload);
  }

  update(id: string, payload: ArticlePayload): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`/api/articles/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/articles/${id}`);
  }
}
```

`master-data-api.service.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type MasterDataResource = 'brands' | 'categories';

export interface MasterDataItem {
  id: string;
  name: string;
  original: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterDataApiService {
  private readonly http = inject(HttpClient);

  getAll(resource: MasterDataResource): Observable<MasterDataItem[]> {
    return this.http.get<MasterDataItem[]>(`/api/${resource}`);
  }

  create(resource: MasterDataResource, name: string): Observable<MasterDataItem> {
    return this.http.post<MasterDataItem>(`/api/${resource}`, { name });
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/app/features/my-articles/articles-api.service.spec.ts src/app/features/my-articles/master-data-api.service.spec.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.spec.ts src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.spec.ts
git commit -m "feat(bar-app): ArticlesApiService und MasterDataApiService"
```

---

### Task 18: `autocomplete-create` Shared-Component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/autocomplete-create/autocomplete-create.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/autocomplete-create/autocomplete-create.spec.ts`

**Interfaces:**
- Consumes: `MasterDataItem { id: string; name: string; original: boolean }` (Task 17, aber nur der Typ — keine Service-Abhängigkeit, siehe unten).
- Produces: `AutocompleteCreate` Component. Inputs: `items = input.required<MasterDataItem[]>()`, `createFn = input.required<(name: string) => Observable<MasterDataItem>>()`, `label = input<string>('')`. Two-way: `value = model<string>('')`. Output: `itemCreated = output<MasterDataItem>()` (Parent hängt den neu angelegten Eintrag an seine `items`-Liste an — die Komponente selbst hält keinen eigenen State über die Liste hinaus, damit sie nicht weiß, woher `items` kommt: **kein** direkter Import von `MasterDataApiService`, nur der Typ `MasterDataItem` — Kopplung Shared→Feature würde sonst die Schichtung verletzen).

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AutocompleteCreate } from './autocomplete-create';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

const ITEMS: MasterDataItem[] = [
  { id: 'b1', name: 'Nike', original: true },
  { id: 'b2', name: 'Adidas', original: false }
];

function create(items: MasterDataItem[] = ITEMS) {
  const fixture = TestBed.createComponent(AutocompleteCreate);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('createFn', vi.fn());
  fixture.detectChanges();
  return fixture;
}

describe('AutocompleteCreate', () => {
  it('filters suggestions case-insensitively by typed query', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    component.onFilter('nik');

    expect(component.suggestions()).toEqual([ITEMS[0]]);
  });

  it('shows all items when query is empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    component.onFilter('');

    expect(component.suggestions()).toEqual(ITEMS);
  });

  it('isCreateMode() is false for an exact existing match', () => {
    const fixture = create();
    fixture.componentInstance.value.set('Nike');

    expect(fixture.componentInstance.isCreateMode()).toBe(false);
  });

  it('isCreateMode() is true for a value with no exact match', () => {
    const fixture = create();
    fixture.componentInstance.value.set('Puma');

    expect(fixture.componentInstance.isCreateMode()).toBe(true);
  });

  it('isCreateMode() is false for an empty value', () => {
    const fixture = create();
    fixture.componentInstance.value.set('');

    expect(fixture.componentInstance.isCreateMode()).toBe(false);
  });

  it('confirmCreate() calls createFn, emits itemCreated and sets value to the new name', () => {
    const fixture = create();
    const created: MasterDataItem = { id: 'b3', name: 'Puma', original: false };
    fixture.componentRef.setInput('createFn', () => of(created));
    fixture.componentInstance.value.set('Puma');
    const emitted: MasterDataItem[] = [];
    fixture.componentInstance.itemCreated.subscribe((i) => emitted.push(i));

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.value()).toBe('Puma');
    expect(fixture.componentInstance.createModalOpen()).toBe(false);
  });

  it('confirmCreate() on 409 shows an error in the modal and keeps it open', () => {
    const fixture = create();
    fixture.componentRef.setInput('createFn', () =>
      throwError(() => ({ status: 409, error: { detail: 'Puma existiert bereits' } })));
    fixture.componentInstance.value.set('Puma');

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(fixture.componentInstance.createModalOpen()).toBe(true);
    expect(fixture.componentInstance.createModalError()).toBe('Puma existiert bereits');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/autocomplete-create/autocomplete-create.spec.ts`
Expected: FAIL — Komponente fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, model, input, output, signal } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Observable } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

@Component({
  selector: 'app-autocomplete-create',
  imports: [AutoCompleteModule, DialogModule, ButtonModule, InputTextModule],
  template: `
    <p-autoComplete
      [(ngModel)]="valueModel"
      [suggestions]="suggestions()"
      field="name"
      [dropdown]="true"
      (completeMethod)="onFilter($event.query)"
      (onSelect)="onSelect($event)"
    />
    @if (isCreateMode()) {
      <button pButton type="button" icon="pi pi-plus" class="p-button-success" (click)="openCreateModal()"></button>
    }

    <p-dialog [(visible)]="createModalOpenModel" [modal]="true" [header]="'Neuer Eintrag: ' + value()">
      @if (createModalError()) {
        <p class="error">{{ createModalError() }}</p>
      }
      <button pButton type="button" label="Abbrechen" class="p-button-text" (click)="cancelCreate()"></button>
      <button pButton type="button" label="Anlegen" (click)="confirmCreate()"></button>
    </p-dialog>
  `
})
export class AutocompleteCreate {
  readonly items = input.required<MasterDataItem[]>();
  readonly createFn = input.required<(name: string) => Observable<MasterDataItem>>();
  readonly label = input<string>('');
  readonly value = model<string>('');
  readonly itemCreated = output<MasterDataItem>();

  readonly suggestions = signal<MasterDataItem[]>([]);
  readonly createModalOpen = signal(false);
  readonly createModalError = signal<string | null>(null);

  get valueModel() { return this.value(); }
  set valueModel(v: string) { this.value.set(v); }

  get createModalOpenModel() { return this.createModalOpen(); }
  set createModalOpenModel(v: boolean) { this.createModalOpen.set(v); }

  readonly isCreateMode = computed(() => {
    const current = this.value().trim();
    if (!current) return false;
    return !this.items().some((i) => i.name === current);
  });

  onFilter(query: string): void {
    const normalized = query.trim().toLowerCase();
    this.suggestions.set(
      normalized ? this.items().filter((i) => i.name.toLowerCase().includes(normalized)) : this.items()
    );
  }

  onSelect(item: MasterDataItem): void {
    this.value.set(item.name);
  }

  openCreateModal(): void {
    this.createModalError.set(null);
    this.createModalOpen.set(true);
  }

  cancelCreate(): void {
    this.createModalOpen.set(false);
  }

  confirmCreate(): void {
    this.createFn()(this.value().trim()).subscribe({
      next: (created) => {
        this.itemCreated.emit(created);
        this.value.set(created.name);
        this.createModalOpen.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.createModalError.set(
          err.status === 409 ? (err.error?.detail ?? 'Eintrag existiert bereits') : 'Anlegen fehlgeschlagen'
        );
      }
    });
  }
}
```

**Hinweis für den Ausführenden:** `[(ngModel)]` auf `p-autoComplete` braucht `FormsModule` im `imports`-Array — beim Implementieren ergänzen (`import { FormsModule } from '@angular/forms';`, `imports: [AutoCompleteModule, DialogModule, ButtonModule, InputTextModule, FormsModule]`), sonst kompiliert das Template nicht.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/app/shared/autocomplete-create/autocomplete-create.spec.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/autocomplete-create/
git commit -m "feat(bar-app): autocomplete-create Shared-Component"
```

---

### Task 19: `artikel-dialog` Component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/artikel-dialog.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/artikel-dialog.spec.ts`

**Interfaces:**
- Consumes: `ArticlesApiService` (Task 17), `AutocompleteCreate` (Task 18), `ArticleResponse`/`ArticlePayload`/`MasterDataItem` (Task 17).
- Produces: `ArtikelDialog` Component. Inputs: `visible = model<boolean>(false)`, `mode = input.required<'create' | 'edit'>()`, `article = input<ArticleResponse | null>(null)`, `initialNumber = input<number | null>(null)`, `brands = input.required<MasterDataItem[]>()`, `categories = input.required<MasterDataItem[]>()`. Outputs: `saved = output<void>()`, `deleted = output<void>()`, `brandCreated = output<MasterDataItem>()`, `categoryCreated = output<MasterDataItem>()`. Öffentliche Signals für Tests: `name`, `brand`, `category`, `size`, `color`, `price`, `description`, `isValid`, `errorMessage`, `deleteConfirmVisible`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ArtikelDialog } from './artikel-dialog';
import { ArticlesApiService } from '../articles-api.service';

function create() {
  const fixture = TestBed.createComponent(ArtikelDialog);
  fixture.componentRef.setInput('mode', 'create');
  fixture.componentRef.setInput('article', null);
  fixture.componentRef.setInput('initialNumber', 104);
  fixture.componentRef.setInput('brands', []);
  fixture.componentRef.setInput('categories', []);
  fixture.componentRef.setInput('visible', true);
  fixture.detectChanges();
  return fixture;
}

describe('ArtikelDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
  });

  it('isValid() is false when a required field is empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is false when price is not greater than 0', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(0);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is true when all required fields are filled and price > 0', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(true);
  });

  it('save() in create mode posts via ArticlesApiService and emits saved on success', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as never));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);
    const emitted: void[] = [];
    component.saved.subscribe(() => emitted.push(undefined));

    component.save();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
  });

  it('save() on 409 keeps the dialog open and sets errorMessage', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105' } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);

    component.save();

    expect(component.visible()).toBe(true);
    expect(component.errorMessage()).toBe('Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105');
  });

  it('confirmDelete() deletes via ArticlesApiService and emits deleted', () => {
    const fixture = create();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('article', { id: 'a1', number: 104, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 } as never);
    fixture.detectChanges();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    const component = fixture.componentInstance;
    const emitted: void[] = [];
    component.deleted.subscribe(() => emitted.push(undefined));

    component.confirmDelete();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/my-articles/components/artikel-dialog.spec.ts`
Expected: FAIL — Komponente fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AutocompleteCreate } from '../../../shared/autocomplete-create/autocomplete-create';
import { ArticlesApiService, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';

@Component({
  selector: 'app-artikel-dialog',
  imports: [
    FormsModule, DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule,
    InputNumberModule, ButtonModule, TextareaModule, AutocompleteCreate
  ],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="mode() === 'create' ? 'Artikel anlegen' : 'Artikel bearbeiten'">
      <label>Artikelnummer</label>
      <input pInputText [value]="number()" [readonly]="true" />
      @if (mode() === 'create') {
        <p class="hint">wird beim Speichern endgültig vergeben</p>
      }

      <label>Bezeichnung</label>
      <input pInputText [(ngModel)]="nameModel" />

      <label>Kategorie</label>
      <app-autocomplete-create [items]="categories()" [(value)]="categoryModel" [createFn]="createCategoryFn" (itemCreated)="categoryCreated.emit($event)" />

      <label>Marke</label>
      <app-autocomplete-create [items]="brands()" [(value)]="brandModel" [createFn]="createBrandFn" (itemCreated)="brandCreated.emit($event)" />

      <label>Größe</label>
      <input pInputText [(ngModel)]="sizeModel" />

      <label>Farbe</label>
      <input pInputText [(ngModel)]="colorModel" />

      <label>Preis</label>
      <p-inputgroup>
        <p-inputnumber [(ngModel)]="priceModel" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" />
        <p-inputgroupaddon>€</p-inputgroupaddon>
      </p-inputgroup>

      <label>Beschreibung</label>
      <textarea pTextarea [(ngModel)]="descriptionModel"></textarea>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <div class="footer">
        @if (mode() === 'edit') {
          <button pButton type="button" label="Löschen" class="p-button-danger" (click)="deleteConfirmVisible.set(true)"></button>
        }
        <button pButton type="button" label="Abbrechen" class="p-button-text" (click)="visible.set(false)"></button>
        <button pButton type="button" label="Speichern" [disabled]="!isValid() || saving()" (click)="save()"></button>
      </div>
    </p-dialog>

    <p-dialog [(visible)]="deleteConfirmVisibleModel" [modal]="true" header="Artikel wirklich löschen?">
      <button pButton type="button" label="Abbrechen" class="p-button-text" (click)="deleteConfirmVisible.set(false)"></button>
      <button pButton type="button" label="Löschen" class="p-button-danger" (click)="confirmDelete()"></button>
    </p-dialog>
  `
})
export class ArtikelDialog {
  private readonly articlesApi = inject(ArticlesApiService);

  readonly visible = model<boolean>(false);
  readonly mode = input.required<'create' | 'edit'>();
  readonly article = input<ArticleResponse | null>(null);
  readonly initialNumber = input<number | null>(null);
  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();

  readonly saved = output<void>();
  readonly deleted = output<void>();
  readonly brandCreated = output<MasterDataItem>();
  readonly categoryCreated = output<MasterDataItem>();

  readonly number = signal<number | null>(null);
  readonly name = signal('');
  readonly brand = signal('');
  readonly category = signal('');
  readonly size = signal('');
  readonly color = signal('');
  readonly price = signal<number | null>(null);
  readonly description = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly deleteConfirmVisible = signal(false);

  private readonly masterDataApi = inject(MasterDataApiService);
  readonly createBrandFn = (name: string) => this.masterDataApi.create('brands', name);
  readonly createCategoryFn = (name: string) => this.masterDataApi.create('categories', name);

  readonly isValid = computed(() =>
    this.name().trim() !== '' && this.brand().trim() !== '' && this.category().trim() !== '' &&
    this.price() !== null && this.price()! > 0);

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }
  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); }
  get brandModel() { return this.brand(); }
  set brandModel(v: string) { this.brand.set(v); }
  get categoryModel() { return this.category(); }
  set categoryModel(v: string) { this.category.set(v); }
  get sizeModel() { return this.size(); }
  set sizeModel(v: string) { this.size.set(v); }
  get colorModel() { return this.color(); }
  set colorModel(v: string) { this.color.set(v); }
  get priceModel() { return this.price(); }
  set priceModel(v: number | null) { this.price.set(v); }
  get descriptionModel() { return this.description(); }
  set descriptionModel(v: string) { this.description.set(v); }
  get deleteConfirmVisibleModel() { return this.deleteConfirmVisible(); }
  set deleteConfirmVisibleModel(v: boolean) { this.deleteConfirmVisible.set(v); }

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.errorMessage.set(null);

      if (this.mode() === 'create') {
        this.number.set(this.initialNumber());
        this.name.set(''); this.brand.set(''); this.category.set('');
        this.size.set(''); this.color.set(''); this.price.set(null); this.description.set('');
      } else {
        const a = this.article();
        if (!a) return;
        this.number.set(a.number);
        this.name.set(a.name); this.brand.set(a.brand); this.category.set(a.category);
        this.size.set(a.size ?? ''); this.color.set(a.color ?? '');
        this.price.set(a.price); this.description.set(a.description ?? '');
      }
    });
  }

  save(): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const payload = {
      name: this.name(), brand: this.brand(), category: this.category(), price: this.price()!,
      size: this.size() || undefined, color: this.color() || undefined, description: this.description() || undefined
    };

    const request = this.mode() === 'create'
      ? this.articlesApi.create({ ...payload, expectedNumber: this.number() ?? undefined })
      : this.articlesApi.update(this.article()!.id, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Speichern fehlgeschlagen');
      }
    });
  }

  confirmDelete(): void {
    const a = this.article();
    if (!a) return;
    this.articlesApi.delete(a.id).subscribe(() => {
      this.deleteConfirmVisible.set(false);
      this.deleted.emit();
      this.visible.set(false);
    });
  }

}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/components/artikel-dialog.spec.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/
git commit -m "feat(bar-app): artikel-dialog Component (Anlegen/Bearbeiten)"
```

---

### Task 20: `MyArticlesPage` verdrahten

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/MyArticlesPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/MyArticlesPage.spec.ts`

**Interfaces:**
- Consumes: `ArticlesApiService`, `MasterDataApiService` (Task 17), `ArtikelDialog` (Task 19).
- Produces: fertige Seite unter Route `/my-articles`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MyArticlesPage } from './MyArticlesPage';
import { ArticlesApiService } from '../articles-api.service';
import { MasterDataApiService } from '../master-data-api.service';

function create() {
  TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
  const articlesApi = TestBed.inject(ArticlesApiService);
  const masterDataApi = TestBed.inject(MasterDataApiService);
  vi.spyOn(articlesApi, 'getMine').mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 25 }));
  vi.spyOn(articlesApi, 'getNextNumber').mockReturnValue(of({ number: 104 }));
  vi.spyOn(masterDataApi, 'getAll').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(MyArticlesPage);
  fixture.detectChanges();
  return { fixture, articlesApi, masterDataApi };
}

describe('MyArticlesPage', () => {
  it('loads articles, brands and categories on init', () => {
    const { fixture, articlesApi, masterDataApi } = create();

    expect(articlesApi.getMine).toHaveBeenCalled();
    expect(masterDataApi.getAll).toHaveBeenCalledWith('brands');
    expect(masterDataApi.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.articles()).toEqual([]);
  });

  it('shows the empty-state text when there are no articles', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.isEmpty()).toBe(true);
  });

  it('openCreateDialog() fetches next-number then opens the dialog in create mode', () => {
    const { fixture, articlesApi } = create();

    fixture.componentInstance.openCreateDialog();

    expect(articlesApi.getNextNumber).toHaveBeenCalled();
    expect(fixture.componentInstance.dialogMode()).toBe('create');
    expect(fixture.componentInstance.dialogNextNumber()).toBe(104);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('openEditDialog() opens the dialog in edit mode with the given article', () => {
    const { fixture } = create();
    const article = { id: 'a1', number: 101 } as never;

    fixture.componentInstance.openEditDialog(article);

    expect(fixture.componentInstance.dialogMode()).toBe('edit');
    expect(fixture.componentInstance.dialogArticle()).toBe(article);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('onSaved() reloads the article list', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onSaved();

    expect(articlesApi.getMine).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/my-articles/pages/MyArticlesPage.spec.ts`
Expected: FAIL — aktuelle `MyArticlesPage` ist nur `<h1>Meine Artikel</h1>`.

- [ ] **Step 3: Implement**

```typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ArticlesApiService, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';
import { ArtikelDialog } from '../components/artikel-dialog';

@Component({
  selector: 'app-my-articles-page',
  imports: [ButtonModule, TableModule, ArtikelDialog],
  template: `
    <h1>Meine Artikel</h1>
    <button pButton type="button" label="+ Neu" (click)="openCreateDialog()"></button>

    @if (isEmpty()) {
      <p>Noch keine Artikel angemeldet. Mit <strong>+ Neu</strong> den ersten anlegen.</p>
    } @else {
      <p-table [value]="articles()">
        <ng-template pTemplate="header">
          <tr><th>Nr.</th><th>Bezeichnung</th><th>Kategorie</th><th>Marke</th><th>Preis</th><th></th></tr>
        </ng-template>
        <ng-template pTemplate="body" let-article>
          <tr>
            <td>{{ article.number }}</td>
            <td>{{ article.name }}</td>
            <td>{{ article.category }}</td>
            <td>{{ article.brand }}</td>
            <td>{{ article.price }}</td>
            <td><button pButton type="button" icon="pi pi-pencil" (click)="openEditDialog(article)"></button></td>
          </tr>
        </ng-template>
      </p-table>
    }

    <app-artikel-dialog
      [(visible)]="dialogVisibleModel"
      [mode]="dialogMode()"
      [article]="dialogArticle()"
      [initialNumber]="dialogNextNumber()"
      [brands]="brands()"
      [categories]="categories()"
      (saved)="onSaved()"
      (deleted)="onSaved()"
      (brandCreated)="onBrandCreated($event)"
      (categoryCreated)="onCategoryCreated($event)"
    />
  `
})
export class MyArticlesPage implements OnInit {
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);

  readonly articles = signal<ArticleResponse[]>([]);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);
  readonly isEmpty = computed(() => this.articles().length === 0);

  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly dialogArticle = signal<ArticleResponse | null>(null);
  readonly dialogNextNumber = signal<number | null>(null);

  get dialogVisibleModel() { return this.dialogVisible(); }
  set dialogVisibleModel(v: boolean) { this.dialogVisible.set(v); }

  ngOnInit(): void {
    this.loadArticles();
    this.masterDataApi.getAll('brands').subscribe((items) => this.brands.set(items));
    this.masterDataApi.getAll('categories').subscribe((items) => this.categories.set(items));
  }

  loadArticles(): void {
    this.articlesApi.getMine().subscribe((page) => this.articles.set(page.items));
  }

  openCreateDialog(): void {
    this.articlesApi.getNextNumber().subscribe({
      next: ({ number }) => {
        this.dialogMode.set('create');
        this.dialogArticle.set(null);
        this.dialogNextNumber.set(number);
        this.dialogVisible.set(true);
      },
      error: () => {
        // AC-8: 409 article.no_free_number -> Dialog bleibt zu, Toast durch globalen HTTP-Fehlerpfad
        // (kein spezieller Handler hier nötig, sobald ein Toast-Interceptor existiert - siehe Task-Notiz unten)
      }
    });
  }

  openEditDialog(article: ArticleResponse): void {
    this.dialogMode.set('edit');
    this.dialogArticle.set(article);
    this.dialogNextNumber.set(null);
    this.dialogVisible.set(true);
  }

  onSaved(): void {
    this.loadArticles();
  }

  onBrandCreated(item: MasterDataItem): void {
    this.brands.update((items) => [...items, item]);
  }

  onCategoryCreated(item: MasterDataItem): void {
    this.categories.update((items) => [...items, item]);
  }
}
```

**Offene Anmerkung für den Ausführenden:** Es existiert noch kein globaler Toast-Mechanismus (`MessageService`/`p-toast`) im Frontend (siehe Design-Spec „Fehlerbehandlung"). Für AC-8 („Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren" als Toast) und die generischen Fehler-Toasts aus dem Design-Dokument fehlt aktuell die Infrastruktur, um das *sichtbar* zu machen — nicht nur der Log. Dieser Task liefert die Fehlerpfade als stille Weichen (die Dialoge öffnen sich korrekt nicht/bleiben offen), aber **kein sichtbares Toast**. Vor dem Abschluss von R03 mit dem Nutzer klären, ob ein minimaler `p-toast`+`MessageService`-Aufbau (App-weit, ein `providePrimeNG`-Toast-Root in `app.config.ts` oder `Shell`) als zusätzlicher Task nachgezogen wird, oder ob das bewusst auf R04 verschoben wird (Design-Spec trifft dazu keine explizite Aussage).

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/pages/MyArticlesPage.spec.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Volle Frontend-Testsuite laufen lassen**

Run (dev-mcp `test_angular_project` bzw.): `npx vitest run` (im Ordner `src/advance-registration/frontend/BAR.App`)
Expected: alle Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/
git commit -m "feat(bar-app): MyArticlesPage verdrahtet (Liste, Anlegen, Bearbeiten, Loeschen)"
```

---

## Nacharbeiten (nicht Teil dieses Plans, im Review ansprechen)

- **Toast-Infrastruktur fehlt komplett** (siehe Anmerkung Task 20) — betrifft AC-8 und alle generischen Fehlermeldungen aus der Design-Spec „Fehlerbehandlung". Vor Produktivsetzung von R03 klären.
- **`cross-cutting.md`-Abweichung bei der Suche** (siehe Task 7) — volle Token-Zerlegung nicht implementiert, nur Teilwort-Match. Bei Bedarf in R04 nachziehen, Port-Vertrag ändert sich dabei nicht.
- Die in der Design-Spec Abschnitt „Fehlerbehandlung" beschriebenen Roadmap-Ausnahmen (AC-7-Sonderdialog erst R04) sind in Task 19 bewusst nicht gebaut — `errorMessage` zeigt nur den rohen `detail`-Text.

## Self-Review

**Spec-Abdeckung:** Domain (Task 1-3), Ports/Schema/Migration (Task 4), Repositories (Task 5-6), Queries (Task 7), alle Application-Handler aus der Spec (Task 8-14), Host-Endpoints inkl. `nextNumber`-Extension (Task 15-16), Frontend Services/Components/Page (Task 17-20) — jede Zeile der „Umfang"-Sektion aus der Roadmap sowie jeder Abschnitt der Design-Spec hat eine Task-Entsprechung. Einzige offene Lücke: Toast-Anzeige (dokumentiert unter „Nacharbeiten", nicht stillschweigend weggelassen).

**Placeholder-Scan:** Zwei fehlerhafte Zwischenfassungen (Task 8 `CreateArticleCommandHandler`, Task 19 `masterDataCreate`) während des Schreibens entdeckt und durch die korrekte Fassung ersetzt, keine TODO/TBD-Reste im Dokument.

**Typkonsistenz geprüft:** `ArticleNumberAllocation(int Number, NumberBlock? NewBlock)` (Task 3) wird identisch in Task 8/9 verwendet. `IArticleRepository.CreateAsync(Article, NumberBlock?, CancellationToken)` (Task 4/5) stimmt mit dem Aufruf in Task 8 überein. `MasterDataItem`/`ArticleResponse`/`ArticlePayload` (Task 17) werden in Task 18/19/20 mit denselben Feldnamen wiederverwendet. `ArticleWithSeller`/`ArticleSearchPage`/`ArticleAdminSearchPage` (Task 7) stimmen mit den Mock-Setups in Task 10/12 überein.

