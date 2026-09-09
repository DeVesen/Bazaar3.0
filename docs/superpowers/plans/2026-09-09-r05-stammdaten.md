# R05 Stammdaten-Hoheit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin verwaltet Marken, Kategorien und Verkäufer-Typen in der Voranmelde-App — Umbenennen mit Kaskade in Artikel, Löschschutz bei Verwendung, Original/Neu-Badges, sofortige Live-Wirkung von Provisions-/Gebührenänderungen.

**Architecture:** Hexagonal (Domain/Application/Infrastructure/Host) im Backend `BAR.*`, Feature-First Angular-Frontend. Backend für Marken/Kategorien (`GET`/`POST`/`PUT`/`DELETE /api/brands` bzw. `/categories`) wird bereits vom R03-Plan gebaut (siehe [2026-09-09-r03-artikelerfassung.md](2026-09-09-r03-artikelerfassung.md), Task 1-16) — **Voraussetzung: R03 ist vollständig ausgeführt, bevor dieser Plan startet**, sonst fehlen `IArticleRepository`/`Article`, gegen die der Löschschutz und die Namens-Kaskade rechnen. Dieser Plan baut nur das, was R03 nicht abdeckt: komplettes CRUD für Verkäufer-Typen (Backend, bisher nur `SellerType`-Entity + `GetByIdAsync`), die geteilten Frontend-Komponenten `table`, `stammdaten-popup`, `typ-popup`, die fehlende App-weite Toast/Confirm-Infrastruktur (von R03 als offene Lücke vermerkt) und die drei Admin-Seiten (`BrandsPage`, `CategoriesPage`, `SellerTypesPage`) auf den bereits fertigen Routen/Guards/Sidebar-Einträgen.

**Tech Stack:** .NET 10, EF Core (Npgsql), FluentValidation, xUnit v3 + Moq, Angular 22 (standalone, Zone.js, Signals), PrimeNG 22, Vitest.

**Spec:** [docs/requirements/advance-registration/roadmap/R05-stammdaten.md](../../requirements/advance-registration/roadmap/R05-stammdaten.md), [Epic_Verkaeufer_Typen](../../requirements/advance-registration/epics/Epic_Verkaeufer_Typen/epic.md), [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md), [Epic_Kategorien](../../requirements/advance-registration/epics/Epic_Kategorien/epic.md), [api/seller-types.md](../../requirements/advance-registration/api/seller-types.md), [api/master-data.md](../../requirements/advance-registration/api/master-data.md), [components/table](../../components/table/component.md), [components/stammdaten-popup](../../components/stammdaten-popup/component.md), [components/typ-popup](../../components/typ-popup/component.md), [components/form](../../components/form/component.md), [components/toast](../../components/toast/component.md)

## Global Constraints

- Domain-Entitäten: `sealed class`, privater Ctor, `private init`-Properties (mutierbare Felder `private set`), statische Factory-Methode, Pflichtfeld-Guards via `ArgumentException`/`ArgumentOutOfRangeException`, IDs über `EntityId.New()` (8-stellig).
- Application-Handler: `sealed record` Command/Query, `sealed class XxxCommandHandler(deps...)` mit Primary-Constructor-DI, eine Methode `HandleAsync(...)`, keine MediatR. Validierung über `FluentValidation`-`AbstractValidator<T>`.
- Fehler: `throw new ConflictException(errorCode, detail)` / `NotFoundException` — nie manuell HTTP-Status bauen. `errorCode` immer `bereich.grund`.
- Infrastructure: Repository `sealed class XxxRepository(BarDbContext dbContext) : IXxxRepository`, `SaveChangesAsync` im Repository selbst.
- Host: `static class XxxEndpoints` mit `MapXxxEndpoints(this IEndpointRouteBuilder app)`. Commands werden **direkt** als Minimal-API-Body-Parameter gebunden (kein separates Request-DTO), damit `.AddEndpointFilter<ValidationFilter<TCommand>>()` sie sieht und 400 liefert (Muster: `AuthEndpoints.cs`, nicht das `CreateBrandRequest`-Muster aus R03 Task 16 — dort validiert der Filter nichts, weil er an einem anderen Typ hängt als das gebundene Request-Objekt). `.RequireAuthorization("admin")` für alle Verkäufer-Typen-Routen.
- Tests: xUnit v3 (`TestContext.Current.CancellationToken`), Moq, Testklasse `XxxTests`, Methode `Methode_Szenario_Ergebnis`, Ordnerstruktur spiegelt Source 1:1.
- Frontend: Standalone-Components, **inline** Template (`template:` im `@Component`-Decorator, kein `templateUrl`, außer wo die Codebasis das schon anders macht wie `Shell`/`Sidebar`), Signals (`input`/`model`/`output`/`computed`/`effect`), `@Injectable({ providedIn: 'root' })` + `inject(HttpClient)`, relative `/api/...`-URLs, Page-Dateien PascalCase, Shared/Feature-Dateien kebab-case. Tests: Vitest + `TestBed`, `HttpTestingController`.
- Geteilte Komponenten (`shared/`) dürfen **keine** Feature-Services importieren, nur Typen (siehe `autocomplete-create` in R03 Task 18) — Speichern/Laden läuft über Input-Funktionen (`saveFn`), die das Parent aus seinem Feature-Service bindet.
- DI-Registrierung: jeder neue Handler/Validator/Repository bekommt eine explizite Zeile in `BAR.Infrastructure/DependencyInjection.cs` (kein Assembly-Scanning).
- **Table-Komponente ist bewusst auf den R05-Bedarf verkleinert:** Marken-/Kategorien-/Typen-Listen sind laut `api/master-data.md` und `api/seller-types.md` **nicht paginiert** und **zweistellig groß**. Diese Task baut Sortierung (Single + Multi), Aktionsspalte, Badge-Spalten, Empty-State, Striped/Hover/Skeleton — **keine** Spalten-Filter, Paginierung, Virtual-Scroll (AC-4, AC-6/AC-7 aus `components/table/component.md` teilweise offen, siehe „Nacharbeiten"). Das erste Epic mit großen/paginierten Listen (Verkäufer R06, Alle Artikel R08) erweitert die Komponente um das Fehlende.

---

## Frontend — Infrastruktur

### Task 1: App-weiter Toast + ConfirmDialog

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts` (erweitern)

**Interfaces:**
- Produces: `MessageService`/`ConfirmationService` app-weit über DI verfügbar (`inject(MessageService)`, `inject(ConfirmationService)` funktioniert in jeder Komponente unterhalb von `Shell`, inkl. aller drei R05-Seiten). `<p-toast>`/`<p-confirmDialog>` sind einmalig in `shell.html` gerendert.

- [ ] **Step 1: Bestehenden Shell-Test lesen und Erweiterung schreiben**

In `shell.spec.ts` (bestehende Datei erweitern, nicht überschreiben) einen Test ergänzen:

```typescript
it('provides MessageService and ConfirmationService for child injectors', () => {
  const fixture = TestBed.createComponent(Shell);
  fixture.detectChanges();

  expect(() => TestBed.inject(MessageService)).not.toThrow();
  expect(() => TestBed.inject(ConfirmationService)).not.toThrow();
});
```

Import ergänzen: `import { MessageService } from 'primeng/api'; import { ConfirmationService } from 'primeng/api';`

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/core/shell/shell.spec.ts` (im Ordner `src/advance-registration/frontend/BAR.App`)
Expected: FAIL — `MessageService`/`ConfirmationService` sind nirgends registriert, `TestBed.inject` wirft.

- [ ] **Step 3: Implement**

`app.config.ts` — `MessageService`/`ConfirmationService` root-weit registrieren, damit auch außerhalb von `Shell` (z. B. spätere Fehlerpfade) injizierbar:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { MessageService, ConfirmationService } from 'primeng/api';
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
    MessageService,
    ConfirmationService
  ]
};
```

`shell.ts` — `ToastModule`/`ConfirmDialogModule` zu `imports` ergänzen:

```typescript
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LucideMenu } from '@lucide/angular';
import { Sidebar } from './sidebar/sidebar';

const MOBILE_BREAKPOINT = '(max-width: 1024px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, ToastModule, ConfirmDialogModule, LucideMenu, Sidebar],
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

`shell.html` — `<p-toast>`/`<p-confirmDialog>` ergänzen (außerhalb von `p-sidebar-layout`, damit sie über allem liegen):

```html
<p-toast />
<p-confirmDialog />
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

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/core/shell/shell.spec.ts`
Expected: PASS (bisherige Tests + neuer Test).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/app.config.ts src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts
git commit -m "feat(bar-app): App-weite Toast- und ConfirmDialog-Infrastruktur"
```

---

## Backend — Verkäufer-Typen

### Task 2: `SellerType`-Domain um `Update` erweitern

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/SellerTypes/SellerType.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/SellerTypes/SellerTypeTests.cs`

**Interfaces:**
- Produces: `sellerType.Update(string name, decimal commissionRate, decimal itemFee) → void` (gleiche Validierung wie `Create`, wirft `ArgumentException`/`ArgumentOutOfRangeException`).

- [ ] **Step 1: Write failing tests** (in `SellerTypeTests.cs` ergänzen, bestehende Tests bleiben)

```csharp
[Fact]
public void Update_ValidData_ChangesAllFields()
{
    var type = SellerType.Create("Standard", 12.5m, 0.50m);

    type.Update("Premium", 20.0m, 1.00m);

    Assert.Equal("Premium", type.Name);
    Assert.Equal(20.0m, type.CommissionRate);
    Assert.Equal(1.00m, type.ItemFee);
}

[Fact]
public void Update_CommissionRateOutOfRange_Throws()
{
    var type = SellerType.Create("Standard", 12.5m, 0.50m);

    Assert.Throws<ArgumentOutOfRangeException>(() => type.Update("Standard", 150m, 0.50m));
}

[Fact]
public void Update_ItemFeeNegative_Throws()
{
    var type = SellerType.Create("Standard", 12.5m, 0.50m);

    Assert.Throws<ArgumentOutOfRangeException>(() => type.Update("Standard", 12.5m, -1m));
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~SellerTypeTests`
Expected: FAIL — `Update` existiert nicht.

- [ ] **Step 3: Implement**

`SellerType.cs` komplett ersetzen:

```csharp
using BAR.Domain.Common;

namespace BAR.Domain.SellerTypes;

public sealed class SellerType
{
    private SellerType() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public decimal CommissionRate { get; private set; }
    public decimal ItemFee { get; private set; }

    public static SellerType Create(string name, decimal commissionRate, decimal itemFee)
    {
        Validate(name, commissionRate, itemFee);

        return new SellerType { Id = EntityId.New(), Name = name, CommissionRate = commissionRate, ItemFee = itemFee };
    }

    public void Update(string name, decimal commissionRate, decimal itemFee)
    {
        Validate(name, commissionRate, itemFee);

        Name = name;
        CommissionRate = commissionRate;
        ItemFee = itemFee;
    }

    private static void Validate(string name, decimal commissionRate, decimal itemFee)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));
        if (commissionRate is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(commissionRate), "commissionRate muss zwischen 0 und 100 liegen.");
        if (itemFee < 0) throw new ArgumentOutOfRangeException(nameof(itemFee), "itemFee darf nicht negativ sein.");
    }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter FullyQualifiedName~SellerTypeTests`
Expected: PASS (bisherige + 3 neue Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/SellerTypes/SellerType.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/SellerTypes/SellerTypeTests.cs
git commit -m "feat(bar-app): SellerType.Update fuer Provisions-/Gebuehren-Aenderung"
```

---

### Task 3: `ISellerTypeRepository` erweitern + `SellerTypeRepository`

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/ISellerTypeRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerTypeRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SellerTypeRepositoryTests.cs`

**Interfaces:**
- Produces: `ISellerTypeRepository`: `GetAllAsync(ct) → Task<IReadOnlyList<SellerType>>`; `GetByIdAsync(id, ct) → Task<SellerType?>` (bereits vorhanden); `ExistsByNameAsync(name, excludeId, ct) → Task<bool>`; `AddAsync(sellerType, ct) → Task`; `UpdateAsync(sellerType, ct) → Task`; `CountSellersAsync(sellerTypeId, ct) → Task<int>`; `DeleteAsync(sellerType, ct) → Task`.
- Consumes: `BarDbContext.Sellers`, `BarDbContext.SellerTypes` (beide bereits vorhanden).

- [ ] **Step 1: Write failing integration tests**

```csharp
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SellerTypeRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerTypeRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetAll_ContainsType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 12.5m, 0.50m);

        await repo.AddAsync(type, ct);
        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, t => t.Id == type.Id);
    }

    [Fact]
    public async Task ExistsByNameAsync_SameName_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var name = $"Premium-{Guid.NewGuid():N}";
        await repo.AddAsync(SellerType.Create(name, 20m, 1m), ct);

        var exists = await repo.ExistsByNameAsync(name, excludeId: null, ct);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameAsync_ExcludeOwnId_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Gewerblich-{Guid.NewGuid():N}", 20m, 1m);
        await repo.AddAsync(type, ct);

        var exists = await repo.ExistsByNameAsync(type.Name, excludeId: type.Id, ct);

        Assert.False(exists);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChangedValues()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Alt-{Guid.NewGuid():N}", 10m, 0.20m);
        await repo.AddAsync(type, ct);

        type.Update("Neu", 15m, 0.30m);
        await repo.UpdateAsync(type, ct);

        var reloaded = await repo.GetByIdAsync(type.Id, ct);
        Assert.Equal("Neu", reloaded!.Name);
        Assert.Equal(15m, reloaded.CommissionRate);
    }

    [Fact]
    public async Task CountSellersAsync_CountsOnlyMatchingType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Zaehl-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(type, ct);
        var otherType = SellerType.Create($"Andere-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(otherType, ct);
        await sellers.AddAsync(Seller.Register("A", "B", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", type.Id, "hash"), ct);
        await sellers.AddAsync(Seller.Register("C", "D", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", type.Id, "hash"), ct);
        await sellers.AddAsync(Seller.Register("E", "F", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", otherType.Id, "hash"), ct);

        var count = await types.CountSellersAsync(type.Id, ct);

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task DeleteAsync_RemovesType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Weg-{Guid.NewGuid():N}", 10m, 0.20m);
        await repo.AddAsync(type, ct);

        await repo.DeleteAsync(type, ct);

        Assert.Null(await repo.GetByIdAsync(type.Id, ct));
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~SellerTypeRepositoryTests`
Expected: FAIL — Methoden fehlen auf `ISellerTypeRepository`.

- [ ] **Step 3: Implement**

`ISellerTypeRepository.cs`:

```csharp
namespace BAR.Domain.Ports;

public interface ISellerTypeRepository
{
    Task<IReadOnlyList<BAR.Domain.SellerTypes.SellerType>> GetAllAsync(CancellationToken cancellationToken);
    Task<BAR.Domain.SellerTypes.SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
    Task UpdateAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
    Task<int> CountSellersAsync(string sellerTypeId, CancellationToken cancellationToken);
    Task DeleteAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
}
```

`SellerTypeRepository.cs`:

```csharp
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerTypeRepository(BarDbContext dbContext) : ISellerTypeRepository
{
    public async Task<IReadOnlyList<SellerType>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.SellerTypes.OrderBy(t => t.Name).ToListAsync(cancellationToken);

    public Task<SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.SellerTypes.SingleOrDefaultAsync(t => t.Id == id, cancellationToken);

    public Task<bool> ExistsByNameAsync(string name, string? excludeId, CancellationToken cancellationToken) =>
        dbContext.SellerTypes
            .Where(t => excludeId == null || t.Id != excludeId)
            .AnyAsync(t => t.Name == name, cancellationToken);

    public async Task AddAsync(SellerType sellerType, CancellationToken cancellationToken)
    {
        dbContext.SellerTypes.Add(sellerType);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(SellerType sellerType, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public Task<int> CountSellersAsync(string sellerTypeId, CancellationToken cancellationToken) =>
        dbContext.Sellers.CountAsync(s => s.SellerTypeId == sellerTypeId, cancellationToken);

    public async Task DeleteAsync(SellerType sellerType, CancellationToken cancellationToken)
    {
        dbContext.SellerTypes.Remove(sellerType);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~SellerTypeRepositoryTests`
Expected: PASS (6 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/ISellerTypeRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SellerTypeRepository.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SellerTypeRepositoryTests.cs
git commit -m "feat(bar-app): SellerTypeRepository um CRUD und CountSellersAsync erweitert"
```

---

### Task 4: SellerType-Handler (GetAll, Create, Update, Delete)

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/SellerTypeResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/GetAll/GetAllSellerTypesQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Create/CreateSellerTypeCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Create/CreateSellerTypeCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Create/CreateSellerTypeCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Update/UpdateSellerTypeCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Update/UpdateSellerTypeCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Update/UpdateSellerTypeCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/SellerTypes/Delete/DeleteSellerTypeCommandHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerTypes/Create/CreateSellerTypeCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerTypes/Update/UpdateSellerTypeCommandHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerTypes/Delete/DeleteSellerTypeCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ISellerTypeRepository` (Task 3), `ISettingsRepository.GetAsync(ct) → Task<Settings?>` (bereits vorhanden, `Settings.DefaultTypeId`).
- Produces: `SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount)`; `CreateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee)`; `CreateSellerTypeCommandHandler.HandleAsync(CreateSellerTypeCommand, ct) → Task<SellerTypeResult>`; `UpdateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee)`; `UpdateSellerTypeCommandHandler.HandleAsync(string id, UpdateSellerTypeCommand, ct) → Task<SellerTypeResult>`; `DeleteSellerTypeCommandHandler.HandleAsync(string id, ct) → Task`.

- [ ] **Step 1: Write failing tests**

```csharp
using BAR.Application.SellerTypes.Create;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.SellerTypes.Create;

public class CreateSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();

    [Fact]
    public async Task HandleAsync_ValidData_CreatesType()
    {
        _types.Setup(t => t.ExistsByNameAsync("Standard", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateSellerTypeCommandHandler(_types.Object);

        var result = await handler.HandleAsync(new CreateSellerTypeCommand("Standard", 12.5m, 0.50m), TestContext.Current.CancellationToken);

        Assert.Equal("Standard", result.Name);
        Assert.Equal(12.5m, result.CommissionRate);
        Assert.Equal(0, result.SellerCount);
        _types.Verify(t => t.AddAsync(It.IsAny<BAR.Domain.SellerTypes.SellerType>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NameTaken_ThrowsConflict()
    {
        _types.Setup(t => t.ExistsByNameAsync("Standard", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateSellerTypeCommandHandler(_types.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateSellerTypeCommand("Standard", 12.5m, 0.50m), TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.name_taken", ex.ErrorCode);
    }
}
```

```csharp
using BAR.Application.SellerTypes.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.SellerTypes.Update;

public class UpdateSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();

    [Fact]
    public async Task HandleAsync_ValidData_UpdatesAndReturnsSellerCount()
    {
        var type = SellerType.Create("Alt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.ExistsByNameAsync("Neu", type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(5);
        var handler = new UpdateSellerTypeCommandHandler(_types.Object);

        var result = await handler.HandleAsync(type.Id, new UpdateSellerTypeCommand("Neu", 15m, 0.30m), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.Equal(15m, result.CommissionRate);
        Assert.Equal(5, result.SellerCount);
        _types.Verify(t => t.UpdateAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _types.Setup(t => t.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((SellerType?)null);
        var handler = new UpdateSellerTypeCommandHandler(_types.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync("x", new UpdateSellerTypeCommand("Neu", 15m, 0.30m), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var type = SellerType.Create("Alt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.ExistsByNameAsync("Belegt", type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateSellerTypeCommandHandler(_types.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, new UpdateSellerTypeCommand("Belegt", 15m, 0.30m), TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.name_taken", ex.ErrorCode);
    }
}
```

```csharp
using BAR.Application.SellerTypes.Delete;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.SellerTypes.Delete;

public class DeleteSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<ISettingsRepository> _settings = new();

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var type = SellerType.Create("Frei", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Settings?)null);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        await handler.HandleAsync(type.Id, TestContext.Current.CancellationToken);

        _types.Verify(t => t.DeleteAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Belegt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _types.Verify(t => t.DeleteAsync(It.IsAny<SellerType>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_IsDefaultType_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Default", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var settings = Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, type.Id, null, 1, 100, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.is_default", ex.ErrorCode);
        _types.Verify(t => t.DeleteAsync(It.IsAny<SellerType>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_InUseAndDefault_ChecksInUseFirst()
    {
        var type = SellerType.Create("Beides", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _settings.Verify(s => s.GetAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

- [ ] **Step 2: Run to verify all fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~SellerTypes`
Expected: FAIL — Handler fehlen.

- [ ] **Step 3: Implement**

`SellerTypeResult.cs`:

```csharp
namespace BAR.Application.SellerTypes;

public sealed record SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount);
```

`GetAllSellerTypesQueryHandler.cs`:

```csharp
using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.GetAll;

public sealed class GetAllSellerTypesQueryHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<IReadOnlyList<SellerTypeResult>> HandleAsync(CancellationToken cancellationToken)
    {
        var all = await sellerTypes.GetAllAsync(cancellationToken);
        var result = new List<SellerTypeResult>(all.Count);

        foreach (var type in all)
        {
            var count = await sellerTypes.CountSellersAsync(type.Id, cancellationToken);
            result.Add(new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, count));
        }

        return result;
    }
}
```

`Create/CreateSellerTypeCommand.cs`:

```csharp
namespace BAR.Application.SellerTypes.Create;

public sealed record CreateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);
```

`Create/CreateSellerTypeCommandValidator.cs`:

```csharp
using FluentValidation;

namespace BAR.Application.SellerTypes.Create;

public sealed class CreateSellerTypeCommandValidator : AbstractValidator<CreateSellerTypeCommand>
{
    public CreateSellerTypeCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(c => c.ItemFee).GreaterThanOrEqualTo(0);
    }
}
```

`Create/CreateSellerTypeCommandHandler.cs`:

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;

namespace BAR.Application.SellerTypes.Create;

public sealed class CreateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<SellerTypeResult> HandleAsync(CreateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        if (await sellerTypes.ExistsByNameAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        var type = SellerType.Create(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.AddAsync(type, cancellationToken);

        return new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, SellerCount: 0);
    }
}
```

`Update/UpdateSellerTypeCommand.cs`:

```csharp
namespace BAR.Application.SellerTypes.Update;

public sealed record UpdateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);
```

`Update/UpdateSellerTypeCommandValidator.cs`:

```csharp
using FluentValidation;

namespace BAR.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandValidator : AbstractValidator<UpdateSellerTypeCommand>
{
    public UpdateSellerTypeCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(c => c.ItemFee).GreaterThanOrEqualTo(0);
    }
}
```

`Update/UpdateSellerTypeCommandHandler.cs`:

```csharp
using BAR.Application.SellerTypes;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<SellerTypeResult> HandleAsync(string id, UpdateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        if (await sellerTypes.ExistsByNameAsync(command.Name, id, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        type.Update(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.UpdateAsync(type, cancellationToken);

        var sellerCount = await sellerTypes.CountSellersAsync(id, cancellationToken);
        return new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, sellerCount);
    }
}
```

`Delete/DeleteSellerTypeCommandHandler.cs`:

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.Delete;

public sealed class DeleteSellerTypeCommandHandler(ISellerTypeRepository sellerTypes, ISettingsRepository settingsRepository)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        var sellerCount = await sellerTypes.CountSellersAsync(id, cancellationToken);
        if (sellerCount > 0)
        {
            throw new ConflictException("seller_type.in_use", "Verkäufer-Typ wird noch verwendet");
        }

        var settings = await settingsRepository.GetAsync(cancellationToken);
        if (settings is not null && settings.DefaultTypeId == id)
        {
            throw new ConflictException("seller_type.is_default", "Kann nicht gelöscht werden — ist aktuell Standard-Typ in den Einstellungen");
        }

        await sellerTypes.DeleteAsync(type, cancellationToken);
    }
}
```

`DependencyInjection.cs` — Zeilen ergänzen (nach den bestehenden `SellerType`-Zeilen):

```csharp
        services.AddScoped<GetAllSellerTypesQueryHandler>();
        services.AddScoped<CreateSellerTypeCommandHandler>();
        services.AddScoped<IValidator<CreateSellerTypeCommand>, CreateSellerTypeCommandValidator>();
        services.AddScoped<UpdateSellerTypeCommandHandler>();
        services.AddScoped<IValidator<UpdateSellerTypeCommand>, UpdateSellerTypeCommandValidator>();
        services.AddScoped<DeleteSellerTypeCommandHandler>();
```

Zugehörige `using`-Zeilen ergänzen: `using BAR.Application.SellerTypes.Create;`, `using BAR.Application.SellerTypes.Update;`, `using BAR.Application.SellerTypes.Delete;`, `using BAR.Application.SellerTypes.GetAll;`.

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter FullyQualifiedName~SellerTypes`
Expected: PASS (9 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/SellerTypes/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerTypes/
git commit -m "feat(bar-app): SellerType-Handler (GetAll, Create, Update, Delete)"
```

---

### Task 5: `SellerTypesEndpoints`

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/SellerTypes/SellerTypesEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/SellerTypes/SellerTypesEndpointsTests.cs`

**Interfaces:**
- Consumes: Handler aus Task 4.
- Produces: `GET`/`POST /api/seller-types`, `PUT`/`DELETE /api/seller-types/{id}` — durchgehend `admin`-only.

- [ ] **Step 1: Write failing tests**

Der Test seedet einen Admin direkt über `ISellerRepository`/`ITokenIssuer` (kein öffentlicher Weg, um Admin zu werden — Selbstregistrierung vergibt nie `isAdmin: true`):

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.SellerTypes;

public class SellerTypesEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerTypesEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private async Task<HttpClient> CreateAdminClientAsync()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var tokenIssuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var ct = TestContext.Current.CancellationToken;

        var seedType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(seedType, ct);
        var admin = Seller.Register("Admin", "User", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", seedType.Id, "hash", isAdmin: true);
        await sellers.AddAsync(admin, ct);

        var token = tokenIssuer.IssueAccessToken(admin.Id, "admin", DateTime.UtcNow);
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/seller-types", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Post_AsAdmin_Creates201()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Standard-{Guid.NewGuid():N}", commissionRate = 12.5m, itemFee = 0.50m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_InvalidCommissionRate_Returns400()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsJsonAsync("/api/seller-types", new { name = $"X-{Guid.NewGuid():N}", commissionRate = 150m, itemFee = 0.50m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_ChangesValues_Returns200()
    {
        var client = await CreateAdminClientAsync();
        var created = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Y-{Guid.NewGuid():N}", commissionRate = 10m, itemFee = 0.20m }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.PutAsJsonAsync($"/api/seller-types/{id}", new { name = "Geändert", commissionRate = 15m, itemFee = 0.30m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal("Geändert", updated.GetProperty("name").GetString());
    }

    [Fact]
    public async Task Delete_Unused_Returns204()
    {
        var client = await CreateAdminClientAsync();
        var created = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Z-{Guid.NewGuid():N}", commissionRate = 10m, itemFee = 0.20m }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.DeleteAsync($"/api/seller-types/{id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~SellerTypesEndpointsTests`
Expected: FAIL — Route fehlt.

- [ ] **Step 3: Implement**

`SellerTypesEndpoints.cs`:

```csharp
using BAR.Application.SellerTypes.Create;
using BAR.Application.SellerTypes.Delete;
using BAR.Application.SellerTypes.GetAll;
using BAR.Application.SellerTypes.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.SellerTypes;

public static class SellerTypesEndpoints
{
    public static IEndpointRouteBuilder MapSellerTypesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/seller-types", async (GetAllSellerTypesQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/seller-types", async (CreateSellerTypeCommand command, CreateSellerTypeCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Created($"/api/seller-types/{result.Id}", result);
        }).AddEndpointFilter<ValidationFilter<CreateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapPut("/api/seller-types/{id}", async (string id, UpdateSellerTypeCommand command, UpdateSellerTypeCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(id, command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapDelete("/api/seller-types/{id}", async (string id, DeleteSellerTypeCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
```

`Program.cs` — `using BAR.Host.Features.SellerTypes;` ergänzen und nach `app.MapCategoriesEndpoints();` (aus R03 Task 16):

```csharp
app.MapSellerTypesEndpoints();
```

- [ ] **Step 4: Run to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~SellerTypesEndpointsTests`
Expected: PASS (5 Tests).

- [ ] **Step 5: Volle Backend-Testsuite laufen lassen**

Run: `dotnet test src/advance-registration/backend/BAR.slnx`
Expected: alle Tests PASS (Domain, Application, Host-Integration, Architecture).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/SellerTypes/ src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/SellerTypes/
git commit -m "feat(bar-app): SellerTypesEndpoints (GET/POST/PUT/DELETE, admin-only)"
```

---

## Frontend — Services

### Task 6: `MasterDataApiService` um Update/Delete erweitern + `SellerTypeApiService`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.ts` (aus R03 Task 17)
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/seller-type-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/seller-type-api.service.spec.ts`

**Interfaces:**
- Produces: `MasterDataApiService.update(resource, id, payload: { name: string; original: boolean }) → Observable<MasterDataItem>`; `.delete(resource, id) → Observable<void>`; `MasterDataItem` bekommt optionales `articleCount?: number`. `SellerTypeApiService.getAll() → Observable<SellerType[]>`; `.create(payload: SellerTypePayload) → Observable<SellerType>`; `.update(id, payload: SellerTypePayload) → Observable<SellerType>`; `.delete(id) → Observable<void>`. `SellerType { id, name, commissionRate, itemFee, sellerCount }`, `SellerTypePayload { name: string; commissionRate: number; itemFee: number }`.

- [ ] **Step 1: Write failing tests** (in `master-data-api.service.spec.ts` ergänzen, bestehende Tests aus R03 bleiben)

```typescript
it('update("brands", id, payload) puts to /api/brands/:id', () => {
  service.update('brands', 'b1', { name: 'Nike', original: true }).subscribe();

  const req = httpMock.expectOne('/api/brands/b1');
  expect(req.request.method).toBe('PUT');
  expect(req.request.body).toEqual({ name: 'Nike', original: true });
  req.flush({ id: 'b1', name: 'Nike', original: true });
});

it('delete("brands", id) deletes /api/brands/:id', () => {
  service.delete('brands', 'b1').subscribe();

  const req = httpMock.expectOne('/api/brands/b1');
  expect(req.request.method).toBe('DELETE');
  req.flush(null);
});
```

`seller-type-api.service.spec.ts` (neue Datei):

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellerTypeApiService } from './seller-type-api.service';

describe('SellerTypeApiService', () => {
  let service: SellerTypeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SellerTypeApiService]
    });
    service = TestBed.inject(SellerTypeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() requests /api/seller-types', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne('/api/seller-types');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() posts payload to /api/seller-types', () => {
    const payload = { name: 'Standard', commissionRate: 12.5, itemFee: 0.5 };
    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/seller-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 't1', ...payload, sellerCount: 0 });
  });

  it('update() puts payload to /api/seller-types/:id', () => {
    const payload = { name: 'Premium', commissionRate: 20, itemFee: 1 };
    service.update('t1', payload).subscribe();

    const req = httpMock.expectOne('/api/seller-types/t1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 't1', ...payload, sellerCount: 3 });
  });

  it('delete() deletes /api/seller-types/:id', () => {
    service.delete('t1').subscribe();

    const req = httpMock.expectOne('/api/seller-types/t1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
```

- [ ] **Step 2: Run to verify both fail**

Run: `npx vitest run src/app/features/my-articles/master-data-api.service.spec.ts src/app/features/seller-types/seller-type-api.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

`master-data-api.service.ts` komplett ersetzen (`MasterDataItem` und Service):

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type MasterDataResource = 'brands' | 'categories';

export interface MasterDataItem {
  id: string;
  name: string;
  original: boolean;
  articleCount?: number;
}

export interface MasterDataUpdatePayload {
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

  update(resource: MasterDataResource, id: string, payload: MasterDataUpdatePayload): Observable<MasterDataItem> {
    return this.http.put<MasterDataItem>(`/api/${resource}/${id}`, payload);
  }

  delete(resource: MasterDataResource, id: string): Observable<void> {
    return this.http.delete<void>(`/api/${resource}/${id}`);
  }
}
```

`seller-type-api.service.ts` (neue Datei):

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerType {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
  sellerCount: number;
}

export interface SellerTypePayload {
  name: string;
  commissionRate: number;
  itemFee: number;
}

@Injectable({ providedIn: 'root' })
export class SellerTypeApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SellerType[]> {
    return this.http.get<SellerType[]>('/api/seller-types');
  }

  create(payload: SellerTypePayload): Observable<SellerType> {
    return this.http.post<SellerType>('/api/seller-types', payload);
  }

  update(id: string, payload: SellerTypePayload): Observable<SellerType> {
    return this.http.put<SellerType>(`/api/seller-types/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/seller-types/${id}`);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/master-data-api.service.spec.ts src/app/features/seller-types/seller-type-api.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/my-articles/master-data-api.service.spec.ts src/advance-registration/frontend/BAR.App/src/app/features/seller-types/seller-type-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/seller-types/seller-type-api.service.spec.ts
git commit -m "feat(bar-app): MasterDataApiService Update/Delete, SellerTypeApiService"
```

---

## Frontend — Geteilte Komponenten

### Task 7: `table` Shared-Component (Sortierung, Aktionsspalte, Badges, Empty-State)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts`

**Interfaces:**
- Produces: `Table<T>` Component. Inputs: `columns = input.required<ColumnConfig<T>[]>()`, `data = input.required<T[]>()`, `loading = input<boolean>(false)`, `actionColumn = input<ActionColumnConfig | null>(null)`, `emptyText = input<string>('Keine Einträge gefunden.')`, `title = input<string>('')`, `canAdd = input<boolean>(false)`. Outputs: `sortChange = output<SortState[]>()`, `actionClick = output<ActionClickEvent<T>>()`, `rowAdd = output<void>()`. Typen: `ColumnConfig<T> { field: string; header: string; type: 'text'|'number'|'currency'|'badge'; sortable?: boolean; badge?: (row: T) => { label: string; severity: 'success'|'warn'|'secondary'|'info'|'danger' } }`, `ActionColumnConfig { actions: { actionId: string; icon: string }[] }`, `SortState { field: string; order: 'asc'|'desc' }`, `ActionClickEvent<T> { actionId: string; row: T }`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Table, ColumnConfig } from './table';

interface Row { id: string; name: string; original: boolean; }

const COLUMNS: ColumnConfig<Row>[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'original', header: 'Original', type: 'badge', badge: (r) => (r.original ? { label: '✓ Original', severity: 'success' } : { label: 'Neu', severity: 'warn' }) }
];

const DATA: Row[] = [
  { id: '1', name: 'Nike', original: true },
  { id: '2', name: 'Adidas', original: false },
  { id: '3', name: 'Puma', original: true }
];

function create(data: Row[] = DATA) {
  const fixture = TestBed.createComponent(Table<Row>);
  fixture.componentRef.setInput('columns', COLUMNS);
  fixture.componentRef.setInput('data', data);
  fixture.detectChanges();
  return fixture;
}

describe('Table', () => {
  it('shows data unsorted initially', () => {
    const fixture = create();

    expect(fixture.componentInstance.sortedData()).toEqual(DATA);
  });

  it('single click sorts ascending by field', () => {
    const fixture = create();

    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);

    expect(fixture.componentInstance.sortedData().map((r) => r.name)).toEqual(['Adidas', 'Nike', 'Puma']);
    expect(fixture.componentInstance.sortOrder('name')).toBe('asc');
  });

  it('second click on same column sorts descending', () => {
    const fixture = create();
    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);

    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);

    expect(fixture.componentInstance.sortedData().map((r) => r.name)).toEqual(['Puma', 'Nike', 'Adidas']);
    expect(fixture.componentInstance.sortOrder('name')).toBe('desc');
  });

  it('third click on same column clears sort', () => {
    const fixture = create();
    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);
    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);

    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: false } as MouseEvent);

    expect(fixture.componentInstance.sortOrder('name')).toBeNull();
  });

  it('shift+click on a second column adds multi-sort with a badge index', () => {
    const fixture = create();
    fixture.componentInstance.onHeaderClick(COLUMNS[1], { shiftKey: false } as MouseEvent);

    fixture.componentInstance.onHeaderClick(COLUMNS[0], { shiftKey: true } as MouseEvent);

    expect(fixture.componentInstance.sortIndex('original')).toBe(0);
    expect(fixture.componentInstance.sortIndex('name')).toBe(1);
  });

  it('actionClick emits actionId and row', () => {
    const fixture = create();
    const emitted: { actionId: string; row: Row }[] = [];
    fixture.componentInstance.actionClick.subscribe((e) => emitted.push(e));

    fixture.componentInstance.onActionClick('edit', DATA[0]);

    expect(emitted).toEqual([{ actionId: 'edit', row: DATA[0] }]);
  });

  it('isEmpty() is true with no data', () => {
    const fixture = create([]);

    expect(fixture.componentInstance.isEmpty()).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/table/table.spec.ts`
Expected: FAIL — Komponente fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

export type ColumnType = 'text' | 'number' | 'currency' | 'badge';
export type BadgeSeverity = 'success' | 'warn' | 'secondary' | 'info' | 'danger';

export interface BadgeValue {
  label: string;
  severity: BadgeSeverity;
}

export interface ColumnConfig<T> {
  field: string;
  header: string;
  type: ColumnType;
  sortable?: boolean;
  badge?: (row: T) => BadgeValue;
}

export interface ActionButtonConfig {
  actionId: string;
  icon: string;
}

export interface ActionColumnConfig {
  actions: ActionButtonConfig[];
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

export interface ActionClickEvent<T> {
  actionId: string;
  row: T;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, ButtonModule, TagModule, SkeletonModule],
  template: `
    <div class="app-table">
      @if (title() || canAdd()) {
        <div class="app-table__toolbar">
          <h2>{{ title() }}</h2>
          @if (canAdd()) {
            <button pButton type="button" label="+ Neu" (click)="rowAdd.emit()"></button>
          }
        </div>
      }

      @if (loading()) {
        <table class="app-table__grid">
          <tbody>
            @for (row of [0, 1, 2, 3, 4]; track row) {
              <tr>
                @for (column of columns(); track column.field) {
                  <td><p-skeleton height="1.2rem" /></td>
                }
              </tr>
            }
          </tbody>
        </table>
      } @else if (isEmpty()) {
        <p class="app-table__empty">{{ emptyText() }}</p>
      } @else {
        <table class="app-table__grid app-table__grid--striped">
          <thead>
            <tr>
              @for (column of columns(); track column.field) {
                <th
                  [class.app-table__sortable]="column.sortable !== false"
                  (click)="onHeaderClick(column, $event)"
                >
                  {{ column.header }}
                  @if (sortOrder(column.field); as order) {
                    <span class="app-table__sort-icon">{{ order === 'asc' ? '▲' : '▼' }}</span>
                    <span class="app-table__sort-badge">{{ sortIndex(column.field) + 1 }}</span>
                  }
                </th>
              }
              @if (actionColumn()) { <th></th> }
            </tr>
          </thead>
          <tbody>
            @for (row of sortedData(); track row) {
              <tr class="app-table__row">
                @for (column of columns(); track column.field) {
                  <td>
                    @if (column.type === 'badge' && column.badge) {
                      <p-tag [value]="column.badge!(row).label" [severity]="column.badge!(row).severity" />
                    } @else {
                      {{ fieldValue(row, column.field) }}
                    }
                  </td>
                }
                @if (actionColumn(); as ac) {
                  <td class="app-table__actions">
                    @for (action of ac.actions; track action.actionId) {
                      <button pButton type="button" [icon]="action.icon" [rounded]="true" text (click)="onActionClick(action.actionId, row)"></button>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class Table<T> {
  readonly columns = input.required<ColumnConfig<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly actionColumn = input<ActionColumnConfig | null>(null);
  readonly emptyText = input<string>('Keine Einträge gefunden.');
  readonly title = input<string>('');
  readonly canAdd = input<boolean>(false);

  readonly sortChange = output<SortState[]>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  private readonly sortState = signal<SortState[]>([]);

  readonly isEmpty = computed(() => this.data().length === 0);

  readonly sortedData = computed(() => {
    const state = this.sortState();
    if (state.length === 0) {
      return this.data();
    }

    return [...this.data()].sort((a, b) => {
      for (const s of state) {
        const av = this.fieldValue(a, s.field);
        const bv = this.fieldValue(b, s.field);
        if (av === bv) continue;
        const cmp = av > bv ? 1 : -1;
        return s.order === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  fieldValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  onHeaderClick(column: ColumnConfig<T>, event: Pick<MouseEvent, 'shiftKey'>): void {
    if (column.sortable === false) return;

    const field = column.field;
    const current = this.sortState();
    const existing = current.find((s) => s.field === field);
    let next: SortState[];

    if (event.shiftKey) {
      if (!existing) {
        next = [...current, { field, order: 'asc' }];
      } else if (existing.order === 'asc') {
        next = current.map((s) => (s.field === field ? { field, order: 'desc' as const } : s));
      } else {
        next = current.filter((s) => s.field !== field);
      }
    } else if (!existing || current.length > 1) {
      next = [{ field, order: 'asc' }];
    } else if (existing.order === 'asc') {
      next = [{ field, order: 'desc' }];
    } else {
      next = [];
    }

    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  sortIndex(field: string): number {
    return this.sortState().findIndex((s) => s.field === field);
  }

  sortOrder(field: string): 'asc' | 'desc' | null {
    return this.sortState().find((s) => s.field === field)?.order ?? null;
  }

  onActionClick(actionId: string, row: T): void {
    this.actionClick.emit({ actionId, row });
  }
}
```

**Hinweis für den Ausführenden:** `Table<T>` als generische standalone Component — `TestBed.createComponent(Table<Row>)` funktioniert mit Angular 22, da die Generik nur den TypeScript-Typ betrifft, nicht die Laufzeit-Metadaten.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/shared/table/table.spec.ts`
Expected: PASS (7 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/table/
git commit -m "feat(bar-app): table Shared-Component (Sortierung, Aktionsspalte, Badges)"
```

---

### Task 8: `stammdaten-popup` Shared-Component (Marke/Kategorie anlegen + bearbeiten)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/stammdaten-popup/stammdaten-popup.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/stammdaten-popup/stammdaten-popup.spec.ts`

**Interfaces:**
- Consumes: `MasterDataItem` (Typ aus `master-data-api.service.ts`, Task 6 — nur der Typ, kein Service-Import, siehe Global Constraints).
- Produces: `StammdatenPopup` Component. Inputs: `visible = model<boolean>(false)`, `mode = input.required<'create' | 'edit'>()`, `entityLabel = input.required<string>()` (z. B. `'Marke'`), `item = input<MasterDataItem | null>(null)` (nur im Edit-Modus gesetzt), `saveFn = input.required<(name: string, original: boolean | undefined, id: string | undefined) => Observable<MasterDataItem>>()`. Output: `saved = output<MasterDataItem>()`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { StammdatenPopup } from './stammdaten-popup';
import { MessageService } from 'primeng/api';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

function create(mode: 'create' | 'edit', item: MasterDataItem | null, saveFn = vi.fn()) {
  TestBed.configureTestingModule({ providers: [MessageService] });
  const fixture = TestBed.createComponent(StammdatenPopup);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('entityLabel', 'Marke');
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return fixture;
}

describe('StammdatenPopup', () => {
  it('create mode starts with empty name and original=false', () => {
    const fixture = create('create', null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('edit mode pre-fills name and original from item', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };

    const fixture = create('edit', item);

    expect(fixture.componentInstance.name()).toBe('Nike');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('canSubmit() is false for blank name', () => {
    const fixture = create('create', null);
    fixture.componentInstance.name.set('   ');

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() in create mode calls saveFn with name, undefined original and no id, emits saved, closes', () => {
    const created: MasterDataItem = { id: 'b2', name: 'Puma', original: false };
    const saveFn = vi.fn(() => of(created));
    const fixture = create('create', null, saveFn);
    fixture.componentInstance.name.set('Puma');
    const emitted: MasterDataItem[] = [];
    fixture.componentInstance.saved.subscribe((i) => emitted.push(i));

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith('Puma', undefined, undefined);
    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() in edit mode calls saveFn with id and original flag', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };
    const updated: MasterDataItem = { ...item, name: 'Nike Neu', original: true };
    const saveFn = vi.fn(() => of(updated));
    const fixture = create('edit', item, saveFn);
    fixture.componentInstance.name.set('Nike Neu');
    fixture.componentInstance.original.set(true);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith('Nike Neu', true, 'b1');
  });

  it('submit() on 409 sets a field error and keeps the dialog open', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Nike existiert bereits' } })));
    const fixture = create('create', null, saveFn);
    fixture.componentInstance.name.set('Nike');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Nike existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/stammdaten-popup/stammdaten-popup.spec.ts`
Expected: FAIL — Komponente fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

@Component({
  selector: 'app-stammdaten-popup',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="mode() === 'create' ? 'Neue ' + entityLabel() : entityLabel() + ' bearbeiten'">
      <div class="field">
        <label for="stammdaten-name">Name</label>
        <input id="stammdaten-name" pInputText [(ngModel)]="nameModel" autofocus />
        @if (nameError()) {
          <small class="field-error">{{ nameError() }}</small>
        }
      </div>

      @if (mode() === 'edit') {
        <div class="field">
          <label for="stammdaten-original">Original</label>
          <p-toggleswitch id="stammdaten-original" [(ngModel)]="originalModel" />
        </div>
      }

      <div class="dialog-footer">
        <button pButton type="button" label="Abbrechen" class="p-button-text p-button-secondary" (click)="cancel()"></button>
        <button pButton type="button" [label]="mode() === 'create' ? 'Anlegen' : 'Speichern'" [disabled]="!canSubmit()" (click)="submit()"></button>
      </div>
    </p-dialog>
  `
})
export class StammdatenPopup {
  private readonly messageService = inject(MessageService);

  readonly visible = model<boolean>(false);
  readonly mode = input.required<'create' | 'edit'>();
  readonly entityLabel = input.required<string>();
  readonly item = input<MasterDataItem | null>(null);
  readonly saveFn = input.required<(name: string, original: boolean | undefined, id: string | undefined) => Observable<MasterDataItem>>();
  readonly saved = output<MasterDataItem>();

  readonly name = signal('');
  readonly original = signal(false);
  readonly nameError = signal<string | null>(null);

  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); this.nameError.set(null); }

  get originalModel() { return this.original(); }
  set originalModel(v: boolean) { this.original.set(v); }

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }

  readonly canSubmit = computed(() => this.name().trim().length > 0);

  constructor() {
    effect(() => {
      if (this.visible()) {
        const current = this.item();
        this.name.set(current?.name ?? '');
        this.original.set(current?.original ?? false);
        this.nameError.set(null);
      }
    });
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const isEdit = this.mode() === 'edit';
    this.saveFn()(this.name().trim(), isEdit ? this.original() : undefined, isEdit ? this.item()?.id : undefined).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: `✓ ${this.entityLabel()} gespeichert` });
        this.saved.emit(result);
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.nameError.set(
          err.status === 409 ? (err.error?.detail ?? 'Name existiert bereits') : 'Speichern fehlgeschlagen'
        );
      }
    });
  }
}
```

**Hinweis für den Ausführenden:** `ToggleSwitchModule` ist der PrimeNG-22-Ersatz für das ältere `InputSwitchModule` — vor dem Implementieren mit `mcp__primeng__get_component` (Komponente `toggleswitch`) den exakten Selector/Property-Namen für diese PrimeNG-Version verifizieren, falls er von `<p-toggleswitch [(ngModel)]>` abweicht.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/shared/stammdaten-popup/stammdaten-popup.spec.ts`
Expected: PASS (7 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/stammdaten-popup/
git commit -m "feat(bar-app): stammdaten-popup Shared-Component (Marke/Kategorie anlegen+bearbeiten)"
```

---

### Task 9: `typ-popup` Shared-Component (Verkäufer-Typ anlegen + bearbeiten)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/typ-popup/typ-popup.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/typ-popup/typ-popup.spec.ts`

**Interfaces:**
- Consumes: `SellerType`/`SellerTypePayload` (Typen aus `seller-type-api.service.ts`, Task 6 — nur die Typen).
- Produces: `TypPopup` Component. Inputs: `visible = model<boolean>(false)`, `item = input<SellerType | null>(null)` (Edit), `saveFn = input.required<(payload: SellerTypePayload, id: string | undefined) => Observable<SellerType>>()`. Output: `saved = output<SellerType>()`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TypPopup } from './typ-popup';
import { MessageService } from 'primeng/api';
import type { SellerType } from '../../features/seller-types/seller-type-api.service';

function create(item: SellerType | null, saveFn = vi.fn()) {
  TestBed.configureTestingModule({ providers: [MessageService] });
  const fixture = TestBed.createComponent(TypPopup);
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return fixture;
}

describe('TypPopup', () => {
  it('create mode (no item) starts with empty fields', () => {
    const fixture = create(null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.commissionRate()).toBe(0);
    expect(fixture.componentInstance.itemFee()).toBe(0);
  });

  it('edit mode pre-fills all three fields from item', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };

    const fixture = create(item);

    expect(fixture.componentInstance.name()).toBe('Standard');
    expect(fixture.componentInstance.commissionRate()).toBe(12.5);
    expect(fixture.componentInstance.itemFee()).toBe(0.5);
  });

  it('canSubmit() is false when commissionRate is out of 0-100 range', () => {
    const fixture = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.commissionRate.set(150);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('canSubmit() is false when itemFee is negative', () => {
    const fixture = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.itemFee.set(-1);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() calls saveFn with payload and no id in create mode, emits saved, closes', () => {
    const created: SellerType = { id: 't2', name: 'Gewerblich', commissionRate: 20, itemFee: 1, sellerCount: 0 };
    const saveFn = vi.fn(() => of(created));
    const fixture = create(null, saveFn);
    fixture.componentInstance.name.set('Gewerblich');
    fixture.componentInstance.commissionRate.set(20);
    fixture.componentInstance.itemFee.set(1);
    const emitted: SellerType[] = [];
    fixture.componentInstance.saved.subscribe((t) => emitted.push(t));

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith({ name: 'Gewerblich', commissionRate: 20, itemFee: 1 }, undefined);
    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() passes the item id in edit mode', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };
    const updated: SellerType = { ...item, commissionRate: 15 };
    const saveFn = vi.fn(() => of(updated));
    const fixture = create(item, saveFn);
    fixture.componentInstance.commissionRate.set(15);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith({ name: 'Standard', commissionRate: 15, itemFee: 0.5 }, 't1');
  });

  it('submit() on error keeps the dialog open and sets an error message', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Bezeichnung existiert bereits' } })));
    const fixture = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Bezeichnung existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/typ-popup/typ-popup.spec.ts`
Expected: FAIL — Komponente fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import type { SellerType, SellerTypePayload } from '../../features/seller-types/seller-type-api.service';

@Component({
  selector: 'app-typ-popup',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="item() ? 'Verkäufer-Typ bearbeiten' : 'Neuer Verkäufer-Typ'">
      <div class="field">
        <label for="typ-name">Name</label>
        <input id="typ-name" pInputText [(ngModel)]="nameModel" autofocus />
        @if (nameError()) {
          <small class="field-error">{{ nameError() }}</small>
        }
      </div>

      <div class="field">
        <label for="typ-commission">Provision (%)</label>
        <p-inputnumber id="typ-commission" [(ngModel)]="commissionRateModel" mode="decimal" [minFractionDigits]="2" suffix="%" [min]="0" [max]="100" />
      </div>

      <div class="field">
        <label for="typ-fee">Gebühr (€)</label>
        <p-inputnumber id="typ-fee" [(ngModel)]="itemFeeModel" mode="currency" currency="EUR" locale="de-DE" [min]="0" />
      </div>

      <div class="dialog-footer">
        <button pButton type="button" label="Abbrechen" class="p-button-text p-button-secondary" (click)="cancel()"></button>
        <button pButton type="button" label="Speichern" [disabled]="!canSubmit()" (click)="submit()"></button>
      </div>
    </p-dialog>
  `
})
export class TypPopup {
  private readonly messageService = inject(MessageService);

  readonly visible = model<boolean>(false);
  readonly item = input<SellerType | null>(null);
  readonly saveFn = input.required<(payload: SellerTypePayload, id: string | undefined) => Observable<SellerType>>();
  readonly saved = output<SellerType>();

  readonly name = signal('');
  readonly commissionRate = signal(0);
  readonly itemFee = signal(0);
  readonly nameError = signal<string | null>(null);

  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); this.nameError.set(null); }

  get commissionRateModel() { return this.commissionRate(); }
  set commissionRateModel(v: number) { this.commissionRate.set(v); }

  get itemFeeModel() { return this.itemFee(); }
  set itemFeeModel(v: number) { this.itemFee.set(v); }

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }

  readonly canSubmit = computed(() =>
    this.name().trim().length > 0 &&
    this.commissionRate() >= 0 && this.commissionRate() <= 100 &&
    this.itemFee() >= 0
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        const current = this.item();
        this.name.set(current?.name ?? '');
        this.commissionRate.set(current?.commissionRate ?? 0);
        this.itemFee.set(current?.itemFee ?? 0);
        this.nameError.set(null);
      }
    });
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const payload: SellerTypePayload = { name: this.name().trim(), commissionRate: this.commissionRate(), itemFee: this.itemFee() };
    this.saveFn()(payload, this.item()?.id).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: '✓ Verkäufer-Typ gespeichert' });
        this.saved.emit(result);
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.nameError.set(
          err.status === 409 ? (err.error?.detail ?? 'Bezeichnung existiert bereits') : 'Speichern fehlgeschlagen'
        );
      }
    });
  }
}
```

**Hinweis für den Ausführenden:** `p-inputnumber` Property-Namen (`mode`, `suffix`, `currency`, `locale`) vor dem Implementieren mit `mcp__primeng__get_component` (Komponente `inputnumber`) gegen die installierte PrimeNG-22-Version verifizieren.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/shared/typ-popup/typ-popup.spec.ts`
Expected: PASS (7 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/typ-popup/
git commit -m "feat(bar-app): typ-popup Shared-Component (Verkaeufer-Typ anlegen+bearbeiten)"
```

---

## Frontend — Admin-Seiten

### Task 10: `BrandsPage` verdrahten

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/brands/pages/BrandsPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/brands/pages/BrandsPage.spec.ts`

**Interfaces:**
- Consumes: `MasterDataApiService` (Task 6), `Table<MasterDataItem>` (Task 7), `StammdatenPopup` (Task 8), `MessageService`/`ConfirmationService` (Task 1).
- Produces: fertige Seite unter Route `/brands`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BrandsPage } from './BrandsPage';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([
    { id: 'b1', name: 'Nike', original: true, articleCount: 0 },
    { id: 'b2', name: 'Adidas', original: false, articleCount: 3 }
  ]));
  const fixture = TestBed.createComponent(BrandsPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('BrandsPage', () => {
  it('loads brands on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalledWith('brands');
    expect(fixture.componentInstance.brands().length).toBe(2);
  });

  it('openCreate() opens the popup in create mode', () => {
    const { fixture } = create();

    fixture.componentInstance.openCreate();

    expect(fixture.componentInstance.popupMode()).toBe('create');
    expect(fixture.componentInstance.popupItem()).toBeNull();
    expect(fixture.componentInstance.popupVisible()).toBe(true);
  });

  it('onTableAction("edit", row) opens the popup in edit mode with that row', () => {
    const { fixture } = create();
    const row = { id: 'b2', name: 'Adidas', original: false, articleCount: 3 };

    fixture.componentInstance.onTableAction({ actionId: 'edit', row });

    expect(fixture.componentInstance.popupMode()).toBe('edit');
    expect(fixture.componentInstance.popupItem()).toBe(row);
    expect(fixture.componentInstance.popupVisible()).toBe(true);
  });

  it('onSaved() reloads the list', () => {
    const { fixture, api } = create();
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.onSaved();

    expect(api.getAll).toHaveBeenCalledWith('brands');
  });

  it('deleteBrand(row) calls MasterDataApiService.delete and reloads on success', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.deleteBrand({ id: 'b2', name: 'Adidas', original: false, articleCount: 3 });

    expect(deleteSpy).toHaveBeenCalledWith('brands', 'b2');
    expect(api.getAll).toHaveBeenCalledWith('brands');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/brands/pages/BrandsPage.spec.ts`
Expected: FAIL — `BrandsPage` ist aktuell nur `<h1>Marken</h1>`.

- [ ] **Step 3: Implement**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '../../../shared/table/table';
import { StammdatenPopup } from '../../../shared/stammdaten-popup/stammdaten-popup';
import { MasterDataApiService, MasterDataItem } from '../../my-articles/master-data-api.service';

const COLUMNS: ColumnConfig<MasterDataItem>[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'original', header: 'Original', type: 'badge', badge: (r) => (r.original ? { label: '✓ Original', severity: 'success' } : { label: 'Neu', severity: 'warn' }) },
  { field: 'articleCount', header: 'Artikel', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil' },
    { actionId: 'delete', icon: 'pi pi-trash' }
  ]
};

@Component({
  selector: 'app-brands-page',
  imports: [Table, StammdatenPopup],
  template: `
    <app-table
      title="Marken"
      [columns]="COLUMNS"
      [data]="brands()"
      [loading]="loading()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-stammdaten-popup
      [(visible)]="popupVisibleModel"
      [mode]="popupMode()"
      entityLabel="Marke"
      [item]="popupItem()"
      [saveFn]="saveFn"
      (saved)="onSaved()"
    />
  `
})
export class BrandsPage implements OnInit {
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS;
  protected readonly ACTION_COLUMN = ACTION_COLUMN;

  readonly brands = signal<MasterDataItem[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly popupItem = signal<MasterDataItem | null>(null);

  readonly saveFn = (name: string, original: boolean | undefined, id: string | undefined) =>
    id ? this.masterDataApi.update('brands', id, { name, original: original ?? false }) : this.masterDataApi.create('brands', name);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.masterDataApi.getAll('brands').subscribe((items) => {
      this.brands.set(items);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.popupMode.set('create');
    this.popupItem.set(null);
    this.popupVisible.set(true);
  }

  onTableAction(event: ActionClickEvent<MasterDataItem>): void {
    if (event.actionId === 'edit') {
      this.popupMode.set('edit');
      this.popupItem.set(event.row);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  confirmDelete(row: MasterDataItem): void {
    this.confirmationService.confirm({
      message: `Marke „${row.name}" wirklich löschen?`,
      accept: () => this.deleteBrand(row)
    });
  }

  deleteBrand(row: MasterDataItem): void {
    this.masterDataApi.delete('brands', row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Marke gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Marke wird noch verwendet') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/brands/pages/BrandsPage.spec.ts`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/brands/
git commit -m "feat(bar-app): BrandsPage verdrahtet (Liste, Anlegen, Bearbeiten, Loeschen)"
```

---

### Task 11: `CategoriesPage` verdrahten

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/categories/pages/CategoriesPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/categories/pages/CategoriesPage.spec.ts`

**Interfaces:**
- Consumes: dieselben Bausteine wie Task 10, `resource: 'categories'` statt `'brands'`.
- Produces: fertige Seite unter Route `/categories`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriesPage } from './CategoriesPage';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([{ id: 'c1', name: 'Jacken', original: true, articleCount: 2 }]));
  const fixture = TestBed.createComponent(CategoriesPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('CategoriesPage', () => {
  it('loads categories on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.categories().length).toBe(1);
  });

  it('deleteCategory(row) calls MasterDataApiService.delete with "categories"', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));

    fixture.componentInstance.deleteCategory({ id: 'c1', name: 'Jacken', original: true, articleCount: 2 });

    expect(deleteSpy).toHaveBeenCalledWith('categories', 'c1');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/categories/pages/CategoriesPage.spec.ts`
Expected: FAIL — `CategoriesPage` ist aktuell nur `<h1>Kategorien</h1>`.

- [ ] **Step 3: Implement**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '../../../shared/table/table';
import { StammdatenPopup } from '../../../shared/stammdaten-popup/stammdaten-popup';
import { MasterDataApiService, MasterDataItem } from '../../my-articles/master-data-api.service';

const COLUMNS: ColumnConfig<MasterDataItem>[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'original', header: 'Original', type: 'badge', badge: (r) => (r.original ? { label: '✓ Original', severity: 'success' } : { label: 'Neu', severity: 'warn' }) },
  { field: 'articleCount', header: 'Artikel', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil' },
    { actionId: 'delete', icon: 'pi pi-trash' }
  ]
};

@Component({
  selector: 'app-categories-page',
  imports: [Table, StammdatenPopup],
  template: `
    <app-table
      title="Kategorien"
      [columns]="COLUMNS"
      [data]="categories()"
      [loading]="loading()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-stammdaten-popup
      [(visible)]="popupVisibleModel"
      [mode]="popupMode()"
      entityLabel="Kategorie"
      [item]="popupItem()"
      [saveFn]="saveFn"
      (saved)="onSaved()"
    />
  `
})
export class CategoriesPage implements OnInit {
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS;
  protected readonly ACTION_COLUMN = ACTION_COLUMN;

  readonly categories = signal<MasterDataItem[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly popupItem = signal<MasterDataItem | null>(null);

  readonly saveFn = (name: string, original: boolean | undefined, id: string | undefined) =>
    id ? this.masterDataApi.update('categories', id, { name, original: original ?? false }) : this.masterDataApi.create('categories', name);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.masterDataApi.getAll('categories').subscribe((items) => {
      this.categories.set(items);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.popupMode.set('create');
    this.popupItem.set(null);
    this.popupVisible.set(true);
  }

  onTableAction(event: ActionClickEvent<MasterDataItem>): void {
    if (event.actionId === 'edit') {
      this.popupMode.set('edit');
      this.popupItem.set(event.row);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  confirmDelete(row: MasterDataItem): void {
    this.confirmationService.confirm({
      message: `Kategorie „${row.name}" wirklich löschen?`,
      accept: () => this.deleteCategory(row)
    });
  }

  deleteCategory(row: MasterDataItem): void {
    this.masterDataApi.delete('categories', row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Kategorie gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Kategorie wird noch verwendet') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/categories/pages/CategoriesPage.spec.ts`
Expected: PASS (2 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/categories/
git commit -m "feat(bar-app): CategoriesPage verdrahtet (Liste, Anlegen, Bearbeiten, Loeschen)"
```

---

### Task 12: `SellerTypesPage` verdrahten

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/pages/SellerTypesPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/pages/SellerTypesPage.spec.ts`

**Interfaces:**
- Consumes: `SellerTypeApiService` (Task 6), `Table<SellerType>` (Task 7), `TypPopup` (Task 9).
- Produces: fertige Seite unter Route `/seller-types`, inkl. Leerzustand-Sondertext (`components/table/component.md`).

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellerTypesPage } from './SellerTypesPage';
import { SellerTypeApiService } from '../seller-type-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(SellerTypeApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([{ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 }]));
  const fixture = TestBed.createComponent(SellerTypesPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SellerTypesPage', () => {
  it('loads seller types on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalled();
    expect(fixture.componentInstance.sellerTypes().length).toBe(1);
  });

  it('exposes the blocking empty-state text', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.emptyText).toContain('Ohne Typ ist keine Registrierung möglich');
  });

  it('deleteType(row) calls SellerTypeApiService.delete and reloads on success', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.deleteType({ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 });

    expect(deleteSpy).toHaveBeenCalledWith('t1');
    expect(api.getAll).toHaveBeenCalled();
  });

  it('deleteType(row) on 409 shows the server error as a toast, not silently', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'delete').mockReturnValue(
      new Observable((subscriber) => subscriber.error({ status: 409, error: { detail: 'Verkäufer-Typ wird noch verwendet' } }))
    );
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.deleteType({ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Verkäufer-Typ wird noch verwendet' }));
  });
});
```

**Hinweis für den Ausführenden:** `import { Observable } from 'rxjs';` am Dateikopf ergänzen (für den letzten Test).

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/seller-types/pages/SellerTypesPage.spec.ts`
Expected: FAIL — `SellerTypesPage` ist aktuell nur `<h1>Verkäufer-Typen</h1>`.

- [ ] **Step 3: Implement**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '../../../shared/table/table';
import { TypPopup } from '../../../shared/typ-popup/typ-popup';
import { SellerTypeApiService, SellerType } from '../seller-type-api.service';

const COLUMNS: ColumnConfig<SellerType>[] = [
  { field: 'name', header: 'Bezeichnung', type: 'text' },
  { field: 'commissionRate', header: 'Provision %', type: 'number' },
  { field: 'itemFee', header: 'Gebühr €', type: 'currency' },
  { field: 'sellerCount', header: 'Verkäufer', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil' },
    { actionId: 'delete', icon: 'pi pi-trash' }
  ]
};

@Component({
  selector: 'app-seller-types-page',
  imports: [Table, TypPopup],
  template: `
    <app-table
      title="Verkäufer-Typen"
      [columns]="COLUMNS"
      [data]="sellerTypes()"
      [loading]="loading()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      [emptyText]="emptyText"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-typ-popup
      [(visible)]="popupVisibleModel"
      [item]="popupItem()"
      [saveFn]="saveFn"
      (saved)="onSaved()"
    />
  `
})
export class SellerTypesPage implements OnInit {
  private readonly sellerTypeApi = inject(SellerTypeApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS;
  protected readonly ACTION_COLUMN = ACTION_COLUMN;
  readonly emptyText = 'Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit + Neu beginnen.';

  readonly sellerTypes = signal<SellerType[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupItem = signal<SellerType | null>(null);

  readonly saveFn = (payload: { name: string; commissionRate: number; itemFee: number }, id: string | undefined) =>
    id ? this.sellerTypeApi.update(id, payload) : this.sellerTypeApi.create(payload);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.sellerTypeApi.getAll().subscribe((items) => {
      this.sellerTypes.set(items);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.popupItem.set(null);
    this.popupVisible.set(true);
  }

  onTableAction(event: ActionClickEvent<SellerType>): void {
    if (event.actionId === 'edit') {
      this.popupItem.set(event.row);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  confirmDelete(row: SellerType): void {
    this.confirmationService.confirm({
      message: `Verkäufer-Typ „${row.name}" wirklich löschen? Betrifft ${row.sellerCount} Verkäufer.`,
      accept: () => this.deleteType(row)
    });
  }

  deleteType(row: SellerType): void {
    this.sellerTypeApi.delete(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Verkäufer-Typ gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Verkäufer-Typ wird noch verwendet') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/seller-types/pages/SellerTypesPage.spec.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Volle Frontend-Testsuite laufen lassen**

Run: `npx vitest run` (im Ordner `src/advance-registration/frontend/BAR.App`)
Expected: alle Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/seller-types/
git commit -m "feat(bar-app): SellerTypesPage verdrahtet (Liste, Anlegen, Bearbeiten, Loeschen)"
```

---

## Nacharbeiten (nicht Teil dieses Plans, im Review ansprechen)

- **Table ohne Paginierung/Spalten-Filter/Virtual-Scroll:** bewusst auf R05-Bedarf verkleinert (siehe Global Constraints). `components/table/component.md` AC-4 (Paginierung), AC-6/AC-7-Filterverhalten und Abschnitt 6 (Spalten-Filter-Overlay) sind offen. Das erste Epic mit großen Listen (Verkäufer R06, Alle Artikel R08) muss die Komponente erweitern, bevor es sie verwendet.
- **`ToggleSwitchModule`/`p-inputnumber`-API ungeprüft gegen die installierte PrimeNG-22-Version:** Tasks 8/9 enthalten einen Hinweis, das vor dem Implementieren mit `mcp__primeng__get_component` zu verifizieren — falls Property-Namen abweichen, betrifft das nur die Template-Bindings, nicht die getesteten Signals/Methoden.
- **Keine Bestätigungs-Formulierung mit Zahlen für Verkäufer-Typen-Löschung außer `sellerCount`:** `components/form.md` R-5 verlangt in der Haupt-App konkrete Werte in Lösch-Bestätigungen; für die Voranmelde-App reicht laut Doku die Nennung der betroffenen Verkäuferzahl (Task 12 `confirmDelete`) — falls das im Review nicht reicht, nachschärfen.

## Self-Review

**Spec-Abdeckung:** Toast/Confirm-Infrastruktur (Task 1) schließt die von R03 offen gelassene Lücke. Verkäufer-Typen-Backend komplett neu (Task 2-5, deckt `api/seller-types.md` GET/POST/PUT/DELETE inkl. `sellerCount`, `in_use`-vor-`is_default`-Prüfreihenfolge). Frontend-Services (Task 6) erweitern R03s `MasterDataApiService` um die in R05 gebrauchten Update/Delete-Aufrufe und liefern `SellerTypeApiService` neu. Geteilte Komponenten `table`/`stammdaten-popup`/`typ-popup` (Task 7-9) nach den drei jeweiligen `docs/components/*.md`-Spezifikationen. Drei Admin-Seiten (Task 10-12) verdrahten alles auf den bereits fertigen Routen/Guards/Sidebar-Einträgen aus Epic_App_Shell. Jede „Fertig, wenn"-Zeile aus `roadmap/R05-stammdaten.md` hat eine Entsprechung: Original/Neu-Badge (Task 7 Badge-Spalte + Task 10/11 Column-Config), Umbenennen-Kaskade (bereits in R03s `BrandRepository.UpdateAsync`, hier nur die UI dafür), Löschschutz 409 (Task 4/10/11/12 Fehlerpfade), Duplikat-Ablehnung (bereits R03-Backend, hier UI-Fehleranzeige in Task 8), Live-Wirkung Verkäufer-Typ (kein Snapshot-Feld — folgt direkt aus Task 4, keine eigene Task nötig), Sidebar/Routen-Sperre für Verkäufer (bereits vorhanden, siehe Kontext-Exploration — keine Task nötig).

**Placeholder-Scan:** Keine TODO/TBD-Reste. Zwei bewusste Deferrals sind explizit unter „Nacharbeiten" benannt, nicht stillschweigend ausgelassen.

**Typkonsistenz geprüft:** `MasterDataItem { id, name, original, articleCount? }` (Task 6) identisch in Task 8/10/11 verwendet. `SellerType`/`SellerTypePayload` (Task 6) identisch in Task 9/12. `ColumnConfig<T>`/`ActionColumnConfig`/`ActionClickEvent<T>`/`SortState` (Task 7) unverändert in Task 10/11/12 importiert. `SellerTypeResult(Id, Name, CommissionRate, ItemFee, SellerCount)` (Task 4) stimmt mit dem JSON-Body überein, den `SellerType` (Task 6) im Frontend deserialisiert (camelCase via Standard-`System.Text.Json`-Konvention, wie in allen bisherigen Endpoints). `CreateSellerTypeCommand`/`UpdateSellerTypeCommand` (Task 4) werden in Task 5 unverändert direkt als Minimal-API-Body-Parameter gebunden — kein Namens-Drift zwischen Application und Host.
