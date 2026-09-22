# Artikel-Umnummerierung in der Artikelannahme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersetzt das fehlerhafte Auto-Prefill im Artikelnummer-Hauptfeld der Artikelannahme durch einen expliziten Popup-Weg zum Laden eines vorregistrierten, noch nicht freigegebenen Artikels, und behebt die Karteileichen-Erzeugung beim Umnummerieren durch Löschen des Alt-Artikels beim finalen Buchen.

**Architecture:** Backend bekommt ein optionales `DeleteArticleNumber`-Feld pro Intake-Zeile, das `IntakeHandler` vor der bestehenden Create/Update-Logik als eigenen Lösch-Schritt abarbeitet. Frontend bekommt einen neuen, generischen dritten Mode-Button-Slot in `app-input-group` sowie ein neues, feature-lokales Lookup-Popup in der Artikelannahme; `intake-article-entry`s bisherige Auto-Prefill/Clear-Logik im Hauptfeld wird auf eine reine Vergeben-Prüfung eingedampft.

**Tech Stack:** Angular (Signals, Standalone Components), PrimeNG (`p-dialog`, `p-button`), .NET (FluentValidation, EF Core Unit-of-Work-Pattern), xUnit/Moq, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-22-intake-artikel-umnummerierung-design.md](../specs/2026-09-22-intake-artikel-umnummerierung-design.md)

## Global Constraints

- Code/Kommentare/Commit-Messages: englische Bezeichner, deutsche Prosa in Doku/UI-Texten (Projekt-CLAUDE.md).
- Ausschließlich PrimeNG-Komponenten, kein natives HTML für UI-Bausteine, für die es einen PrimeNG-Baustein gibt.
- `app-input-group`s bestehende Verwender (Checkout, Verkäufer-Suche, `session-item-popup`, `artikel-dialog`) dürfen sich nicht ändern — jede Erweiterung ist additiv/optional.
- Backend: jede neue Pflicht-/Optional-Regel eines Commands bekommt eine `AbstractValidator`-Regel (FluentValidation), analog den bestehenden Regeln in `IntakeCommandValidator.cs`.
- Race-Handling beim Buchen: passt der Alt-Artikel beim finalen Buchen nicht mehr zum erwarteten Zustand (anderer Verkäufer/schon freigegeben/nicht mehr vorhanden), wird das Löschen still übersprungen — kein Abbruch der Buchung (siehe Spec, Abschnitt "Backend").

---

### Task 1: Backend — `DeleteArticleNumber` an `IntakeCommand`

**Files:**
- Modify: `src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommand.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommandValidator.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Intake/IntakeCommandValidatorTests.cs`

**Interfaces:**
- Produces: `IntakeArticleLine.DeleteArticleNumber` (`int?`) — konsumiert von Task 2 (`IntakeHandler`).

- [ ] **Step 1: Bestehende Validator-Tests lesen, um Testmuster zu übernehmen**

Read: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Intake/IntakeCommandValidatorTests.cs` (Aufbau der bestehenden `RuleForEach`-Tests für `Articles`).

- [ ] **Step 2: Failing Test für die neue Validierungsregel schreiben**

In `IntakeCommandValidatorTests.cs` (gleiche Klasse, gleiches Muster wie die bestehenden `Number`/`Price`-Tests) ergänzen:

```csharp
[Fact]
public void DeleteArticleNumber_ZeroOrNegative_IsInvalid()
{
    var command = ValidCommand();
    command.Articles[0].DeleteArticleNumber = 0;

    var result = new IntakeCommandValidator().Validate(command);

    Assert.False(result.IsValid);
}

[Fact]
public void DeleteArticleNumber_Null_IsValid()
{
    var command = ValidCommand();
    command.Articles[0].DeleteArticleNumber = null;

    var result = new IntakeCommandValidator().Validate(command);

    Assert.True(result.IsValid);
}

[Fact]
public void DeleteArticleNumber_Positive_IsValid()
{
    var command = ValidCommand();
    command.Articles[0].DeleteArticleNumber = 1;

    var result = new IntakeCommandValidator().Validate(command);

    Assert.True(result.IsValid);
}
```

Falls die Testklasse noch keine `ValidCommand()`-Hilfsmethode hat, orientiere dich an der bestehenden Testklasse und ergänze eine private statische Methode, die ein gültiges `IntakeCommand` mit genau einer gültigen `IntakeArticleLine` zurückgibt (`Number = 1043`, alle Pflichtfelder gefüllt) — exakt wie es die bestehenden Tests der Klasse bereits für ihre eigenen Fälle brauchen. Wiederverwende die bestehende Helper-Methode, falls schon vorhanden.

- [ ] **Step 3: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter "FullyQualifiedName~IntakeCommandValidatorTests"`
Expected: Compile-Fehler — `DeleteArticleNumber` existiert noch nicht auf `IntakeArticleLine`.

- [ ] **Step 4: `DeleteArticleNumber` auf `IntakeArticleLine` ergänzen**

In `IntakeCommand.cs`:

```csharp
public sealed class IntakeArticleLine
{
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// Gesetzt, wenn diese Zeile aus der Artikelannahme-Umnummerierung stammt (neuer
    /// Renumber-Popup-Weg, Epic_Artikelannahme): die Ursprungsnummer des vorregistrierten,
    /// noch nicht freigegebenen Artikels, der beim Buchen gelöscht werden soll, bevor
    /// <see cref="Number"/> als neuer Artikel angelegt wird.
    /// </summary>
    public int? DeleteArticleNumber { get; set; }
}
```

- [ ] **Step 5: Validierungsregel ergänzen**

In `IntakeCommandValidator.cs`, innerhalb des bestehenden `RuleForEach(x => x.Articles).ChildRules(article => { ... })`-Blocks, nach der `Price`-Regel:

```csharp
article.RuleFor(x => x.DeleteArticleNumber).GreaterThan(0).When(x => x.DeleteArticleNumber.HasValue);
```

- [ ] **Step 6: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter "FullyQualifiedName~IntakeCommandValidatorTests"`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommand.cs src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommandValidator.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Intake/IntakeCommandValidatorTests.cs
git commit -m "feat(bazaar-app): add optional DeleteArticleNumber to intake command"
```

---

### Task 2: Backend — `IntakeHandler` löscht Alt-Artikel vor dem Buchen

**Files:**
- Modify: `src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Intake/IntakeHandlerTests.cs`

**Interfaces:**
- Consumes: `IntakeArticleLine.DeleteArticleNumber` (Task 1), `IArticleRepository.Remove(Article)` (bereits vorhanden, `IArticleRepository.cs:15`).
- Produces: keine neue öffentliche Schnittstelle — reine interne Verhaltensänderung von `IntakeHandler.Handle()`.

- [ ] **Step 1: Failing Test — Zielnummer frei, Alt-Artikel wird gelöscht, neuer Artikel unter Zielnummer angelegt**

In `IntakeHandlerTests.cs` ergänzen:

```csharp
[Fact]
public async Task Handle_LineWithDeleteArticleNumber_RemovesOldArticleAndCreatesNewOneUnderTargetNumber()
{
    var seller = CreateSeller(feePerItem: 3.00m);
    _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

    var oldArticle = Article.Create(
        "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
        null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
    Assert.Null(oldArticle.ReleasedAt);

    _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync(oldArticle);
    _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
    _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

    var line = Line(6, "Winterjacke Neu");
    line.DeleteArticleNumber = 1;
    var command = new IntakeCommand
    {
        SellerId = "SELLER001",
        FeeAmount = 3.00m,
        Articles = [line],
    };
    var sut = CreateSut();

    var result = await sut.Handle(command);

    Assert.Equal(["ARTICLE002"], result.ArticleIds);
    _articleRepository.Verify(r => r.Remove(oldArticle), Times.Once);
    _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 6 && a.Id == "ARTICLE002")), Times.Once);
    _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
}

[Fact]
public async Task Handle_LineWithDeleteArticleNumberEqualToTargetNumber_DeletesThenRecreatesRatherThanUpdatingInPlace()
{
    // Bewusste Design-Entscheidung (Spec: "kein Sonderfall Nummer unverändert") — auch wenn
    // Ziel- und Ursprungsnummer identisch sind, wird gelöscht + neu angelegt, nicht in-place
    // aktualisiert. Neue Artikel-ID beweist das (kein `Update()`-Aufruf auf den Alt-Artikel).
    var seller = CreateSeller(feePerItem: 3.00m);
    _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

    var oldArticle = Article.Create(
        "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
        null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
    _articleRepository.SetupSequence(r => r.GetByNumber(1))
        .ReturnsAsync(oldArticle)
        .ReturnsAsync((Article?)null); // nach dem Remove() ist Nummer 1 wieder frei

    _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

    var line = Line(1, "Winterjacke Neu");
    line.DeleteArticleNumber = 1;
    var command = new IntakeCommand
    {
        SellerId = "SELLER001",
        FeeAmount = 3.00m,
        Articles = [line],
    };
    var sut = CreateSut();

    var result = await sut.Handle(command);

    Assert.Equal(["ARTICLE002"], result.ArticleIds);
    _articleRepository.Verify(r => r.Remove(oldArticle), Times.Once);
    _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 1 && a.Id == "ARTICLE002")), Times.Once);
    _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
}

[Fact]
public async Task Handle_DeleteArticleNumber_AlreadyReleasedInTheMeantime_SkipsDeleteSilentlyAndStillBooksTarget()
{
    var seller = CreateSeller(feePerItem: 3.00m);
    _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

    var oldArticle = Article.Create(
        "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
        null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
    oldArticle.MarkAcceptedAndReleased(DateTimeOffset.UtcNow); // Race: inzwischen freigegeben
    _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync(oldArticle);
    _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
    _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

    var line = Line(6);
    line.DeleteArticleNumber = 1;
    var command = new IntakeCommand
    {
        SellerId = "SELLER001",
        FeeAmount = 3.00m,
        Articles = [line],
    };
    var sut = CreateSut();

    var result = await sut.Handle(command);

    Assert.Equal(["ARTICLE002"], result.ArticleIds);
    _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
}

[Fact]
public async Task Handle_DeleteArticleNumber_AlreadyGoneInTheMeantime_SkipsDeleteSilently()
{
    var seller = CreateSeller(feePerItem: 3.00m);
    _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
    _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync((Article?)null);
    _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
    _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

    var line = Line(6);
    line.DeleteArticleNumber = 1;
    var command = new IntakeCommand
    {
        SellerId = "SELLER001",
        FeeAmount = 3.00m,
        Articles = [line],
    };
    var sut = CreateSut();

    var result = await sut.Handle(command);

    Assert.Equal(["ARTICLE002"], result.ArticleIds);
    _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter "FullyQualifiedName~IntakeHandlerTests"`
Expected: die vier neuen Tests FAILEN (Remove wird nie aufgerufen, `DeleteArticleNumber` wird ignoriert).

- [ ] **Step 3: Lösch-Vorverarbeitung in `IntakeHandler.Handle()` ergänzen**

In `IntakeHandler.cs`, innerhalb des `unitOfWork.ExecuteInTransactionAsync(async _ => { ... })`-Delegates, direkt nach `articleIds.Clear();` und VOR dem bestehenden `var toCreate = ...`-Block einfügen:

```csharp
foreach (var line in command.Articles)
{
    if (line.DeleteArticleNumber is not { } deleteNumber) continue;

    var oldArticle = await articleRepository.GetByNumber(deleteNumber);
    if (oldArticle is null || oldArticle.SellerId != command.SellerId || oldArticle.ReleasedAt is not null)
    {
        // Race zwischen "Übernehmen" und dem finalen Buchen (Zustand hat sich geändert oder
        // Artikel existiert nicht mehr) — Löschen wird bewusst still übersprungen, siehe
        // Spec "Backend" Abschnitt. Der Ziel-Artikel wird trotzdem normal angelegt.
        continue;
    }

    await articleRepository.Remove(oldArticle);
}
```

Der bestehende Klassen-Doc-Kommentar oberhalb der Klasse sollte um einen Satz zum neuen Verhalten ergänzt werden:

```csharp
/// <summary>
/// Books an entire intake request atomically (api/intake.md). For every
/// line, a free number creates a new article; a number pre-registered to
/// the same seller and not yet released is updated in place ("nachgebucht");
/// any other collision aborts the whole request with 409, since two intake
/// desks can race for the same free number the frontend saw a moment ago.
/// A line with <see cref="IntakeArticleLine.DeleteArticleNumber"/> set (Artikelannahme
/// renumber flow) first deletes that old pre-registered article — always, even if it equals
/// the line's own target number — before the usual create/update/conflict logic runs; a
/// stale/mismatched delete target is skipped silently rather than aborting the booking.
/// The fee is validated before the transaction (fail fast), everything else
/// — number resolution, writes, fee booking — runs inside one
/// IUnitOfWork transaction so a mid-loop failure never leaves a partially
/// booked box.
/// </summary>
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter "FullyQualifiedName~IntakeHandlerTests"`
Expected: PASS (alle Tests, auch die bereits bestehenden — Verhalten für Zeilen ohne `DeleteArticleNumber` ist unverändert).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Intake/IntakeHandlerTests.cs
git commit -m "feat(bazaar-app): delete old pre-registered article before booking a renumbered intake line"
```

---

### Task 3: Frontend — `deleteArticleNumber` an `IntakeArticleLine`

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/data/intake-api.ts`

**Interfaces:**
- Produces: `IntakeArticleLine.deleteArticleNumber?: number` — konsumiert von Task 8 (`intake-session-list.ts`).

- [ ] **Step 1: Feld ergänzen**

In `intake-api.ts`:

```ts
export interface IntakeArticleLine {
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string | null;
  color?: string | null;
  description?: string | null;
  deleteArticleNumber?: number;
}
```

Kein eigener Test nötig — reine Typ-Erweiterung ohne Verhalten, abgedeckt durch Task 8s Test.

- [ ] **Step 2: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/data/intake-api.ts
git commit -m "feat(bazaar-app): add optional deleteArticleNumber to IntakeArticleLine"
```

---

### Task 4: Frontend — `app-input-group` bekommt dritten Mode-Button-Slot + `focusAndSelect()`

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.ts`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.scss`
- Test: `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.spec.ts`

**Interfaces:**
- Produces: `extraModeButton: input<{ icon: string; badge: string | null } | null>`, `extraModeClicked: output<void>`, `focusAndSelect(): void` — konsumiert von Task 7 (`intake-article-entry`).

- [ ] **Step 1: Failing Test — Button wird nur gerendert, wenn `extraModeButton` gesetzt ist**

In `input-group.spec.ts` ergänzen (gleiche Datei, neue `describe`-Sektion):

```ts
describe('extra mode button (Artikelannahme Umnummerierung)', () => {
  function createWithExtra(extra: { icon: string; badge: string | null } | null) {
    const fixture = TestBed.createComponent(InputGroup);
    fixture.componentRef.setInput('modes', ['keyboard', 'camera', 'numpad']);
    fixture.componentRef.setInput('variant', 'search');
    fixture.componentRef.setInput('addonActionButtons', true);
    fixture.componentRef.setInput('extraModeButton', extra);
    fixture.detectChanges();
    return fixture;
  }

  it('renders no extra button when extraModeButton is null (every existing consumer)', () => {
    const fixture = createWithExtra(null);
    expect(fixture.nativeElement.querySelector('.input-group__mode-button--extra')).toBeNull();
  });

  it('renders the extra button with its icon and emits extraModeClicked on click', () => {
    const fixture = createWithExtra({ icon: 'pi pi-sync', badge: null });
    const clicked = vi.fn();
    fixture.componentInstance.extraModeClicked.subscribe(clicked);

    const button = fixture.nativeElement.querySelector('.input-group__mode-button--extra button');
    button.click();

    expect(clicked).toHaveBeenCalled();
  });

  it('renders the badge text when set, and no badge element when null', () => {
    const withBadge = createWithExtra({ icon: 'pi pi-sync', badge: '6' });
    expect(withBadge.nativeElement.querySelector('.input-group__mode-badge').textContent.trim()).toBe('6');

    const withoutBadge = createWithExtra({ icon: 'pi pi-sync', badge: null });
    expect(withoutBadge.nativeElement.querySelector('.input-group__mode-badge')).toBeNull();
  });
});

describe('focusAndSelect()', () => {
  it('focuses the native search input and selects its text', () => {
    const fixture = create(['keyboard'], 'search');
    fixture.componentInstance.applyExternalValue('1234');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');

    fixture.componentInstance.focusAndSelect();

    expect(document.activeElement).toBe(input);
    expect(selectSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npx vitest run src/app/shared/components/input-group/input-group.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: Compile-Fehler (`extraModeButton`/`extraModeClicked`/`focusAndSelect` existieren nicht).

- [ ] **Step 3: `InputGroup`-Klasse erweitern**

In `input-group.ts`, bei den übrigen `input()`/`output()`-Deklarationen (nach `inputId`) ergänzen:

```ts
/**
 * Optionaler dritter Mode-Button, zusätzlich zu den regulären Tastatur/Kamera/Nummernblock-
 * Buttons — Artikelannahmes Umnummerierungs-Popup (Epic_Artikelannahme). `null` (Default):
 * kein zusätzlicher Button, jeder bestehende Verwender (Checkout, Verkäufer-Suche,
 * `session-item-popup`, `artikel-dialog`) bleibt unverändert. Nur in der
 * `addonActionButtons()`-Mode-Row gerendert — die einzige Stelle, an der ein dritter,
 * gleichwertiger Button optisch Sinn ergibt.
 */
readonly extraModeButton = input<{ icon: string; badge: string | null } | null>(null);
readonly extraModeClicked = output<void>();
```

Nach `onSubmit()` eine neue öffentliche Methode ergänzen:

```ts
/**
 * Public entry point for a parent that just prefilled this field's value externally
 * (`applyExternalValue()`) and wants the user able to immediately overwrite it by
 * typing/scanning — Artikelannahme's Umnummerierungs-Popup. Only meaningful for the search
 * variant's native `<input>`.
 */
focusAndSelect(): void {
  const input = this.searchInputRef()?.nativeElement;
  if (!input) return;
  input.focus();
  input.select();
}
```

- [ ] **Step 4: Template um den dritten Button ergänzen**

In `input-group.ts`s Template, den bestehenden Block

```html
        @if (addonActionButtons() && visibleModes().length > 0) {
          <div class="input-group__mode-row">
            @for (mode of visibleModes(); track mode) {
              <p-button
                class="input-group__mode-button"
                [icon]="iconForMode(mode)"
                [text]="true"
                (onClick)="switchMode(mode)"
              />
            }
          </div>
        }
```

ersetzen durch:

```html
        @if ((addonActionButtons() && visibleModes().length > 0) || extraModeButton()) {
          <div class="input-group__mode-row">
            @for (mode of visibleModes(); track mode) {
              <p-button
                class="input-group__mode-button"
                [icon]="iconForMode(mode)"
                [text]="true"
                (onClick)="switchMode(mode)"
              />
            }
            @if (extraModeButton(); as extra) {
              <div class="input-group__mode-button input-group__mode-button--extra">
                <p-button [icon]="extra.icon" [text]="true" (onClick)="extraModeClicked.emit()" />
                @if (extra.badge) {
                  <span class="input-group__mode-badge">{{ extra.badge }}</span>
                }
              </div>
            }
          </div>
        }
```

- [ ] **Step 5: SCSS anpassen — Reihe verteilt sich automatisch auf 2 oder 3 Buttons**

In `input-group.scss`, den bestehenden Block

```scss
.input-group__mode-button {
  flex: 1 1 50%;
  width: 50%;

  ::ng-deep .p-button {
    width: 100%;
    border-radius: 0;
  }
}
```

ersetzen durch:

```scss
.input-group__mode-button {
  flex: 1 1 0;
  min-width: 0;

  ::ng-deep .p-button {
    width: 100%;
    border-radius: 0;
  }
}

.input-group__mode-button--extra {
  position: relative;
}

.input-group__mode-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 14px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  pointer-events: none;
}
```

(`flex: 1 1 0` statt fixer `50%`-Breite verteilt 2 Buttons weiterhin 50/50 und 3 Buttons automatisch 33/33/33 — kein weiterer Anpassungsbedarf für die bestehenden Zwei-Button-Verwender.)

- [ ] **Step 6: Tests laufen lassen, Erfolg bestätigen**

Run: `npx vitest run src/app/shared/components/input-group/input-group.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS (alle Tests, auch die bereits bestehenden).

- [ ] **Step 7: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.ts src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.scss src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.spec.ts
git commit -m "feat(bazaar-app): add optional third mode button with badge to app-input-group"
```

---

### Task 5: Frontend — neues Popup `IntakeRenumberLookupPopup`

**Files:**
- Create: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.ts`
- Create: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.html`
- Create: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.scss`
- Test: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.spec.ts`

**Interfaces:**
- Consumes: `ArticlesApi.getByNumber(number): Observable<ArticleByNumberResult>` (`src/bazaar-app/frontend/src/app/features/articles/data/articles-api.ts:135`).
- Produces: `visible: input.required<boolean>()`, `sellerId: input.required<string>()`, `visibleChange: output<boolean>()`, `articleFound: output<ArticleByNumberResult>()` — konsumiert von Task 7 (`intake-article-entry`).

- [ ] **Step 1: Failing Tests schreiben**

Create `intake-renumber-lookup-popup.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { IntakeRenumberLookupPopup } from './intake-renumber-lookup-popup';

const SELLER_ID = 'SEL00001';

function articleStub(overrides: Partial<ArticleByNumberResult> = {}): ArticleByNumberResult {
  return {
    id: 'ART00001',
    number: 1,
    name: 'Winterjacke',
    brand: 'Jack Wolfskin',
    category: 'Jacken',
    price: 12.5,
    size: '128',
    color: 'Blau',
    description: null,
    status: 'registered',
    sellerId: SELLER_ID,
    sellerName: 'Max Mustermann',
    ...overrides,
  };
}

async function setup(articlesApi = { getByNumber: vi.fn() }) {
  await TestBed.configureTestingModule({
    imports: [IntakeRenumberLookupPopup],
    providers: [{ provide: ArticlesApi, useValue: articlesApi }],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeRenumberLookupPopup);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('sellerId', SELLER_ID);
  fixture.detectChanges();

  return { fixture, articlesApi };
}

function numberGroup(fixture: ReturnType<typeof TestBed.createComponent<IntakeRenumberLookupPopup>>) {
  return fixture.debugElement.injector.get(InputGroup, null) ?? undefined;
}

describe('IntakeRenumberLookupPopup', () => {
  it('emits articleFound and closes when the number belongs to this seller and is still registered', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub())) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    const found = vi.fn();
    const visibleChange = vi.fn();
    component.articleFound.subscribe(found);
    component.visibleChange.subscribe(visibleChange);

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(articlesApi.getByNumber).toHaveBeenCalledWith(1);
    expect(found).toHaveBeenCalledWith(articleStub());
    expect(visibleChange).toHaveBeenCalledWith(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows an error and stays open when the number belongs to a different seller', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub({ sellerId: 'SEL00099' }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    const found = vi.fn();
    const visibleChange = vi.fn();
    component.articleFound.subscribe(found);
    component.visibleChange.subscribe(visibleChange);

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(found).not.toHaveBeenCalled();
    expect(visibleChange).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows an error and stays open when the article is already released', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub({ status: 'selling' }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows an error and stays open on 404 (number unknown)', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('999');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows a generic error message for anything other than 404', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Suche fehlgeschlagen. Bitte erneut versuchen.');
  });

  it('shows an error without calling the API when the field is empty', async () => {
    const articlesApi = { getByNumber: vi.fn() };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onLoad();

    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Bitte eine Artikelnummer eingeben');
  });

  it('resets number and error each time the popup becomes visible', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    component.onNumberChange('999');
    component.onLoad();
    await fixture.whenStable();
    expect(component.errorMessage()).not.toBeNull();

    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.errorMessage()).toBeNull();
    expect(component.rawNumber()).toBe('');
  });

  it('onCancel emits visibleChange(false) without calling the API', () => {
    const articlesApi = { getByNumber: vi.fn() };
    TestBed.configureTestingModule({
      imports: [IntakeRenumberLookupPopup],
      providers: [{ provide: ArticlesApi, useValue: articlesApi }],
    });
    const fixture = TestBed.createComponent(IntakeRenumberLookupPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('sellerId', SELLER_ID);
    fixture.detectChanges();
    const visibleChange = vi.fn();
    fixture.componentInstance.visibleChange.subscribe(visibleChange);

    fixture.componentInstance.onCancel();

    expect(visibleChange).toHaveBeenCalledWith(false);
    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
  });
});
```

Entferne die ungenutzte `numberGroup`-Hilfsfunktion falls sie in deinem Editor als unbenutzt markiert wird — sie ist optional und wurde nicht in den Assertions oben verwendet; lasse sie nur stehen, falls du sie für zusätzliche eigene DOM-Assertions brauchst.

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: FAIL — Modul `./intake-renumber-lookup-popup` existiert nicht.

- [ ] **Step 3: Komponente implementieren**

Create `intake-renumber-lookup-popup.ts`:

```ts
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
// Cross-feature import, read-only: `ArticlesApi.getByNumber()` — same sanctioned pattern
// `intake-article-entry.ts` already uses for the same API.
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';

/**
 * Popup für die Artikelannahme-Umnummerierung (Epic_Artikelannahme): sucht gezielt einen
 * vorregistrierten, noch nicht freigegebenen Artikel eines importierten Verkäufers per
 * Nummer. Reine Prüf-Funktion, keine sonstige Logik — ein Treffer wird per `articleFound`
 * nach oben gereicht, `intake-article-entry` übernimmt das Befüllen der Formularfelder
 * selbst (siehe dessen eigenen Doc-Kommentar zur Umnummerierung).
 */
@Component({
  selector: 'app-intake-renumber-lookup-popup',
  imports: [DialogModule, ButtonModule, InputGroup],
  templateUrl: './intake-renumber-lookup-popup.html',
  styleUrl: './intake-renumber-lookup-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeRenumberLookupPopup {
  private readonly articlesApi = inject(ArticlesApi);

  readonly visible = input.required<boolean>();
  readonly sellerId = input.required<string>();

  readonly visibleChange = output<boolean>();
  readonly articleFound = output<ArticleByNumberResult>();

  private readonly numberInputGroup = viewChild(InputGroup);

  readonly rawNumber = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.rawNumber.set('');
      this.errorMessage.set(null);
      this.loading.set(false);
      this.numberInputGroup()?.applyExternalValue('');
    });
  }

  onNumberChange(value: string | number): void {
    this.rawNumber.set(String(value));
  }

  onLoad(): void {
    const trimmed = this.rawNumber().trim();
    const number = Number.parseInt(trimmed, 10);
    if (!trimmed || !Number.isFinite(number)) {
      this.errorMessage.set('Bitte eine Artikelnummer eingeben');
      return;
    }

    this.loading.set(true);
    this.articlesApi.getByNumber(number).subscribe({
      next: (article) => this.handleResult(article),
      error: (error: unknown) => this.handleError(error),
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  private handleResult(article: ArticleByNumberResult): void {
    this.loading.set(false);
    const belongsToThisSeller = article.sellerId === this.sellerId();
    const stillRegistered = article.status === 'registered';

    if (!belongsToThisSeller || !stillRegistered) {
      this.errorMessage.set('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
      return;
    }

    this.articleFound.emit(article);
    this.visibleChange.emit(false);
  }

  private handleError(error: unknown): void {
    this.loading.set(false);
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.errorMessage.set('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
      return;
    }
    this.errorMessage.set('Suche fehlgeschlagen. Bitte erneut versuchen.');
  }
}
```

Create `intake-renumber-lookup-popup.html`:

```html
<p-dialog
  [visible]="visible()"
  (visibleChange)="visibleChange.emit($event)"
  [modal]="true"
  header="Artikel per Nummer laden"
  [style]="{ width: '22rem' }"
>
  <div class="intake-renumber-lookup-popup">
    <label for="intake-renumber-lookup-number">Artikelnummer</label>
    <app-input-group
      inputId="intake-renumber-lookup-number"
      variant="search"
      [modes]="['keyboard', 'numpad']"
      [showLeftAddon]="false"
      (valueChange)="onNumberChange($event)"
      (submitted)="onLoad()"
    />
    @if (errorMessage()) {
      <small class="intake-renumber-lookup-popup__error">{{ errorMessage() }}</small>
    }
  </div>

  <ng-template #footer>
    <div class="intake-renumber-lookup-popup__footer">
      <p-button [text]="true" severity="secondary" label="Abbrechen" (onClick)="onCancel()" />
      <p-button [text]="true" [disabled]="loading()" label="Laden" (onClick)="onLoad()" />
    </div>
  </ng-template>
</p-dialog>
```

Create `intake-renumber-lookup-popup.scss`:

```scss
.intake-renumber-lookup-popup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intake-renumber-lookup-popup__error {
  color: var(--p-red-700, #b91c1c);
}

.intake-renumber-lookup-popup__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup
git commit -m "feat(bazaar-app): add renumber lookup popup for pre-registered articles"
```

---

### Task 6: Frontend — `intake-article-entry`: Auto-Prefill/Clear-Mechanismus im Hauptfeld entfernen

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts`

**Interfaces:**
- Produces: `checkArticleNumber()` prüft künftig NUR noch, ob die Nummer vergeben ist (`numberTakenMessage`) — kein Prefill/Clear mehr. Wird von Task 7 unverändert weiterverwendet.

Dieser Task macht das Hauptfeld-Verhalten korrekt (Bug-Fix), BEVOR in Task 7 der neue Popup-Weg obendrauf kommt — so bleibt jeder Task für sich testbar/review-fähig.

- [ ] **Step 1: Obsolete Tests entfernen, neuen Test für das erwartete Verhalten schreiben**

In `intake-article-entry.spec.ts`, im `describe('Artikelnummer-Prüfung (getByNumber branching)', ...)`-Block:

Entferne komplett den Test `'200, belongs to this seller and still registered (pre-announced): prefills all Stammfelder, no message, fields stay editable'` und den Test `'clears stale prefilled Bezeichnung/Preis when the number changes to a different, free number'` (beide referenzieren den entfernten Prefill/Clear-Mechanismus).

Ergänze stattdessen:

```ts
it('200, belongs to this seller and still registered (pre-announced): no message, but no auto-prefill either (only the renumber popup prefills)', async () => {
  const articlesApi = articlesApiStub();
  articlesApi.getByNumber.mockReturnValue(
    of(articleByNumberStub({ sellerId: SELLER_ID, status: 'registered', name: 'Sommerkleid' })),
  );
  const { fixture } = await setup({ articlesApi });
  const component = fixture.componentInstance;

  numberInputGroup(fixture).valueChange.emit('1042');
  await fixture.whenStable();

  expect(component.numberTakenMessage()).toBeNull();
  expect(component.name()).toBe('');
});
```

Die übrigen Tests in diesem `describe`-Block (`404`, `belongs to a different seller`, `already released`, `submitted`, `does not clear a hand-typed …`, `ignores a stale next-number prefill …`) bleiben unverändert — sie prüfen ausschließlich die Vergeben-Logik bzw. den von diesem Task nicht angetasteten `numberFieldSeq`-Mechanismus und sind weiterhin gültig.

- [ ] **Step 2: Tests laufen lassen, Fehlschlag des neuen Tests bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: der neue Test FAILT (`component.name()` ist `'Sommerkleid'`, nicht `''`) — die beiden entfernten Tests fehlen jetzt einfach, keine Fehlschläge dort.

- [ ] **Step 3: `checkArticleNumber`/`handleArticleFound`/`handleArticleLookupError` vereinfachen**

In `intake-article-entry.ts`, den bestehenden Block

```ts
  private handleArticleFound(article: ArticleByNumberResult): void {
    const belongsToThisSeller = article.sellerId === this.sellerId();
    // Round-15 status model: `'registered'` is the only not-yet-released state — anything else
    // (selling/sold/returned) means the number is already in active use.
    const alreadyReleased = article.status !== 'registered';

    if (!belongsToThisSeller || alreadyReleased) {
      // Fix round 1 (reviewer Important 2): this number is a DIFFERENT article than whatever
      // the previous lookup may have prefilled — never leave that stale data sitting in
      // Bezeichnung/Preis behind a "vergeben" message the user can't get past without first
      // changing the number again.
      this.clearPrefilledFields();
      this.numberTakenMessage.set('Artikelnummer bereits vergeben');
      return;
    }

    // Own seller, pre-announced, not yet released — prefill every Stammfeld and keep it all
    // editable (Epic_Artikelannahme Abschnitt 2, "Sonderfall importierter Verkäufer").
    this.numberTakenMessage.set(null);
    this.name.set(article.name);
    this.category.set(article.category);
    this.brand.set(article.brand);
    this.size.set(article.size ?? '');
    this.color.set(article.color ?? '');
    this.description.set(article.description ?? '');
    this.price.set(article.price);
    // Direct call rather than the generic `pendingPriceValue` signal/effect indirection: by the
    // time a lookup can fire at all, the view (and `priceInputGroup`'s viewChild) is guaranteed
    // already resolved, and going through `pendingPriceValue` here would let its own
    // `applyExternalValue()` round-trip (which re-emits `valueChange` -> `onPriceChange()`, which
    // clears `prefillActive`) race against setting `prefillActive = true` below in the wrong
    // order.
    this.priceInputGroup()?.applyExternalValue(String(article.price));
    this.prefillActive = true;
  }

  private handleArticleLookupError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      // Number is free — normal new-entry flow, clear any stale "vergeben" message AND any
      // stale Bezeichnung/Preis a PREVIOUS number's found-article prefill left behind (fix round
      // 1, reviewer Important 2) — this number was never confirmed to be that same article.
      this.numberTakenMessage.set(null);
      this.clearPrefilledFields();
    }
  }

  /** Fix round 1 (reviewer Important 2), extended to all Stammfelder: resets them back to
   * empty/default, but ONLY when they currently hold a previous lookup's prefilled values
   * (`prefillActive`) — never clobbers values the user is genuinely hand-typing for a fresh
   * entry that never went through a found-article prefill in the first place. */
  private clearPrefilledFields(): void {
    if (!this.prefillActive) return;
    this.name.set('');
    this.category.set('');
    this.brand.set('');
    this.size.set('');
    this.color.set('');
    this.description.set('');
    this.price.set(0);
    this.priceInputGroup()?.applyExternalValue('');
    this.prefillActive = false;
  }
```

ersetzen durch:

```ts
  /** Reine Vergeben-Prüfung (Epic_Artikelannahme): die Nummer gehört einem anderen Verkäufer
   * ODER ist bereits freigegeben. Kein Auto-Prefill mehr am Hauptfeld — das Laden eines
   * vorregistrierten, noch nicht freigegebenen Artikels läuft ausschließlich über das
   * `app-intake-renumber-lookup-popup` (`onArticleFoundViaRenumberPopup()`). */
  private handleArticleFound(article: ArticleByNumberResult): void {
    const belongsToThisSeller = article.sellerId === this.sellerId();
    // Round-15 status model: `'registered'` is the only not-yet-released state — anything else
    // (selling/sold/returned) means the number is already in active use.
    const alreadyReleased = article.status !== 'registered';
    this.numberTakenMessage.set(!belongsToThisSeller || alreadyReleased ? 'Artikelnummer bereits vergeben' : null);
  }

  private handleArticleLookupError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.numberTakenMessage.set(null);
    }
  }
```

Entferne das private Feld `private prefillActive = false;` und seinen Doc-Kommentar komplett.

Entferne in jedem der folgenden Handler die jeweils letzte Zeile `this.prefillActive = false;`, sodass sie nur noch den Wert setzen:

```ts
  onNameChange(value: string): void {
    this.name.set(value);
  }

  onPriceChange(value: string | number): void {
    this.price.set(typeof value === 'number' ? value : Number(value));
  }

  onCategoryChange(value: string): void {
    this.category.set(value);
  }

  onBrandChange(value: string): void {
    this.brand.set(value);
  }

  onSizeChange(value: string): void {
    this.size.set(value);
  }

  onColorChange(value: string): void {
    this.color.set(value);
  }

  onDescriptionChange(value: string): void {
    this.description.set(value);
  }
```

(Der Doc-Kommentar über `onNameChange` — `/** Manual edit to Bezeichnung — no longer counts as a lookup-prefilled value … */` — entfällt ebenfalls, da er sich auf den entfernten Mechanismus bezieht.)

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts
git commit -m "fix(bazaar-app): stop auto-prefill/clear on the intake Artikelnummer field"
```

---

### Task 7: Frontend — Renumber-Popup, Badge und X-Reset in `intake-article-entry` verdrahten

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts`

**Interfaces:**
- Consumes: `IntakeRenumberLookupPopup` (Task 5), `InputGroup.focusAndSelect()`/`extraModeButton`/`extraModeClicked` (Task 4).
- Produces: `SessionArticle.originalNumberToDelete?: number` — konsumiert von Task 8 (`intake-session-list.ts`).

- [ ] **Step 1: Failing Tests schreiben**

In `intake-article-entry.spec.ts`:

Import ergänzen (oberer Import-Block):

```ts
import { IntakeRenumberLookupPopup } from '../intake-renumber-lookup-popup/intake-renumber-lookup-popup';
```

Neue Hilfsfunktion nach `priceInputGroup(...)` ergänzen:

```ts
function renumberPopup(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.query(By.directive(IntakeRenumberLookupPopup)).componentInstance as IntakeRenumberLookupPopup;
}
```

Neue `describe`-Sektion am Ende der Datei (vor dem letzten schließenden `});`):

```ts
  describe('Umnummerierung über das Renumber-Popup', () => {
    it('prefills all Stammfelder, the number field, and sets the badge when the popup reports a found article', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      renumberPopup(fixture).articleFound.emit(
        articleByNumberStub({ number: 1, name: 'Sommerkleid', brand: 'Vertbaudet', category: 'Kleider', price: 8 }),
      );
      await fixture.whenStable();

      expect(component.name()).toBe('Sommerkleid');
      expect(component.brand()).toBe('Vertbaudet');
      expect(component.category()).toBe('Kleider');
      expect(component.price()).toBe(8);
      expect(numberInputGroup(fixture).rawValue()).toBe('1');
      expect(component.originalNumber()).toBe(1);
      expect(component.extraModeButtonConfig().badge).toBe('1');
    });

    it('opening the popup is triggered by the number field\'s extraModeClicked', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      expect(component.renumberPopupVisible()).toBe(false);

      numberInputGroup(fixture).extraModeClicked.emit();

      expect(component.renumberPopupVisible()).toBe(true);
    });

    it('clearing the Artikelnummer field while a renumber badge is active resets every field and the badge', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      renumberPopup(fixture).articleFound.emit(articleByNumberStub({ number: 1, name: 'Sommerkleid' }));
      await fixture.whenStable();

      numberInputGroup(fixture).valueChange.emit('');
      await fixture.whenStable();

      expect(component.name()).toBe('');
      expect(component.category()).toBe('');
      expect(component.brand()).toBe('');
      expect(component.price()).toBe(0);
      expect(component.originalNumber()).toBeNull();
      expect(component.extraModeButtonConfig().badge).toBeNull();
    });

    it('clearing the Artikelnummer field WITHOUT an active renumber badge does not wipe hand-typed fields', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onNameChange('Handgetippt');
      component.onPriceChange(19.9);

      numberInputGroup(fixture).valueChange.emit('');
      await fixture.whenStable();

      expect(component.name()).toBe('Handgetippt');
      expect(component.price()).toBe(19.9);
    });

    it('"Übernehmen" carries originalNumberToDelete into the session item and resets the badge', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      renumberPopup(fixture).articleFound.emit(articleByNumberStub({ number: 1, name: 'Sommerkleid', price: 8 }));
      await fixture.whenStable();
      numberInputGroup(fixture).valueChange.emit('6');
      component.category.set('Kleider');
      component.brand.set('Vertbaudet');
      await fixture.whenStable();

      component.onSubmitEntry();
      await fixture.whenStable();

      expect(component.items()).toEqual([
        expect.objectContaining({ number: 6, name: 'Sommerkleid', originalNumberToDelete: 1 }),
      ]);
      expect(component.originalNumber()).toBeNull();
      expect(component.extraModeButtonConfig().badge).toBeNull();
    });

    it('"Übernehmen" without ever using the popup does not add originalNumberToDelete', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.price.set(12.5);

      component.onSubmitEntry();
      await fixture.whenStable();

      expect(component.items()[0].originalNumberToDelete).toBeUndefined();
    });
  });
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: FAIL — `IntakeRenumberLookupPopup` ist nicht Teil der Testfixture, `originalNumber`/`extraModeButtonConfig`/`renumberPopupVisible` existieren nicht.

- [ ] **Step 3: `SessionArticle` um `originalNumberToDelete` erweitern**

In `intake-article-entry.ts`, das `SessionArticle`-Interface:

```ts
export interface SessionArticle {
  localId: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  conflict?: boolean;
  /** Gesetzt, wenn dieser Eintrag über das Renumber-Popup geladen und die Artikelnummer
   * anschließend geändert wurde — die Ursprungsnummer, deren Alt-Artikel beim finalen Buchen
   * gelöscht werden soll (`IntakeArticleLine.deleteArticleNumber`, siehe `intake-session-list`). */
  originalNumberToDelete?: number;
}
```

- [ ] **Step 4: Komponente um Popup-State, Badge und Reset-Logik erweitern**

Import ergänzen:

```ts
import { IntakeRenumberLookupPopup } from '../intake-renumber-lookup-popup/intake-renumber-lookup-popup';
```

Im `@Component({ imports: [...] })`-Array `IntakeRenumberLookupPopup` ergänzen.

Nach `readonly numberTakenMessage = signal<string | null>(null);` ergänzen:

```ts
  /** Gesetzt, sobald ein Artikel über das Renumber-Popup geladen wurde — die Ursprungsnummer,
   * die als Badge am dritten Mode-Button angezeigt wird und beim finalen Buchen als
   * `deleteArticleNumber` mitgeschickt wird, falls die Nummer danach geändert wird. */
  readonly originalNumber = signal<number | null>(null);
  readonly renumberPopupVisible = signal(false);

  readonly extraModeButtonConfig = computed(() => ({
    icon: 'pi pi-sync',
    badge: this.originalNumber() !== null ? String(this.originalNumber()) : null,
  }));
```

Neues privates Feld direkt unter `private prefillActive` — Moment, dieses Feld wurde in Task 6 entfernt; ergänze stattdessen direkt unter `private numberFieldSeq = 0;`:

```ts
  /** Steuert, ob der nächste `pendingNumberValue`-Apply-Effekt (siehe Konstruktor) zusätzlich
   * Fokus + Volltext-Selektion ins Nummernfeld setzt — nur nach einem Renumber-Popup-Treffer,
   * damit der Anwender die geladene Nummer sofort überschreiben kann, ohne erst zu markieren. */
  private focusNumberFieldAfterApply = false;
```

Den bestehenden `pendingNumberValue`-Apply-Effekt im Konstruktor

```ts
    effect(() => {
      const inputGroup = this.numberInputGroup();
      const pending = this.pendingNumberValue();
      if (!inputGroup || pending === null) return;
      inputGroup.applyExternalValue(pending);
      this.pendingNumberValue.set(null);
    });
```

ersetzen durch:

```ts
    effect(() => {
      const inputGroup = this.numberInputGroup();
      const pending = this.pendingNumberValue();
      if (!inputGroup || pending === null) return;
      inputGroup.applyExternalValue(pending);
      this.pendingNumberValue.set(null);
      if (this.focusNumberFieldAfterApply) {
        this.focusNumberFieldAfterApply = false;
        inputGroup.focusAndSelect();
      }
    });
```

Neue öffentliche Methoden ergänzen (z. B. direkt nach `onArticleNumberSubmit()`):

```ts
  onOpenRenumberPopup(): void {
    this.renumberPopupVisible.set(true);
  }

  onRenumberPopupVisibleChange(visible: boolean): void {
    this.renumberPopupVisible.set(visible);
  }

  /** `app-intake-renumber-lookup-popup`'s `articleFound` — befüllt alle Formularfelder inkl.
   * der Artikelnummer selbst, setzt die Badge-Markierung (`originalNumber`) und rückt Fokus +
   * Volltext-Selektion ins Nummernfeld, sobald der Wert dort angewendet wurde (siehe
   * `focusNumberFieldAfterApply`-Effekt im Konstruktor) — direktes Überschreiben durch
   * Tippen/Scannen ist damit ohne manuelles Markieren möglich. */
  onArticleFoundViaRenumberPopup(article: ArticleByNumberResult): void {
    this.originalNumber.set(article.number);
    this.name.set(article.name);
    this.category.set(article.category);
    this.brand.set(article.brand);
    this.size.set(article.size ?? '');
    this.color.set(article.color ?? '');
    this.description.set(article.description ?? '');
    this.price.set(article.price);
    this.priceInputGroup()?.applyExternalValue(String(article.price));
    this.numberTakenMessage.set(null);
    this.focusNumberFieldAfterApply = true;
    this.pendingNumberValue.set(String(article.number));
  }
```

`onArticleNumberChange()` erweitern, sodass ein Leeren des Feldes bei aktiver Umnummerierungs-Markierung alles zurücksetzt:

```ts
  onArticleNumberChange(value: string | number): void {
    const raw = String(value);
    this.articleNumber.set(raw);
    if (raw.trim().length === 0 && this.originalNumber() !== null) {
      this.resetForm();
      return;
    }
    this.checkArticleNumber(raw);
  }
```

`onSubmitEntry()` erweitern, sodass `originalNumberToDelete` mitgegeben wird:

```ts
  onSubmitEntry(): void {
    if (!this.canSave()) return;

    const number = Number.parseInt(this.articleNumber().trim(), 10);
    const originalNumberToDelete = this.originalNumber();
    this.items.update((items) => [
      ...items,
      {
        localId: crypto.randomUUID(),
        number,
        name: this.name().trim(),
        brand: this.brand(),
        category: this.category(),
        price: this.price(),
        size: this.size().trim() || null,
        color: this.color().trim() || null,
        description: this.description().trim() || null,
        ...(originalNumberToDelete !== null ? { originalNumberToDelete } : {}),
      },
    ]);

    this.resetForm();
  }
```

`resetForm()` um `originalNumber` ergänzen:

```ts
  private resetForm(): void {
    this.articleNumber.set('');
    this.name.set('');
    this.category.set('');
    this.brand.set('');
    this.price.set(0);
    this.size.set('');
    this.color.set('');
    this.description.set('');
    this.numberTakenMessage.set(null);
    this.pendingPriceValue.set('');
    this.originalNumber.set(null);
    this.numberFieldSeq++;
    this.prefillNextNumber();
  }
```

- [ ] **Step 5: Template um Button-Bindung und Popup ergänzen**

In `intake-article-entry.html`, das bestehende `app-input-group` für die Artikelnummer:

```html
        <app-input-group
          #numberGroup
          inputId="intake-article-entry-number"
          variant="search"
          [modes]="['keyboard', 'camera', 'numpad']"
          [showLeftAddon]="false"
          [addonActionButtons]="true"
          (valueChange)="onArticleNumberChange($event)"
          (submitted)="onArticleNumberSubmit()"
        />
```

ersetzen durch:

```html
        <app-input-group
          #numberGroup
          inputId="intake-article-entry-number"
          variant="search"
          [modes]="['keyboard', 'camera', 'numpad']"
          [showLeftAddon]="false"
          [addonActionButtons]="true"
          [extraModeButton]="extraModeButtonConfig()"
          (valueChange)="onArticleNumberChange($event)"
          (submitted)="onArticleNumberSubmit()"
          (extraModeClicked)="onOpenRenumberPopup()"
        />
```

Am Ende der Datei, direkt vor dem schließenden `</div>` des Wurzel-Elements `<div class="intake-article-entry">`, ergänzen:

```html
  <app-intake-renumber-lookup-popup
    [visible]="renumberPopupVisible()"
    [sellerId]="sellerId()"
    (visibleChange)="onRenumberPopupVisibleChange($event)"
    (articleFound)="onArticleFoundViaRenumberPopup($event)"
  />
```

- [ ] **Step 6: Tests laufen lassen, Erfolg bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS (alle Tests).

- [ ] **Step 7: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry
git commit -m "feat(bazaar-app): wire renumber lookup popup, badge, and full-reset into intake article entry"
```

---

### Task 8: Frontend — `intake-session-list` reicht `deleteArticleNumber` durch

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.ts`
- Test: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts`

**Interfaces:**
- Consumes: `SessionArticle.originalNumberToDelete?: number` (Task 7), `IntakeArticleLine.deleteArticleNumber?: number` (Task 3).

- [ ] **Step 1: Bestehenden Test-Setup-Stil lesen**

Read: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts` (Aufbau der bestehenden `onPaymentConfirmed`/`bookIntake`-Tests, um Mock-Muster für `IntakeApi` zu übernehmen).

- [ ] **Step 2: Failing Test schreiben**

In `intake-session-list.spec.ts`, im bestehenden `describe`-Block zu `onPaymentConfirmed`, ergänzen (Variablennamen an das dortige Setup anpassen — `intakeApi`/`fixture`/Hilfsfunktion für ein `SessionArticle`, analog dem bestehenden Muster in dieser Datei):

```ts
it('maps originalNumberToDelete to deleteArticleNumber when booking, and omits it when absent', async () => {
  const { fixture, intakeApi } = await setup({
    items: [
      sessionArticleStub({ number: 6, originalNumberToDelete: 1 }),
      sessionArticleStub({ number: 1099 }),
    ],
  });

  fixture.componentInstance.onPaymentConfirmed({ totalAmount: 3, receivedAmount: 3 });
  await fixture.whenStable();

  const articles = intakeApi.bookIntake.mock.calls[0][2];
  expect(articles[0].deleteArticleNumber).toBe(1);
  expect(articles[1].deleteArticleNumber).toBeUndefined();
});
```

Passe den Aufruf an die tatsächliche Signatur von `onPaymentConfirmed`/`PaymentConfirmedEvent` und an die existierende `setup()`/Stub-Hilfsfunktion dieser Spec-Datei an, falls sie anders heißen oder andere Parameter erwarten, als hier angenommen — orientiere dich 1:1 am bestehenden `onPaymentConfirmed`-Test in derselben Datei.

- [ ] **Step 3: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: FAIL — `deleteArticleNumber` ist in keiner gemappten Zeile gesetzt.

- [ ] **Step 4: Mapping ergänzen**

In `intake-session-list.ts`, `onPaymentConfirmed()`:

```ts
  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    const articles: IntakeArticleLine[] = this.items().map((item) => ({
      number: item.number,
      name: item.name,
      brand: item.brand,
      category: item.category,
      price: item.price,
      size: item.size,
      color: item.color,
      description: item.description,
      deleteArticleNumber: item.originalNumberToDelete,
    }));
```

(Rest der Methode unverändert.)

- [ ] **Step 5: Tests laufen lassen, Erfolg bestätigen**

Run: `npx vitest run src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS (alle Tests).

- [ ] **Step 6: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.ts src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts
git commit -m "feat(bazaar-app): pass deleteArticleNumber through to POST /api/intake"
```

---

### Task 9: Gesamtabnahme — Backend + Frontend Testsuite, manueller Durchstich

**Files:** keine neuen — reine Verifikation.

- [ ] **Step 1: Backend-Gesamttestlauf**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests`
Expected: PASS, keine Regressionen in `IntakeHandlerTests`/`IntakeCommandValidatorTests`/`GetArticleByNumberHandlerTests`.

- [ ] **Step 2: Frontend-Gesamttestlauf**

Run: `npx vitest run` (im Ordner `src/bazaar-app/frontend`)
Expected: PASS, keine Regressionen in `input-group.spec.ts`, `intake-article-entry.spec.ts`, `intake-session-list.spec.ts`, `session-item-popup.spec.ts`, `artikel-dialog.spec.ts` (letztere zwei als bestehende `app-input-group`-Verwender, die unverändert bleiben müssen).

- [ ] **Step 3: Manueller Durchstich im Browser**

Bazaar-App Backend + Frontend starten (siehe `run`-Skill/Projekt-Setup), Artikelannahme für einen importierten Verkäufer mit mindestens einem vorregistrierten, nicht freigegebenen Artikel öffnen:

1. Dritten Button (Badge-los) neben Kamera/Nummernblock sehen — 33/33/33-Aufteilung.
2. Popup öffnen, bekannte Nummer eingeben, "Laden" — Felder inkl. Artikelnummer befüllen sich, Nummernfeld ist fokussiert und der Wert markiert.
3. Direkt eine neue Nummer eintippen/scannen, ohne vorher zu markieren — alte Ziffern werden ersetzt, nicht angehängt.
4. Badge mit der Ursprungsnummer erscheint am dritten Button.
5. X im Nummernfeld klicken — alle Felder UND Badge verschwinden.
6. Vorgang wiederholen, diesmal bis "Übernehmen" durchziehen, Sitzungskorb-Eintrag erscheint.
7. "Speichern" im Sitzungskorb klicken — Buchung erfolgreich, danach in der Artikelverwaltung prüfen: neuer Artikel unter der neuen Nummer vorhanden UND freigegeben, alter Artikel unter der Ursprungsnummer nicht mehr vorhanden (gelöscht, keine Karteileiche).

- [ ] **Step 4: Kein Commit nötig (reine Verifikation) — bei gefundenen Abweichungen: zurück zum jeweiligen Task, fixen, dessen Tests erneut grün, neu committen.**
