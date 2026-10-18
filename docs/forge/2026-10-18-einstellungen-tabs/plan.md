# Einstellungen als Tabs — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-18-einstellungen-tabs/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Einstellungsseite der Haupt-App zeigt ihre Bereiche in vier fachlich geschnittenen PrimeNG-Tabs mit Caption und Icon, merkt sich den aktiven Tab im Query-Parameter `tab` und fragt beim Tab-Wechsel nach, wenn ungespeicherte Änderungen oder eine offene Import-Vorschau verloren gingen.
**Architektur:** Reine Frontend-Änderung im Feature `features/settings`. Die bestehenden Bereichs-Komponenten (`SettingsForm`, `PrintTextsForm`, `ImportPanel`) bekommen je ein Signal `hasUnsavedChanges` und eine Methode `discardChanges()`; `SettingsPage` wird zur Integrations-Komponente, die `p-tabs` an den Query-Parameter bindet und vor dem Wechsel per `ConfirmationService` nachfragt. Tab-Katalog und Auflösung des Query-Werts liegen als reine Funktionen in `settings-tabs.ts`.
**Tech-Stack:** Angular 22 (standalone, Signals, OnPush, zoneless), PrimeNG 22.1 (`p-tabs`, `p-confirmdialog`), PrimeIcons, Vitest über `@angular/build:unit-test`.
**Spec:** docs/forge/2026-10-18-einstellungen-tabs/spec.md
**Basis:** ec5347cb

## Global Constraints
- Spec: Alle Tabs und ihr Inhalt sind nur für die Rolle Admin sichtbar und erreichbar, wie heute — `adminGuard` an der Route `settings` in `src/bazaar-app/frontend/src/app/app.routes.ts` bleibt unverändert.
- Spec: Das Lesen der Scan-Pause am Annahmetisch durch Kassenpersonal bleibt unberührt — `core/settings/settings.service.ts` und `GET /api/settings` werden nicht angefasst.
- Spec: Der Bereich „Datenbank zurücksetzen" erscheint nur, wenn das Backend im Development-Modus läuft; sonst gibt es ihn nirgends in der Oberfläche.
- Spec: Der Import ist in jedem Modus im Tab „Sonstiges" sichtbar.
- Spec: Die Tab-Leiste wird mit der Tabs-Komponente der verwendeten UI-Bibliothek umgesetzt — PrimeNG `p-tabs` / `p-tablist` / `p-tab` / `p-tabpanels` / `p-tabpanel` aus `primeng/tabs`.
- Spec: Tabs in genau dieser Reihenfolge, Caption und Icon wörtlich: „Basis-Einstellungen" `pi-cog`, „User" `pi-users`, „Beleg Druck" `pi-print`, „Sonstiges" `pi-ellipsis-h`.
- Spec: Feldbeschriftungen bleiben wörtlich: „Freitext 1 (Kopfzeile links)", „Freitext 2 (Kopfzeile Mitte)", „Freitext 3 (über der Artikelliste)", „Freitext 4 (Fußzeile links)", „Freitext 5 (Fußzeile Mitte)"; Button „Freitexte speichern" speichert beide Vorlagen.
- Spec: Rückfrage-Buttons heißen „Bleiben" und „Verwerfen".
- Spec: Funktionen, Felder und Endpunkte der Bereiche bleiben unverändert; kein Backend-Code wird geändert.
- Projekt-`CLAUDE.md`: Code, Routen, Query-Werte und JSON-Contract englisch, Doku deutsch.
- Projekt-`CLAUDE.md`: UI nur mit PrimeNG (`docs/components/overview.md`).
- Projekt-`CLAUDE.md`: Dateien immer mit LF schreiben.
- Projekt-`CLAUDE.md`: Commits nach Conventional Commits, Text deutsch, immer mit Pfadangabe in einem Befehl (`git commit -- <pfade>`); neue Dateien werden im selben Befehl vorher per `git add --` aufgenommen. Vorher Branch und `git status` prüfen.
- Projekt-`CLAUDE.md`: Doku-Nachführung (Anforderungs-Doku, Profile, Glossar) im selben Lauf — Task 7.
- dv-angular:toolchain: Testen, Linten, Bauen nur über `dv-angular-test`, `dv-angular-lint`, `dv-angular-build` im Bash-Tool mit `--root <R>/src/bazaar-app/frontend`; nie `ng test`, `npm test` oder dev-mcp `test_angular_project`.
- dv-craft:craft-design-principles: IOSP — Integrationsmethoden (z. B. `SettingsPage.onTabChange`) delegieren nur, Operationsmethoden rechnen nur; Guard Clauses statt Verschachtelung; eine Funktion tut eine Sache.
- dv-craft:craft-design-principles: Komponenten-Hierarchie — `SettingsPage` orchestriert, die Bereichs-Komponenten rendern ihren Bereich.
- dv-craft:craft-design-principles: Erklärende Kommentare als Docstring an die Funktion, nicht mitten in den Code.
- dv-craft:craft-unit-testing: AAA mit `// Arrange` / `// Act` / `// Assert`; Act genau eine Zeile; Verhalten über die öffentliche API testen.
- dv-angular:angular-testing-vitest-conventions: Neue `it` heißen `<methode>_<situation>_<erwartung>`; bestehende Testnamen bleiben; Spies mit `vi.fn()` / `vi.spyOn()`; keine zusätzlichen Mock-Bibliotheken; zoneless: Act → `await fixture.whenStable()` → Assert.
- dv-angular:angular: standalone Components, `inject()`, Signals (`signal`, `computed`, `toSignal`), `ChangeDetectionStrategy.OnPush`.
- primeng:primeng-component-implementation: Nur dokumentierte API nutzen — `p-tabs` `[value]`/`(valueChange)`, `p-tab`/`p-tabpanel` `value`, `p-confirmdialog` `key`, `ConfirmationService.confirm({ key, header, message, acceptLabel, rejectLabel, accept })`; Icons als PrimeIcons-Klassen (`pi pi-…`) wie im übrigen Projekt.
- dv-dotnet:dotnet: nicht betroffen (keine Datei unter `src/*/backend`).

---

### Task 1: Tab-Katalog der Einstellungsseite

**ACs:** AC-01, AC-02, AC-15

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts`
- Create: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.spec.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `type SettingsTab = 'general' | 'users' | 'print' | 'misc'`
  - `interface SettingsTabDefinition { readonly value: SettingsTab; readonly label: string; readonly icon: string }`
  - `const DEFAULT_SETTINGS_TAB: SettingsTab` (= `'general'`)
  - `const SETTINGS_TABS: readonly SettingsTabDefinition[]`
  - `function resolveSettingsTab(value: string | null): SettingsTab`
  - `interface DiscardableChanges { readonly hasUnsavedChanges: Signal<boolean>; discardChanges(): void }`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  Datei `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.spec.ts`:
  ```ts
  import { DEFAULT_SETTINGS_TAB, SETTINGS_TABS, resolveSettingsTab } from './settings-tabs';

  describe('settingsTabs', () => {
    it('SETTINGS_TABS_always_listsFourTabsInOrderWithCaptionAndIcon', () => {
      // Arrange & Act
      const tabs = SETTINGS_TABS.map((tab) => ({ value: tab.value, label: tab.label, icon: tab.icon }));

      // Assert
      expect(tabs).toEqual([
        { value: 'general', label: 'Basis-Einstellungen', icon: 'pi pi-cog' },
        { value: 'users', label: 'User', icon: 'pi pi-users' },
        { value: 'print', label: 'Beleg Druck', icon: 'pi pi-print' },
        { value: 'misc', label: 'Sonstiges', icon: 'pi pi-ellipsis-h' },
      ]);
    });

    it('DEFAULT_SETTINGS_TAB_always_isBasisEinstellungen', () => {
      // Arrange & Act
      const defaultTab = SETTINGS_TABS.find((tab) => tab.value === DEFAULT_SETTINGS_TAB);

      // Assert
      expect(defaultTab?.label).toBe('Basis-Einstellungen');
    });

    it('resolveSettingsTab_knownValue_returnsThatTab', () => {
      // Arrange
      const value = 'print';

      // Act
      const tab = resolveSettingsTab(value);

      // Assert
      expect(tab).toBe('print');
    });

    it('resolveSettingsTab_unknownValue_returnsGeneral', () => {
      // Arrange
      const value = 'xyz';

      // Act
      const tab = resolveSettingsTab(value);

      // Assert
      expect(tab).toBe('general');
    });

    it('resolveSettingsTab_missingValue_returnsGeneral', () => {
      // Arrange
      const value = null;

      // Act
      const tab = resolveSettingsTab(value);

      // Assert
      expect(tab).toBe('general');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/pages/settings-page/settings-tabs.spec.ts` — erwartet: FAIL (Modul `./settings-tabs` fehlt)
- [ ] **Schritt 3: Minimal implementieren**
  Datei `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts`:
  ```ts
  import { Signal } from '@angular/core';

  /** Kennung eines Tabs der Einstellungsseite, so wie sie im Query-Parameter `tab` steht. */
  export type SettingsTab = 'general' | 'users' | 'print' | 'misc';

  export interface SettingsTabDefinition {
    readonly value: SettingsTab;
    readonly label: string;
    readonly icon: string;
  }

  export const DEFAULT_SETTINGS_TAB: SettingsTab = 'general';

  /** Reihenfolge = Reihenfolge der Tab-Leiste (docs/forge/2026-10-18-einstellungen-tabs/spec.md). */
  export const SETTINGS_TABS: readonly SettingsTabDefinition[] = [
    { value: 'general', label: 'Basis-Einstellungen', icon: 'pi pi-cog' },
    { value: 'users', label: 'User', icon: 'pi pi-users' },
    { value: 'print', label: 'Beleg Druck', icon: 'pi pi-print' },
    { value: 'misc', label: 'Sonstiges', icon: 'pi pi-ellipsis-h' },
  ];

  /** Fehlender oder unbekannter Query-Wert öffnet „Basis-Einstellungen". */
  export function resolveSettingsTab(value: string | null): SettingsTab {
    const match = SETTINGS_TABS.find((tab) => tab.value === value);
    return match?.value ?? DEFAULT_SETTINGS_TAB;
  }

  /** Bereich eines Tabs, dessen ungespeicherte Eingaben beim Tab-Wechsel verworfen werden können. */
  export interface DiscardableChanges {
    readonly hasUnsavedChanges: Signal<boolean>;
    discardChanges(): void;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/pages/settings-page/settings-tabs.spec.ts` — erwartet: PASS (5 Tests)
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.spec.ts && git commit -m "feat(settings): Tab-Katalog für die Einstellungsseite" -- src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.spec.ts`

---

### Task 2: Scan-Pause erkennt und verwirft ungespeicherte Änderungen

**ACs:** AC-03, AC-04, AC-16, AC-18

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.ts:1-94` · `SettingsForm`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.spec.ts` · `describe('SettingsForm'`

**Interfaces:**
- Consumes: —
- Produces (in `SettingsForm`, erfüllt strukturell `DiscardableChanges` aus Task 1):
  - `readonly hasUnsavedChanges: Signal<boolean>` (per `computed`)
  - `discardChanges(): void`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `settings-form.spec.ts` die Importe am Dateianfang ergänzen:
  ```ts
  import { By } from '@angular/platform-browser';
  import { InputGroup } from '../../../../shared/components/input-group/input-group';
  ```
  und vor der schließenden `});` von `describe('SettingsForm', …)` einfügen:
  ```ts
    it('hasUnsavedChanges_valueChangedButNotSaved_isTrue', () => {
      // Arrange
      const { component } = createForm();

      // Act
      component.onValueChange(5000);

      // Assert
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('hasUnsavedChanges_freshlyLoaded_isFalse', () => {
      // Arrange & Act
      const { component } = createForm();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('onSave_validValueSaved_leavesNoUnsavedChanges', () => {
      // Arrange
      update.mockReturnValue(of(undefined));
      const { component } = createForm();
      component.onValueChange(5000);

      // Act
      component.onSave();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('onSave_400Response_keepsUnsavedChanges', () => {
      // Arrange
      const error = new HttpErrorResponse({
        status: 400,
        error: { errors: { scannerPauseMs: ['Muss zwischen 500 und 15000 liegen.'] } },
      });
      update.mockReturnValue(throwError(() => error));
      const { component } = createForm();
      component.onValueChange(100);

      // Act
      component.onSave();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('discardChanges_unsavedValueWithFieldError_restoresLastSavedValueAndClearsError', () => {
      // Arrange
      const error = new HttpErrorResponse({
        status: 400,
        error: { errors: { scannerPauseMs: ['Muss zwischen 500 und 15000 liegen.'] } },
      });
      update.mockReturnValue(throwError(() => error));
      const { fixture, component } = createForm();
      const inputGroup = fixture.debugElement.query(By.directive(InputGroup)).componentInstance as InputGroup;
      const applyExternalValue = vi.spyOn(inputGroup, 'applyExternalValue');
      component.onValueChange(100);
      component.onSave();

      // Act
      component.discardChanges();

      // Assert
      expect(component.scannerPauseMs()).toBe(3000);
      expect(component.fieldError()).toBeNull();
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(applyExternalValue).toHaveBeenCalledWith('3000');
    });

    it('discardChanges_saveInFlight_keepsInputAndStaysConsistentAfterResponse', () => {
      // Arrange
      const response = new Subject<void>();
      update.mockReturnValue(response);
      const { component } = createForm();
      component.onValueChange(5000);
      component.onSave();
      component.discardChanges();

      // Act
      response.next();

      // Assert
      expect(component.scannerPauseMs()).toBe(5000);
      expect(component.hasUnsavedChanges()).toBe(false);
    });
  ```
  (`Subject` ist in `settings-form.spec.ts` bereits aus `rxjs` importiert.)
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/settings-form/settings-form.spec.ts` — erwartet: FAIL (`hasUnsavedChanges` und `discardChanges` existieren nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `settings-form.ts` vollständig durch diesen Inhalt ersetzen (Doc-Kommentar der Klasse bleibt wörtlich, Absatz zu ungespeicherten Änderungen kommt dazu):
  ```ts
  import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
  import { HttpErrorResponse } from '@angular/common/http';
  import { MessageService } from 'primeng/api';
  import { ButtonModule } from 'primeng/button';
  import { InputGroup } from '../../../../shared/components/input-group/input-group';
  import { SettingsApi } from '../../data/settings-api';

  interface ValidationProblemBody {
    errors?: Record<string, string[]>;
  }

  const MIN_SCANNER_PAUSE_MS = 500;
  const MAX_SCANNER_PAUSE_MS = 15000;

  /**
   * docs/components/settings-form/component.md — single-field admin form for `ScannerPauseMs`
   * (Round-25 Task 6b). Loads via its own `SettingsApi` (not `SettingsService`, Task 5's cached
   * app-wide READ signal — see the doc's Abschnitt 3 for why the two stay separate).
   *
   * Seeding the loaded value (design decision, see task report): `input-group` (Task 6a) exposes
   * no `@Input` to set its current value from a parent — its `rawValue`/`priceValue` signals are
   * internally owned, and the only public write entry point is `applyExternalValue()` (doc-comment:
   * "Öffentlicher Schreibzugriff für eine Verwendungsstelle … setzt den Feldwert und emittiert
   * `valueChange`, wie ein interner Scan-Treffer"). This component therefore calls
   * `applyExternalValue(String(settings.scannerPauseMs))` on the `#scannerPauseInput` view child
   * once the initial `GET /api/settings` response arrives — exactly the pattern the input-group
   * doc documents for Seller-Search's camera-mode consumer (Abschnitt 3). The load is kicked off
   * in `ngAfterViewInit` rather than the constructor specifically so the view child is guaranteed
   * resolved before the subscribe callback can fire, regardless of whether the HTTP response
   * arrives synchronously (tests) or asynchronously (real backend).
   *
   * Ungespeicherte Änderungen (docs/forge/2026-10-18-einstellungen-tabs/spec.md): `hasUnsavedChanges`
   * vergleicht die Eingabe mit dem zuletzt geladenen oder gespeicherten Wert; `discardChanges()`
   * stellt diesen Wert wieder her. Die Einstellungsseite fragt damit vor einem Tab-Wechsel nach.
   */
  @Component({
    selector: 'app-settings-form',
    imports: [ButtonModule, InputGroup],
    templateUrl: './settings-form.html',
    styleUrl: './settings-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SettingsForm implements AfterViewInit {
    private readonly settingsApi = inject(SettingsApi);
    private readonly messageService = inject(MessageService);

    private readonly inputGroupRef = viewChild<InputGroup>('scannerPauseInput');
    /** Zuletzt geladener oder gespeicherter Wert — Bezug für `hasUnsavedChanges` und `discardChanges()`. */
    private readonly savedScannerPauseMs = signal<number>(0);

    readonly scannerPauseMs = signal<number>(0);
    readonly saving = signal(false);
    readonly fieldError = signal<string | null>(null);
    readonly hasUnsavedChanges = computed(() => this.scannerPauseMs() !== this.savedScannerPauseMs());

    readonly helpText = `Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor automatisch weitergescannt werden kann. Gültige Werte: ${SettingsForm.formatMs(MIN_SCANNER_PAUSE_MS)}–${SettingsForm.formatMs(MAX_SCANNER_PAUSE_MS)} ms.`;

    private static formatMs(value: number): string {
      return new Intl.NumberFormat('de-DE').format(value);
    }

    ngAfterViewInit(): void {
      this.settingsApi.get().subscribe((settings) => {
        this.savedScannerPauseMs.set(settings.scannerPauseMs);
        this.showValue(settings.scannerPauseMs);
      });
    }

    onValueChange(value: string | number): void {
      this.scannerPauseMs.set(typeof value === 'number' ? value : Number(value));
    }

    onSave(): void {
      const value = this.scannerPauseMs();
      this.fieldError.set(null);
      this.saving.set(true);

      this.settingsApi.update(value).subscribe({
        next: () => {
          this.saving.set(false);
          this.savedScannerPauseMs.set(value);
          this.messageService.add({ severity: 'success', summary: '✓ Einstellungen gespeichert' });
        },
        error: (error: unknown) => {
          this.saving.set(false);

          if (error instanceof HttpErrorResponse && error.status === 400) {
            this.fieldError.set(this.fieldErrorOf(error));
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Einstellungen konnten nicht gespeichert werden',
          });
        },
      });
    }

    /**
     * Verwirft die ungespeicherte Eingabe und zeigt wieder den zuletzt gespeicherten Wert.
     * Während eines laufenden Speicherns verwirft sie nichts: Die Antwort macht den gesendeten Wert
     * zum Bezug, Anzeige, Bezug und Server bleiben damit gleich.
     */
    discardChanges(): void {
      if (this.saving()) return;
      this.fieldError.set(null);
      this.showValue(this.savedScannerPauseMs());
    }

    private showValue(value: number): void {
      this.scannerPauseMs.set(value);
      this.inputGroupRef()?.applyExternalValue(String(value));
    }

    private fieldErrorOf(error: HttpErrorResponse): string | null {
      const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
      return errors['scannerPauseMs']?.[0] ?? null;
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/settings-form/settings-form.spec.ts` — erwartet: PASS, darunter die bestehenden Absicherungen für AC-03 `clicking Speichern with a valid value calls SettingsApi.update and shows the success toast` und AC-04 `a 400 response shows a field error and does not show the success toast`; rot bei diesen beiden ist ein Befund, kein Grund, ihren Test zu ändern
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(settings): Scan-Pause meldet und verwirft ungespeicherte Änderungen" -- src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.ts src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.spec.ts`

---

### Task 3: Freitexte im Beleg-Raster und mit Verwerfen

**ACs:** AC-06, AC-07, AC-08, AC-09, AC-16, AC-18

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts:1-98` · `PrintTextsForm`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.html:1-26` · `<div class="print-texts-form">`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.scss:1-31` · `.print-texts-form`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts` · `describe('PrintTextsForm'`

**Interfaces:**
- Consumes: —
- Produces (in `PrintTextsForm`, erfüllt strukturell `DiscardableChanges` aus Task 1):
  - `readonly hasUnsavedChanges: Signal<boolean>` (per `computed`)
  - `discardChanges(): void`
  - `readonly fields: readonly { key: PrintTextField; label: string; fullWidth: boolean }[]`
  - CSS-Klassen `print-texts-form__grid`, `print-texts-form__field`, `print-texts-form__field--full`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `print-texts-form.spec.ts` die Zeile `import { of, throwError } from 'rxjs';` ersetzen durch `import { Subject, of, throwError } from 'rxjs';` und vor der schließenden `});` von `describe('PrintTextsForm', …)` einfügen:
  ```ts
    it('template_adminOpensPrintTab_showsAbgabeBelegAboveVerkaeuferUebersicht', async () => {
      // Arrange & Act
      const { el } = await createForm();

      // Assert
      const legends = Array.from(el.querySelectorAll('fieldset > legend')).map((legend) => legend.textContent?.trim());
      expect(legends).toEqual(['Abgabe-Beleg', 'Verkäufer-Übersicht']);
    });

    it('template_eachTemplate_placesFreitext3FullWidthBetweenTwoHalfWidthPairs', async () => {
      // Arrange & Act
      const { el } = await createForm();

      // Assert
      const layouts = Array.from(el.querySelectorAll('fieldset')).map((fieldset) =>
        Array.from(fieldset.querySelectorAll('.print-texts-form__grid > .print-texts-form__field')).map((field) =>
          field.classList.contains('print-texts-form__field--full') ? 'full' : 'half',
        ),
      );
      expect(layouts).toEqual([
        ['half', 'half', 'full', 'half', 'half'],
        ['half', 'half', 'full', 'half', 'half'],
      ]);
    });

    it('template_eachTemplate_keepsTheFieldLabelsInReceiptOrder', async () => {
      // Arrange & Act
      const { el } = await createForm();

      // Assert
      const labelsPerSection = Array.from(el.querySelectorAll('fieldset')).map((fieldset) =>
        Array.from(fieldset.querySelectorAll('.print-texts-form__grid label')).map((label) => label.textContent?.trim()),
      );
      const expectedLabels = [
        'Freitext 1 (Kopfzeile links)',
        'Freitext 2 (Kopfzeile Mitte)',
        'Freitext 3 (über der Artikelliste)',
        'Freitext 4 (Fußzeile links)',
        'Freitext 5 (Fußzeile Mitte)',
      ];
      expect(labelsPerSection).toEqual([expectedLabels, expectedLabels]);
    });

    it('template_textsLoaded_showsExactlyOneSaveButtonForBothTemplates', async () => {
      // Arrange & Act
      const { el } = await createForm();

      // Assert
      const saveButtons = Array.from(el.querySelectorAll('button')).filter(
        (button) => button.textContent?.trim() === 'Freitexte speichern',
      );
      expect(saveButtons.length).toBe(1);
    });

    it('hasUnsavedChanges_textEditedButNotSaved_isTrue', async () => {
      // Arrange
      const { component } = await createForm();

      // Act
      component.onChange('verkaeuferUebersicht', 'text2', 'Neu');

      // Assert
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('hasUnsavedChanges_freshlyLoaded_isFalse', async () => {
      // Arrange & Act
      const { component } = await createForm();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('onSave_editedTextsSaved_leavesNoUnsavedChanges', async () => {
      // Arrange
      update.mockReturnValue(of(undefined));
      const { component } = await createForm();
      component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

      // Act
      component.onSave();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('discardChanges_editedTexts_showsLastSavedTextsAgain', async () => {
      // Arrange
      const { fixture, component, el } = await createForm();
      component.onChange('abgabeBeleg', 'text1', 'Verworfen');

      // Act
      component.discardChanges();

      // Assert
      await fixture.whenStable();
      expect(component.valueOf('abgabeBeleg', 'text1')).toBe('Kopf links');
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(el.querySelector<HTMLTextAreaElement>('#abgabeBeleg-text1')?.value).toBe('Kopf links');
    });

    it('discardChanges_saveInFlight_keepsInputAndStaysConsistentAfterResponse', async () => {
      // Arrange
      const response = new Subject<void>();
      update.mockReturnValue(response);
      const { component } = await createForm();
      component.onChange('abgabeBeleg', 'text3', '**Hinweis**');
      component.onSave();
      component.discardChanges();

      // Act
      response.next();

      // Assert
      expect(component.valueOf('abgabeBeleg', 'text3')).toBe('**Hinweis**');
      expect(component.hasUnsavedChanges()).toBe(false);
    });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts` — erwartet: FAIL (`hasUnsavedChanges`/`discardChanges` fehlen, keine `.print-texts-form__grid`)
- [ ] **Schritt 3: Minimal implementieren**
  `print-texts-form.ts` vollständig ersetzen:
  ```ts
  import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { MessageService } from 'primeng/api';
  import { ButtonModule } from 'primeng/button';
  import { TextareaModule } from 'primeng/textarea';
  import {
    PRINT_TEXT_MAX_LENGTH,
    PrintTextField,
    PrintTextSection,
    PrintTexts,
    PrintTextsApi,
    emptyPrintTexts,
  } from '../../data/print-texts-api';

  /**
   * Admin-Formular für die zehn Freitexte der Belege (Abgabe-Beleg und Verkäufer-Übersicht, je
   * Freitext 1 bis 5). Ein gemeinsamer Speichern-Button für beide Vorlagen, eigener Endpoint —
   * unabhängig vom `settings-form` (Scan-Pause). Die Route `/settings` trägt bereits `adminGuard`,
   * deshalb prüft diese Komponente die Rolle nicht erneut.
   *
   * Die Felder stehen wie auf dem Beleg: Freitext 1 und 2 nebeneinander, Freitext 3 über die
   * ganze Breite, Freitext 4 und 5 nebeneinander (docs/forge/2026-10-18-einstellungen-tabs/spec.md).
   * `hasUnsavedChanges`/`discardChanges()` dienen der Rückfrage beim Tab-Wechsel.
   */
  @Component({
    selector: 'app-print-texts-form',
    imports: [FormsModule, ButtonModule, TextareaModule],
    templateUrl: './print-texts-form.html',
    styleUrl: './print-texts-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class PrintTextsForm {
    private readonly printTextsApi = inject(PrintTextsApi);
    private readonly messageService = inject(MessageService);

    /** Zuletzt geladener oder gespeicherter Stand — Bezug für `hasUnsavedChanges` und `discardChanges()`. */
    private readonly savedTexts = signal<PrintTexts>(emptyPrintTexts());

    readonly maxLength = PRINT_TEXT_MAX_LENGTH;
    readonly sections: readonly { key: PrintTextSection; title: string }[] = [
      { key: 'abgabeBeleg', title: 'Abgabe-Beleg' },
      { key: 'verkaeuferUebersicht', title: 'Verkäufer-Übersicht' },
    ];
    readonly fields: readonly { key: PrintTextField; label: string; fullWidth: boolean }[] = [
      { key: 'text1', label: 'Freitext 1 (Kopfzeile links)', fullWidth: false },
      { key: 'text2', label: 'Freitext 2 (Kopfzeile Mitte)', fullWidth: false },
      { key: 'text3', label: 'Freitext 3 (über der Artikelliste)', fullWidth: true },
      { key: 'text4', label: 'Freitext 4 (Fußzeile links)', fullWidth: false },
      { key: 'text5', label: 'Freitext 5 (Fußzeile Mitte)', fullWidth: false },
    ];
    readonly helpText =
      'Markdown: Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen. Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.';
    readonly spaceHint =
      'Der Platz auf dem Beleg ist begrenzt: Freitext 1, 2, 4 und 5 fassen nur wenige Zeilen in Kopf- bzw. Fußzeile, Freitext 3 höchstens 15 cm über der Artikelliste. Längerer Text wird beim Druck abgeschnitten.';

    readonly texts = signal<PrintTexts>(emptyPrintTexts());
    readonly saving = signal(false);
    /** Erst nach erfolgreichem Laden darf gespeichert werden, sonst überschreiben leere Felder die Sätze. */
    readonly loaded = signal(false);
    readonly hasUnsavedChanges = computed(() => this.differsFromSaved(this.texts()));

    constructor() {
      this.printTextsApi.get().subscribe({
        next: (texts) => {
          this.texts.set(texts);
          this.savedTexts.set(texts);
          this.loaded.set(true);
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Freitexte konnten nicht geladen werden',
          }),
      });
    }

    valueOf(section: PrintTextSection, field: PrintTextField): string {
      return this.texts()[section][field];
    }

    onChange(section: PrintTextSection, field: PrintTextField, value: string): void {
      this.texts.update((current) => ({
        ...current,
        [section]: { ...current[section], [field]: value },
      }));
    }

    onSave(): void {
      if (!this.loaded()) {
        return;
      }
      const texts = this.texts();
      this.saving.set(true);
      this.printTextsApi.update(texts).subscribe({
        next: () => {
          this.saving.set(false);
          this.savedTexts.set(texts);
          this.messageService.add({ severity: 'success', summary: '✓ Freitexte gespeichert' });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Freitexte konnten nicht gespeichert werden',
          });
        },
      });
    }

    /**
     * Verwirft ungespeicherte Eingaben und zeigt wieder den zuletzt gespeicherten Stand.
     * Während eines laufenden Speicherns verwirft sie nichts: Die Antwort macht den gesendeten Stand
     * zum Bezug, Anzeige, Bezug und Server bleiben damit gleich.
     */
    discardChanges(): void {
      if (this.saving()) return;
      this.texts.set(this.savedTexts());
    }

    private differsFromSaved(texts: PrintTexts): boolean {
      const saved = this.savedTexts();
      return this.sections.some((section) =>
        this.fields.some((field) => texts[section.key][field.key] !== saved[section.key][field.key]),
      );
    }
  }
  ```
  `print-texts-form.html` vollständig ersetzen:
  ```html
  <div class="print-texts-form">
    <h3 class="print-texts-form__title">Freitexte der Belege</h3>
    <p class="print-texts-form__help">{{ helpText }}</p>

    @for (section of sections; track section.key) {
      <fieldset class="print-texts-form__section">
        <legend>{{ section.title }}</legend>
        <div class="print-texts-form__grid">
          @for (field of fields; track field.key) {
            <div class="print-texts-form__field" [class.print-texts-form__field--full]="field.fullWidth">
              <label [for]="section.key + '-' + field.key">{{ field.label }}</label>
              <textarea
                pTextarea
                rows="3"
                [id]="section.key + '-' + field.key"
                [attr.maxlength]="maxLength"
                [ngModel]="valueOf(section.key, field.key)"
                (ngModelChange)="onChange(section.key, field.key, $event)"
              ></textarea>
            </div>
          }
        </div>
        <p class="print-texts-form__hint">{{ spaceHint }}</p>
      </fieldset>
    }

    <p-button label="Freitexte speichern" [disabled]="saving() || !loaded()" (onClick)="onSave()" />
  </div>
  ```
  `print-texts-form.scss` vollständig ersetzen:
  ```scss
  .print-texts-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    // Zwei Spalten wie auf dem Beleg brauchen mehr Breite als das frühere 640px-Formular.
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;

    &__title {
      margin: 0;
    }

    &__help,
    &__hint {
      margin: 0;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
    }

    &__section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    // Anordnung des Belegs: Freitext 1|2, Freitext 3 über die ganze Breite, Freitext 4|5.
    &__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &--full {
        grid-column: 1 / -1;
      }
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts` — erwartet: PASS, darunter die bestehende Absicherung für AC-09 `onSave_validTexts_sendsAllTenTextsAndShowsSuccessToast`; rot bei diesem Test ist ein Befund, kein Grund, ihn zu ändern
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(settings): Freitexte im Beleg-Raster, ungespeicherte Änderungen verwerfbar" -- src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.html src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.scss src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts`

---

### Task 4: Import-Vorschau als ungespeicherte Änderung

**ACs:** AC-20

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.ts:75-77` · `ImportPanel.showPreview`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.ts:138-172` · `ImportPanel.onConfirm`
- Create: `src/bazaar-app/frontend/src/app/features/settings/testing/import-preview.stub.ts`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.spec.ts` · `describe('ImportPanel'`

**Interfaces:**
- Consumes: —
- Produces (in `ImportPanel`, erfüllt strukturell `DiscardableChanges` aus Task 1):
  - `readonly hasUnsavedChanges: Signal<boolean>` (per `computed`, `true` genau im Zustand `'preview'`)
  - `discardChanges(): void`
- Produces (Test-Helfer in `features/settings/testing/import-preview.stub.ts`):
  - `function previewResultStub(overrides?: Partial<ImportPreviewResult>): ImportPreviewResult`
  - `function selectEventFor(file: File): Parameters<ImportPanel['onFileSelect']>[0]`
  - `function jsonFile(name?: string): File`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  Die bisher datei-lokalen Helfer aus `import-panel.spec.ts` in eine gemeinsame Datei ziehen, damit die Seiten-Spec (Task 6) sie mitnutzt. Datei `src/bazaar-app/frontend/src/app/features/settings/testing/import-preview.stub.ts` anlegen:
  ```ts
  import { ImportPanel } from '../components/import-panel/import-panel';
  import { ImportPreviewResult } from '../data/import-api';

  /** Vorschau-Ergebnis für Specs des Imports; `overrides` ersetzt einzelne Felder. */
  export function previewResultStub(overrides: Partial<ImportPreviewResult> = {}): ImportPreviewResult {
    return {
      sellerCount: 84,
      articleCount: 612,
      newSellers: 71,
      replacedSellers: 11,
      skippedSellers: [],
      unknownSellerTypes: [],
      newBrands: 23,
      newCategories: 5,
      ...overrides,
    };
  }

  /** A `new File(...)` stand-in for the file the (mocked) `p-fileupload`'s `onSelect` would emit —
   * `p-fileupload`'s real native file picker can't be driven in a jsdom unit test, so specs drive
   * `onFileSelect()` directly with a `FileSelectEvent`-shaped object rather than simulating a native
   * `<input type="file">` change event. */
  export function selectEventFor(file: File): Parameters<ImportPanel['onFileSelect']>[0] {
    return { files: [file] } as unknown as Parameters<ImportPanel['onFileSelect']>[0];
  }

  /** Leere JSON-Datei als Import-Quelle für Specs. */
  export function jsonFile(name = 'export-2026-08-17.json'): File {
    return new File(['{}'], name, { type: 'application/json' });
  }
  ```
  In `import-panel.spec.ts`:
  - Die Zeile `import { ImportApi, ImportPreviewResult } from '../../data/import-api';` ersetzen durch die zwei Zeilen
    ```ts
    import { ImportApi } from '../../data/import-api';
    import { jsonFile, previewResultStub, selectEventFor } from '../../testing/import-preview.stub';
    ```
  - Die drei datei-lokalen Funktionen `function previewResultStub(overrides: Partial<ImportPreviewResult> = {}): ImportPreviewResult { … }`, `function selectEventFor(file: File) { … }` samt ihrem Doc-Kommentar `/** A \`new File(...)\` stand-in …` und `function jsonFile(name = 'export-2026-08-17.json'): File { … }` (zwischen `const SELLER_TYPES = [ … ];` und `describe('ImportPanel', () => {`) löschen; `const SELLER_TYPES` bleibt.

  Danach vor der schließenden `});` von `describe('ImportPanel', …)` einfügen:
  ```ts
    it('hasUnsavedChanges_previewOpen_isTrue', () => {
      // Arrange
      preview.mockReturnValue(of(previewResultStub()));
      const { component } = createPanel();

      // Act
      component.onFileSelect(selectEventFor(jsonFile()));

      // Assert
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('hasUnsavedChanges_noFileSelected_isFalse', () => {
      // Arrange & Act
      const { component } = createPanel();

      // Assert
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('discardChanges_previewOpen_closesThePreview', () => {
      // Arrange
      preview.mockReturnValue(of(previewResultStub()));
      const { component } = createPanel();
      component.onFileSelect(selectEventFor(jsonFile()));

      // Act
      component.discardChanges();

      // Assert
      expect(component.state()).toBe('empty');
      expect(component.selectedFile()).toBeNull();
      expect(component.previewResult()).toBeNull();
      expect(component.showPreview()).toBe(false);
      expect(component.hasUnsavedChanges()).toBe(false);
    });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/import-panel/import-panel.spec.ts` — erwartet: FAIL (`hasUnsavedChanges`/`discardChanges` fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  In `import-panel.ts` direkt nach dem Block `readonly showPreview = computed(…);` einfügen:
  ```ts

    /** Eine offene Vorschau gilt beim Tab-Wechsel als ungespeicherte Änderung
     * (docs/forge/2026-10-18-einstellungen-tabs/spec.md AC-20); ein laufender Import nicht. */
    readonly hasUnsavedChanges = computed(() => this.state() === 'preview');
  ```
  und direkt nach der Methode `onConfirm(): void { … }` (vor `private clearPendingReset()`) einfügen:
  ```ts

    /** Schließt die offene Vorschau, wenn der Admin beim Tab-Wechsel „Verwerfen" wählt. */
    discardChanges(): void {
      this.resetToEmpty();
    }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/import-panel/import-panel.spec.ts` — erwartet: PASS, darunter alle bestehenden Tests, die jetzt die gemeinsamen Helfer nutzen; rot bei einem bestehenden Test ist ein Befund, kein Grund, ihn zu ändern
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/settings/testing/import-preview.stub.ts && git commit -m "feat(settings): offene Import-Vorschau als ungespeicherte Änderung melden" -- src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.ts src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.spec.ts src/bazaar-app/frontend/src/app/features/settings/testing/import-preview.stub.ts`

---

### Task 5: Bereich „Datenbank zurücksetzen" umbenennen

**ACs:** AC-11, AC-12, AC-13

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/dev-tools-panel/dev-tools-panel.html:3` · `<h3 class="dev-tools-panel__title">`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/dev-tools-panel/dev-tools-panel.spec.ts` · `describe('DevToolsPanel'`

**Interfaces:**
- Consumes: —
- Produces: Überschrift `.dev-tools-panel__title` mit Text „Datenbank zurücksetzen"

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `dev-tools-panel.spec.ts` vor der schließenden `});` von `describe('DevToolsPanel', …)` einfügen:
  ```ts
    it('template_development_showsHeadingDatenbankZuruecksetzen', () => {
      // Arrange
      const fixture = TestBed.createComponent(DevToolsPanel);

      // Act
      fixture.detectChanges();

      // Assert
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.dev-tools-panel__title')?.textContent?.trim()).toBe('Datenbank zurücksetzen');
      expect(el.textContent).not.toContain('Entwickler-Werkzeuge');
    });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/dev-tools-panel/dev-tools-panel.spec.ts` — erwartet: FAIL `template_development_showsHeadingDatenbankZuruecksetzen`
- [ ] **Schritt 3: Minimal implementieren**
  In `dev-tools-panel.html` die Zeile
  ```html
      <h3 class="dev-tools-panel__title">Entwickler-Werkzeuge</h3>
  ```
  ersetzen durch
  ```html
      <h3 class="dev-tools-panel__title">Datenbank zurücksetzen</h3>
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/dev-tools-panel/dev-tools-panel.spec.ts` — erwartet: PASS, darunter die bestehende Absicherung für AC-13 `shows the reset button disabled until RESET is typed` und für AC-10 `hides itself when not running in Development`; rot bei diesen ist ein Befund, kein Grund, ihren Test zu ändern
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(settings): Entwickler-Werkzeuge heißen Datenbank zurücksetzen" -- src/bazaar-app/frontend/src/app/features/settings/components/dev-tools-panel/dev-tools-panel.html src/bazaar-app/frontend/src/app/features/settings/components/dev-tools-panel/dev-tools-panel.spec.ts`

---

### Task 6: Einstellungsseite mit Tab-Leiste, Adresse und Rückfrage

**ACs:** AC-01, AC-02, AC-03, AC-05, AC-06, AC-10, AC-11, AC-12, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.ts:1-26` · `SettingsPage`
- Create: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.html`
- Create: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.scss`
- Test: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.spec.ts` · `describe('SettingsPage'`
- Test: `src/bazaar-app/frontend/src/app/app.routes.spec.ts` · `settingsRoute_always_isGuardedByAdminGuard`
- Test: `src/bazaar-app/frontend/src/app/core/auth/admin.guard.spec.ts` · `redirects to /intake for non-admin role`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/user-management/user-management.spec.ts` · `describe('UserManagement'`

**Interfaces:**
- Consumes:
  - aus Task 1 (`./settings-tabs`): `SettingsTab`, `SETTINGS_TABS`, `resolveSettingsTab(value: string | null): SettingsTab`, `DiscardableChanges`
  - aus Task 2: `SettingsForm.hasUnsavedChanges: Signal<boolean>`, `SettingsForm.discardChanges(): void`, `SettingsForm.onValueChange(value: string | number): void`, `SettingsForm.scannerPauseMs: WritableSignal<number>`
  - aus Task 3: `PrintTextsForm.hasUnsavedChanges: Signal<boolean>`, `PrintTextsForm.discardChanges(): void`, `PrintTextsForm.onChange(section: PrintTextSection, field: PrintTextField, value: string): void`
  - aus Task 4: `ImportPanel.hasUnsavedChanges: Signal<boolean>`, `ImportPanel.discardChanges(): void`, `ImportPanel.onFileSelect(event: FileSelectEvent): void`, `ImportPanel.state: WritableSignal<'empty' | 'preview' | 'running' | 'done'>`; Test-Helfer `previewResultStub`, `selectEventFor`, `jsonFile` aus `features/settings/testing/import-preview.stub.ts`
  - aus Task 5: `.dev-tools-panel__title` mit „Datenbank zurücksetzen"
- Produces:
  - `SettingsPage.activeTab: Signal<SettingsTab>`
  - `SettingsPage.onTabChange(value: string | number | undefined): void`
  - Query-Parameter `tab` mit `general` | `users` | `print` | `misc`; Confirm-Key `leaveSettingsTab`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `settings-page.spec.ts` vollständig ersetzen (die bisherigen fünf „hosts …"-Tests gehen in den neuen Tests über die Tab-Panels auf):
  ```ts
  import { Type } from '@angular/core';
  import { TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { Router, provideRouter } from '@angular/router';
  import { RouterTestingHarness } from '@angular/router/testing';
  import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
  import { of } from 'rxjs';
  import { SettingsPage } from './settings-page';
  import { SettingsForm } from '../../components/settings-form/settings-form';
  import { PrintTextsForm } from '../../components/print-texts-form/print-texts-form';
  import { ImportPanel } from '../../components/import-panel/import-panel';
  import { SettingsApi } from '../../data/settings-api';
  import { PrintTextsApi, emptyPrintTexts } from '../../data/print-texts-api';
  import { ImportApi } from '../../data/import-api';
  import { UsersApi } from '../../data/users-api';
  import { DevToolsApi } from '../../data/dev-tools-api';
  import { jsonFile, previewResultStub, selectEventFor } from '../../testing/import-preview.stub';
  // Same sanctioned cross-feature import as import-panel.ts itself (see that file's comment).
  // eslint-disable-next-line boundaries/dependencies
  import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';

  const SETTINGS_URL = '/settings';
  const LEAVE_TAB_CONFIRM_KEY = 'leaveSettingsTab';

  describe('SettingsPage', () => {
    let isDevelopment: ReturnType<typeof vi.fn>;
    let confirmCalls: Confirmation[];

    beforeEach(async () => {
      isDevelopment = vi.fn().mockReturnValue(of(false));
      confirmCalls = [];

      await TestBed.configureTestingModule({
        providers: [
          provideRouter([{ path: 'settings', component: SettingsPage }]),
          { provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 })), update: vi.fn() } },
          { provide: PrintTextsApi, useValue: { get: vi.fn().mockReturnValue(of(emptyPrintTexts())), update: vi.fn() } },
          { provide: ImportApi, useValue: { preview: vi.fn().mockReturnValue(of(previewResultStub())), run: vi.fn() } },
          { provide: SellerTypesApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
          { provide: UsersApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
          { provide: DevToolsApi, useValue: { isDevelopment } },
          { provide: MessageService, useValue: { add: vi.fn() } },
          // Real ConfirmationService — `p-confirmdialog` subscribes to it in its own constructor,
          // a bare `useValue` mock would crash on render. `confirm()` is spied below.
          ConfirmationService,
        ],
      }).compileComponents();

      const confirmationService = TestBed.inject(ConfirmationService);
      vi.spyOn(confirmationService, 'confirm').mockImplementation((options: Confirmation) => {
        confirmCalls.push(options);
        return confirmationService;
      });
    });

    async function openSettings(url = SETTINGS_URL) {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url, SettingsPage);
      harness.detectChanges();
      await harness.fixture.whenStable();
      return { harness, el: harness.routeNativeElement as HTMLElement };
    }

    async function settle(harness: RouterTestingHarness): Promise<void> {
      await harness.fixture.whenStable();
      harness.detectChanges();
      await harness.fixture.whenStable();
    }

    function tabElements(el: HTMLElement): HTMLElement[] {
      return Array.from(el.querySelectorAll<HTMLElement>('p-tab'));
    }

    function tabLabels(el: HTMLElement): string[] {
      return tabElements(el).map((tab) => tab.textContent?.trim() ?? '');
    }

    function activeTabLabel(el: HTMLElement): string | undefined {
      return el.querySelector('p-tab[aria-selected="true"]')?.textContent?.trim();
    }

    function tabByLabel(el: HTMLElement, label: string): HTMLElement {
      const tab = tabElements(el).find((candidate) => candidate.textContent?.trim() === label);
      if (!tab) throw new Error(`Tab „${label}" nicht gefunden`);
      return tab;
    }

    function panelTagsOf(el: HTMLElement, selector: string): string[] {
      const panel = el.querySelector(selector)?.closest('p-tabpanel');
      return Array.from(panel?.children ?? []).map((child) => child.tagName.toLowerCase());
    }

    function childOf<T>(harness: RouterTestingHarness, type: Type<T>): T {
      return harness.fixture.debugElement.query(By.directive(type)).componentInstance as T;
    }

    it('template_openedWithoutTab_showsFourTabsInOrderWithBasisEinstellungenActive', async () => {
      // Arrange & Act
      const { el } = await openSettings();

      // Assert
      expect(tabLabels(el)).toEqual(['Basis-Einstellungen', 'User', 'Beleg Druck', 'Sonstiges']);
      expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
    });

    it('template_tabList_showsIconPerTab', async () => {
      // Arrange & Act
      const { el } = await openSettings();

      // Assert
      const icons = tabElements(el).map((tab) => tab.querySelector('i')?.className);
      expect(icons).toEqual(['pi pi-cog', 'pi pi-users', 'pi pi-print', 'pi pi-ellipsis-h']);
    });

    it('template_always_keepsPageTitleEinstellungen', async () => {
      // Arrange & Act
      const { el } = await openSettings();

      // Assert
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Einstellungen');
    });

    it('template_basisEinstellungenTab_containsOnlyTheScanPauseForm', async () => {
      // Arrange & Act
      const { el } = await openSettings();

      // Assert
      expect(panelTagsOf(el, 'app-settings-form')).toEqual(['app-settings-form']);
    });

    it('template_userTab_containsOnlyTheUserManagement', async () => {
      // Arrange & Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=users`);

      // Assert
      expect(activeTabLabel(el)).toBe('User');
      expect(panelTagsOf(el, 'app-user-management')).toEqual(['app-user-management']);
    });

    it('template_belegDruckTab_containsOnlyThePrintTextsForm', async () => {
      // Arrange & Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=print`);

      // Assert
      expect(panelTagsOf(el, 'app-print-texts-form')).toEqual(['app-print-texts-form']);
    });

    it('template_sonstigesOutsideDevelopment_showsImportWithoutDatabaseReset', async () => {
      // Arrange
      isDevelopment.mockReturnValue(of(false));

      // Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

      // Assert
      expect(panelTagsOf(el, 'app-import-panel')).toEqual(['app-import-panel', 'app-dev-tools-panel']);
      expect(el.querySelector('.dev-tools-panel')).toBeNull();
      expect(el.textContent).not.toContain('Datenbank zurücksetzen');
    });

    it('template_sonstigesInDevelopment_showsImportAndDatabaseReset', async () => {
      // Arrange
      isDevelopment.mockReturnValue(of(true));

      // Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

      // Assert
      const importPanel = el.querySelector('app-import-panel');
      const resetTitle = el.querySelector('.dev-tools-panel__title');
      expect(importPanel).not.toBeNull();
      expect(resetTitle?.textContent?.trim()).toBe('Datenbank zurücksetzen');
      expect(resetTitle?.closest('p-tabpanel')).toBe(importPanel?.closest('p-tabpanel'));
    });

    it('template_anyMode_neverShowsEntwicklerWerkzeuge', async () => {
      // Arrange
      isDevelopment.mockReturnValue(of(true));

      // Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

      // Assert
      expect(tabLabels(el)).not.toContain('Entwickler-Werkzeuge');
      expect(el.textContent).not.toContain('Entwickler-Werkzeuge');
    });

    it('onTabChange_noUnsavedChanges_switchesWithoutConfirmAndWritesTabIntoAddress', async () => {
      // Arrange
      const { harness, el } = await openSettings();

      // Act
      tabByLabel(el, 'Beleg Druck').click();

      // Assert
      await settle(harness);
      expect(confirmCalls).toHaveLength(0);
      expect(activeTabLabel(el)).toBe('Beleg Druck');
      expect(TestBed.inject(Router).url).toBe(`${SETTINGS_URL}?tab=print`);
    });

    it('template_reloadedWithPrintTab_keepsBelegDruckActive', async () => {
      // Arrange & Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=print`);

      // Assert
      expect(activeTabLabel(el)).toBe('Beleg Druck');
    });

    it('template_unknownTabInAddress_activatesBasisEinstellungen', async () => {
      // Arrange & Act
      const { el } = await openSettings(`${SETTINGS_URL}?tab=xyz`);

      // Assert
      expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
    });

    it('onTabChange_unsavedScanPause_asksWithBleibenAndVerwerfenAndStays', async () => {
      // Arrange
      const { harness, el } = await openSettings();
      childOf(harness, SettingsForm).onValueChange(5000);

      // Act
      tabByLabel(el, 'User').click();

      // Assert
      await settle(harness);
      expect(confirmCalls).toHaveLength(1);
      expect(confirmCalls[0]).toEqual(
        expect.objectContaining({
          key: LEAVE_TAB_CONFIRM_KEY,
          header: 'Ungespeicherte Änderungen',
          message: 'In diesem Tab gibt es ungespeicherte Änderungen. Beim Wechsel gehen sie verloren.',
          acceptLabel: 'Verwerfen',
          rejectLabel: 'Bleiben',
        }),
      );
      expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
      expect(TestBed.inject(Router).url).toBe(SETTINGS_URL);
    });

    it('onTabChange_unsavedPrintTexts_asksBeforeSwitching', async () => {
      // Arrange
      const { harness, el } = await openSettings(`${SETTINGS_URL}?tab=print`);
      childOf(harness, PrintTextsForm).onChange('abgabeBeleg', 'text1', 'Neu');

      // Act
      tabByLabel(el, 'Sonstiges').click();

      // Assert
      await settle(harness);
      expect(confirmCalls).toHaveLength(1);
      expect(activeTabLabel(el)).toBe('Beleg Druck');
    });

    it('onTabChange_confirmAnsweredBleiben_keepsTabAndInput', async () => {
      // Arrange
      const { harness, el } = await openSettings();
      const settingsForm = childOf(harness, SettingsForm);
      settingsForm.onValueChange(5000);
      tabByLabel(el, 'User').click();
      await settle(harness);

      // Act
      confirmCalls[0].reject?.();

      // Assert
      await settle(harness);
      expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
      expect(settingsForm.scannerPauseMs()).toBe(5000);
      expect(TestBed.inject(Router).url).toBe(SETTINGS_URL);
    });

    it('onTabChange_confirmAnsweredVerwerfen_switchesAndRestoresSavedValue', async () => {
      // Arrange
      const { harness, el } = await openSettings();
      const settingsForm = childOf(harness, SettingsForm);
      settingsForm.onValueChange(5000);
      tabByLabel(el, 'User').click();
      await settle(harness);

      // Act
      confirmCalls[0].accept?.();

      // Assert
      await settle(harness);
      expect(activeTabLabel(el)).toBe('User');
      expect(TestBed.inject(Router).url).toBe(`${SETTINGS_URL}?tab=users`);
      expect(settingsForm.scannerPauseMs()).toBe(3000);
      expect(settingsForm.hasUnsavedChanges()).toBe(false);
    });

    it('onTabChange_openImportPreview_asksAndVerwerfenClosesThePreview', async () => {
      // Arrange
      const { harness, el } = await openSettings(`${SETTINGS_URL}?tab=misc`);
      const importPanel = childOf(harness, ImportPanel);
      importPanel.onFileSelect(selectEventFor(jsonFile()));
      tabByLabel(el, 'User').click();
      await settle(harness);

      // Act
      confirmCalls[0].accept?.();

      // Assert
      await settle(harness);
      expect(confirmCalls).toHaveLength(1);
      expect(importPanel.state()).toBe('empty');
      expect(activeTabLabel(el)).toBe('User');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/pages/settings-page/settings-page.spec.ts` — erwartet: FAIL (keine `p-tab`-Elemente, `onTabChange` fehlt)
- [ ] **Schritt 3: Minimal implementieren**
  `settings-page.ts` vollständig ersetzen:
  ```ts
  import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
  import { toSignal } from '@angular/core/rxjs-interop';
  import { ActivatedRoute, Router } from '@angular/router';
  import { ConfirmationService } from 'primeng/api';
  import { ConfirmDialogModule } from 'primeng/confirmdialog';
  import { Tabs, TabsModule } from 'primeng/tabs';
  import { map } from 'rxjs';
  import { SettingsForm } from '../../components/settings-form/settings-form';
  import { PrintTextsForm } from '../../components/print-texts-form/print-texts-form';
  import { ImportPanel } from '../../components/import-panel/import-panel';
  import { UserManagement } from '../../components/user-management/user-management';
  import { DevToolsPanel } from '../../components/dev-tools-panel/dev-tools-panel';
  import { Page } from '../../../../shared/components/page/page';
  import { DiscardableChanges, SETTINGS_TABS, SettingsTab, resolveSettingsTab } from './settings-tabs';

  const TAB_QUERY_PARAM = 'tab';
  const LEAVE_TAB_CONFIRM_KEY = 'leaveSettingsTab';

  /**
   * Einstellungsseite mit Tab-Leiste (docs/forge/2026-10-18-einstellungen-tabs/spec.md). Der aktive
   * Tab steht im Query-Parameter `tab`; ein Wechsel ersetzt den History-Eintrag (`replaceUrl`), damit
   * „Zurück" die Seite verlässt statt Tabs abzuklappern. Alle Panels sind nicht lazy: jeder Bereich
   * lädt beim Öffnen und behält seinen Zustand über Tab-Wechsel.
   *
   * Kein `@if (isAdmin())` — die Route `/settings` trägt `adminGuard` (app.routes.ts), keiner der
   * Bereiche prüft die Rolle erneut. `DevToolsPanel` blendet sich außerhalb von Development selbst aus.
   */
  @Component({
    selector: 'app-settings-page',
    imports: [TabsModule, ConfirmDialogModule, SettingsForm, PrintTextsForm, ImportPanel, UserManagement, DevToolsPanel, Page],
    templateUrl: './settings-page.html',
    styleUrl: './settings-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SettingsPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly confirmationService = inject(ConfirmationService);

    private readonly tabsRef = viewChild.required(Tabs);
    private readonly settingsFormRef = viewChild.required(SettingsForm);
    private readonly printTextsFormRef = viewChild.required(PrintTextsForm);
    private readonly importPanelRef = viewChild.required(ImportPanel);

    readonly tabs = SETTINGS_TABS;
    readonly leaveTabConfirmKey = LEAVE_TAB_CONFIRM_KEY;
    readonly activeTab = toSignal(
      this.route.queryParamMap.pipe(map((params) => resolveSettingsTab(params.get(TAB_QUERY_PARAM)))),
      { requireSync: true },
    );

    onTabChange(value: string | number | undefined): void {
      const target = resolveSettingsTab(value === undefined ? null : String(value));
      if (target === this.activeTab()) return;

      const leaving = this.discardableOf(this.activeTab());
      if (leaving?.hasUnsavedChanges()) {
        this.askBeforeLeaving(leaving, target);
        return;
      }
      this.navigateTo(target);
    }

    /**
     * `p-tabs` übernimmt einen Klick sofort in sein eigenes `value`-Model; ohne Zurücksetzen stünde
     * während der Rückfrage schon der neue Tab da. Erst „Verwerfen" wechselt wirklich.
     */
    private askBeforeLeaving(leaving: DiscardableChanges, target: SettingsTab): void {
      this.tabsRef().value.set(this.activeTab());
      this.confirmationService.confirm({
        key: LEAVE_TAB_CONFIRM_KEY,
        header: 'Ungespeicherte Änderungen',
        message: 'In diesem Tab gibt es ungespeicherte Änderungen. Beim Wechsel gehen sie verloren.',
        acceptLabel: 'Verwerfen',
        rejectLabel: 'Bleiben',
        accept: () => this.discardAndNavigate(leaving, target),
      });
    }

    private discardAndNavigate(leaving: DiscardableChanges, target: SettingsTab): void {
      leaving.discardChanges();
      this.navigateTo(target);
    }

    private discardableOf(tab: SettingsTab): DiscardableChanges | null {
      const discardables: Record<SettingsTab, DiscardableChanges | null> = {
        general: this.settingsFormRef(),
        users: null,
        print: this.printTextsFormRef(),
        misc: this.importPanelRef(),
      };
      return discardables[tab];
    }

    private navigateTo(tab: SettingsTab): void {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [TAB_QUERY_PARAM]: tab },
        replaceUrl: true,
      });
    }
  }
  ```
  `settings-page.html` anlegen:
  ```html
  <app-page title="Einstellungen">
    <p-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
      <p-tablist>
        @for (tab of tabs; track tab.value) {
          <p-tab [value]="tab.value" class="settings-page__tab">
            <i [class]="tab.icon" aria-hidden="true"></i>
            <span>{{ tab.label }}</span>
          </p-tab>
        }
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel value="general">
          <app-settings-form />
        </p-tabpanel>
        <p-tabpanel value="users">
          <app-user-management />
        </p-tabpanel>
        <p-tabpanel value="print">
          <app-print-texts-form />
        </p-tabpanel>
        <p-tabpanel value="misc">
          <app-import-panel />
          <app-dev-tools-panel />
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  </app-page>

  <p-confirmdialog [key]="leaveTabConfirmKey" />
  ```
  `settings-page.scss` anlegen:
  ```scss
  .settings-page__tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/pages/settings-page/settings-page.spec.ts` — erwartet: PASS (17 Tests)
- [ ] **Schritt 5: Absicherungstest AC-21 laufen lassen**
  Bestehende Tests `settingsRoute_always_isGuardedByAdminGuard` (`src/app/app.routes.spec.ts`) und `redirects to /intake for non-admin role` (`src/app/core/auth/admin.guard.spec.ts`); der Guard sitzt an der Route `settings` und greift damit auch bei `/settings?tab=…`.
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/app.routes.spec.ts --include src/app/core/auth/admin.guard.spec.ts` — erwartet: PASS `settingsRoute_always_isGuardedByAdminGuard`, PASS `redirects to /intake for non-admin role`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 6: Absicherungstest AC-05 laufen lassen**
  `UserManagement` bleibt unverändert, nur ihr Einbau wandert in den Tab „User"; dass im Tab kein anderer Bereich steht, belegt `template_userTab_containsOnlyTheUserManagement` aus Schritt 1. Die Benutzertabelle und ihre Funktionen sichern die bestehenden Tests in `src/app/features/settings/components/user-management/user-management.spec.ts` ab: Tabelle `loads users on construction`, `maps users into rows with a German role label and pending-change label`; Anlegen `rowAdd opens the dialog in create mode with no initial value and clears serverErrors`, `in create mode calls UsersApi.create and shows a success toast`; Rolle ändern und Passwort zurücksetzen `edit action opens the dialog in edit mode pre-filled with the row role`, `in edit mode calls UsersApi.update with the editing user id, role and newPassword`; Löschen `shows a confirmation before calling UsersApi.remove`, `on confirm accept calls UsersApi.remove and reloads the list`.
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/user-management/user-management.spec.ts` — erwartet: PASS, darunter die acht genannten Tests; rot ist ein Befund, kein Grund, den Test oder die Komponente zu ändern
- [ ] **Schritt 7: Gesamte Frontend-Suite, Lint und Build**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: PASS (alle Testdateien)
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne Fehler
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK
- [ ] **Schritt 8: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.html src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.scss && git commit -m "feat(settings): Einstellungsseite mit Tabs, Tab in der Adresse und Rückfrage beim Wechsel" -- src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.ts src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.html src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.scss src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.spec.ts`

---

### Task 7: Doku-Nachführung (Epic, Feature-Profil, Glossar)

**ACs:** AC-01, AC-02, AC-12 (Doku-Stand der umgesetzten Fähigkeiten)

**Dateien:**
- Modify: `docs/requirements/bazaar-app/epics/Epic_Einstellungen/epic.md:1-36` · `## Überblick`
- Modify: `docs/knowledge/feature-profile/bazaar-app-settings/feature.md:1-48` · `# Einstellungen (Bazaar-App)`
- Modify: `docs/glossary/frontend-terms.md:120` · `### Filterleiste`

**Interfaces:**
- Consumes: Tab-Katalog aus Task 1 (`general`, `users`, `print`, `misc`), Rückfrage-Text aus Task 6, Überschrift aus Task 5
- Produces: —

Absicherung statt Testzyklus (reine Doku, kein Code):

- [ ] **Schritt 1: Epic ergänzen**
  In `docs/requirements/bazaar-app/epics/Epic_Einstellungen/epic.md`:
  - Im Frontmatter `updated: 2026-08-17` ersetzen durch `updated: 2026-10-18`.
  - Im `## Index` nach der Zeile `- Überblick — Admin-Einstellungen` einfügen: `- Aufbau der Seite — Tabs`
  - Den Absatz unter `## Überblick`
    ```
    Admin-Seite für systemweite Parameter und den JSON-Import aus der Voranmelde-App. Der Import ist in der Einstellungen-Seite integriert — kein separater Menüpunkt.
    ```
    ersetzen durch
    ```
    Admin-Seite für systemweite Parameter und den JSON-Import aus der Voranmelde-App. Der Import ist in der Einstellungen-Seite integriert (Tab „Sonstiges") — kein separater Menüpunkt.

    ### Aufbau der Seite

    Die Seite ist eine Tab-Leiste (PrimeNG `p-tabs`); jeder Tab trägt Caption und Icon:

    | Tab | Icon | Inhalt |
    |---|---|---|
    | Basis-Einstellungen | `pi-cog` | Systemparameter (Abschnitt 1) |
    | User | `pi-users` | Benutzerverwaltung (Abschnitt 3) |
    | Beleg Druck | `pi-print` | Freitexte von „Abgabe-Beleg" und „Verkäufer-Übersicht" untereinander; je Abschnitt Freitext 1 und 2 nebeneinander (je 50 %), Freitext 3 über die ganze Breite, Freitext 4 und 5 nebeneinander (je 50 %); ein gemeinsamer Button „Freitexte speichern" |
    | Sonstiges | `pi-ellipsis-h` | JSON-Import (Abschnitt 2), in jedem Modus; nur im Development-Modus zusätzlich „Datenbank zurücksetzen" |

    - Start-Tab ist „Basis-Einstellungen". Der aktive Tab steht im Query-Parameter `tab` (`general`, `users`, `print`, `misc`), sodass Neuladen oder ein geteilter Link denselben Tab öffnet; ein unbekannter Wert öffnet „Basis-Einstellungen".
    - Wer den Tab wechselt, während in „Basis-Einstellungen" oder „Beleg Druck" ungespeicherte Änderungen stehen oder in „Sonstiges" eine Import-Vorschau offen ist, bekommt die Rückfrage „Ungespeicherte Änderungen" mit „Bleiben" und „Verwerfen". „Verwerfen" wechselt den Tab und stellt den zuletzt gespeicherten Stand wieder her bzw. schließt die Vorschau.
    ```
- [ ] **Schritt 2: Feature-Profil nachführen**
  In `docs/knowledge/feature-profile/bazaar-app-settings/feature.md`:
  - Zeile `**Last reviewed:** 2026-10-14` ersetzen durch `**Last reviewed:** 2026-10-18`.
  - Direkt nach der Zeile `## Capabilities` (und der folgenden Leerzeile) einfügen:
    ```
    ### Tab-Leiste (`settings-page`)
    - Admin sees four tabs „Basis-Einstellungen" (`pi-cog`), „User" (`pi-users`), „Beleg Druck" (`pi-print`), „Sonstiges" (`pi-ellipsis-h`); start tab is „Basis-Einstellungen" — `features/settings/pages/settings-page/settings-page.{ts,html}`, `settings-tabs.ts`
    - Active tab lives in query parameter `tab` (`general`/`users`/`print`/`misc`); unknown value falls back to `general`; tab switches use `replaceUrl` — `settings-page.ts` `activeTab`, `navigateTo()`
    - Switching away from unsaved changes (Scan-Pause, Freitexte) or an open import preview asks „Ungespeicherte Änderungen" with „Bleiben"/„Verwerfen" — `settings-page.ts` `onTabChange()`; areas expose `hasUnsavedChanges`/`discardChanges()`

    ```
  - Unter `### Freitexte der Belege (`print-texts-form`)` nach der ersten Zeile einfügen:
    ```
    - Fields are laid out like the receipt: Freitext 1|2 side by side, Freitext 3 full width, Freitext 4|5 side by side; one „Freitexte speichern" button saves both templates — `print-texts-form.html` `.print-texts-form__grid`
    ```
  - Die Überschrift `### Dev-Tools / DB-Reset (`dev-tools-panel`)` ersetzen durch `### Datenbank zurücksetzen (`dev-tools-panel`, Tab „Sonstiges")`.
  - In `## Spans` den Text `` `features/settings/pages/settings-page/settings-page.ts` (hostet alle vier Bereiche), `features/settings/components/{settings-form,import-panel,user-management,user-dialog,dev-tools-panel}/` `` ersetzen durch `` `features/settings/pages/settings-page/settings-page.{ts,html}` + `settings-tabs.ts` (Tab-Leiste, hostet alle Bereiche), `features/settings/components/{settings-form,print-texts-form,import-panel,user-management,user-dialog,dev-tools-panel}/` ``.
- [ ] **Schritt 3: Glossar ergänzen**
  In `docs/glossary/frontend-terms.md` direkt vor der Zeile `### Filterleiste` einfügen:
  ```
  ### Einstellungs-Tabs (Haupt-App)
  - **Maps to:** `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts` — vier Tabs der Einstellungsseite: „Basis-Einstellungen" (`general`, Scan-Pause), „User" (`users`, Benutzerverwaltung), „Beleg Druck" (`print`, Freitexte der Belege), „Sonstiges" (`misc`, JSON-Import und nur im Development-Modus „Datenbank zurücksetzen"); aktiver Tab im Query-Parameter `tab`.
  - **Confidence:** user-confirmed
  - **First seen:** 2026-10-18

  ```
- [ ] **Schritt 4: Absicherung laufen lassen**
  Die Spec-Dateien sind ausgenommen, weil die Negativ-Prüfungen aus Task 5 (`dev-tools-panel.spec.ts`) und Task 6 (`settings-page.spec.ts`) das Wort absichtlich enthalten.
  Befehl: `git grep -n "Entwickler-Werkzeuge" -- docs/requirements docs/knowledge docs/glossary src/bazaar-app/frontend/src ':!*.spec.ts'` — erwartet: keine Ausgabe (Exit-Code 1); ein Treffer ist ein Befund
- [ ] **Schritt 5: Commit**
  `git commit -m "docs(settings): Einstellungs-Tabs in Epic, Feature-Profil und Glossar nachgeführt" -- docs/requirements/bazaar-app/epics/Epic_Einstellungen/epic.md docs/knowledge/feature-profile/bazaar-app-settings/feature.md docs/glossary/frontend-terms.md`

## Entscheidungen
- **W · Tab-Adresse** · Aussage — Der aktive Tab steht im Query-Parameter `tab` mit den Werten `general`, `users`, `print`, `misc` (`/settings?tab=print`); Tab-Wechsel mit `replaceUrl`, damit „Zurück" die Seite verlässt und nicht an der Rückfrage vorbei Tabs wechselt; fehlender oder unbekannter Wert öffnet „Basis-Einstellungen"; keine Routenänderung, Guard unverändert.
- **W · Rückfrage-Text** · Aussage — Ein Text für alle Fälle: Titel „Ungespeicherte Änderungen", Text „In diesem Tab gibt es ungespeicherte Änderungen. Beim Wechsel gehen sie verloren.", Buttons „Bleiben" / „Verwerfen".
- **E · Ungespeichert-Definition** · Planer — Scan-Pause und Freitexte gelten als ungespeichert, wenn die Eingabe vom zuletzt geladenen oder gespeicherten Stand abweicht; im Import zählt nur der Zustand `'preview'`, ein laufender Import (`'running'`) nicht, weil „Verwerfen" ihn nicht abbrechen kann. Grund: einfachste Regel, die AC-16/AC-19/AC-20 trennscharf erfüllt.
- **E · Tab zurücksetzen vor der Rückfrage** · Planer — `p-tabs.value` ist ein `model` und übernimmt den Klick selbst (`primeng-tabs.mjs`: `Tab.onClick` → `Tabs.updateValue`); die Seite setzt es per `tabsRef().value.set(activeTab())` zurück, bevor sie fragt. Grund: sonst zeigte die Seite während der Rückfrage bereits den neuen Tab (AC-17).
- **E · Panels nicht lazy** · Planer — Alle vier Panels werden wie bisher beim Öffnen gerendert (PrimeNG-Default `lazy=false`), Zustände bleiben über Tab-Wechsel erhalten. Grund: Verhalten der Bereiche bleibt unverändert, `viewChild.required` findet jede Komponente.
- **E · Unbekannter Tab bleibt in der Adresse** · Planer — `/settings?tab=xyz` zeigt „Basis-Einstellungen", die Adresse wird nicht umgeschrieben. Grund: AC-15 verlangt nur den aktiven Tab; Umschreiben wäre zusätzliche Navigation ohne Nutzen.
- **E · Keine Rückfrage beim Verlassen der Seite** · Planer — Navigation über die Sidebar oder „Zurück" verlässt die Seite ohne Rückfrage, wie heute. Grund: Die Spec fordert die Rückfrage nur beim Tab-Wechsel.
- **E · Beleg-Druck-Breite** · Planer — Das Freitext-Formular wächst von `max-width: 640px` auf `960px`; Überschrift „Freitexte der Belege", Markdown-Hilfe und Platzhinweis bleiben. Grund: zwei Spalten à 50 % brauchen Breite, Inhalte bleiben laut Spec unverändert.
- **E · Lage von Tab-Katalog und `DiscardableChanges`** · Planer — `settings-tabs.ts` neben der Seite; die Bereichs-Komponenten erfüllen `DiscardableChanges` strukturell ohne Import aus `pages/`. Grund: keine Abhängigkeit der Komponenten von der Seite.
- **E · Verwerfen während des Speicherns** · Planer — `SettingsForm.discardChanges()` und `PrintTextsForm.discardChanges()` beginnen mit `if (this.saving()) return;`; wählt der Admin während eines laufenden Speicherns „Verwerfen", wechselt der Tab, die Eingabe bleibt, und die Antwort macht den gesendeten Stand zum Bezug. Grund: sonst zeigte die Anzeige den alten Stand, der Server den neuen, und `hasUnsavedChanges` wäre fälschlich `true`.
- **E · Gemeinsame Import-Test-Helfer** · Planer — `previewResultStub`, `selectEventFor`, `jsonFile` liegen in `features/settings/testing/import-preview.stub.ts` (Task 4) und werden von `import-panel.spec.ts` und `settings-page.spec.ts` importiert. Grund: eine Stelle bei Änderungen an `ImportPreviewResult`; `testing/`-Ordner gibt es im Repo bereits.
- **R1 · Global Constraints** — geändert — Task 6 hat einen neuen Schritt 6 „Absicherungstest AC-05" mit den bestehenden Tests aus `user-management.spec.ts` für Tabelle, Anlegen, Rolle ändern/Passwort zurücksetzen und Löschen samt Befehl; die Dateiliste nennt `user-management.spec.ts`. Die übrigen Schritte heißen jetzt Schritt 7 und 8. Ganz AC-05 geprüft: „kein anderer Bereich" belegt weiter `template_userTab_containsOnlyTheUserManagement`.
- **R1 · Task 2** — geändert — Anker der Testdatei auf `describe('SettingsForm'` korrigiert (Datei hat `describe('SettingsForm', () => {`).
- **R1 · Task 3** — geändert — Anker der Testdatei auf `describe('PrintTextsForm'` korrigiert. `discardChanges()` in `PrintTextsForm` und (gleiches Muster) in `SettingsForm` aus Task 2 beginnt mit `if (this.saving()) return;`; je ein Test `discardChanges_saveInFlight_keepsInputAndStaysConsistentAfterResponse` mit `Subject` belegt den Fall. Festlegung als E-Eintrag „Verwerfen während des Speicherns".
- **R1 · Task 4** — geändert — Anker der Testdatei auf `describe('ImportPanel'` korrigiert. Zusätzlich (für Task 6) die Helfer `previewResultStub`, `selectEventFor`, `jsonFile` nach `features/settings/testing/import-preview.stub.ts` gezogen; `import-panel.spec.ts` importiert sie, Commit nimmt die neue Datei auf.
- **R1 · Task 5** — geändert — Anker der Testdatei auf `describe('DevToolsPanel'` korrigiert.
- **R1 · Task 6** — geändert — Anker auf `describe('SettingsPage'` korrigiert; die Seiten-Spec importiert `previewResultStub`, `selectEventFor`, `jsonFile` aus dem gemeinsamen Stub statt eigener Kopien, `FileSelectEvent`/`ImportPreviewResult`-Importe und `jsonFileSelectEvent` entfallen; Consumes nennt die Helfer aus Task 4.
- **R1 · Task 7** — geändert — Der Suchbefehl der Absicherung schließt `':!*.spec.ts'` aus, weil die Negativ-Prüfungen aus Task 5 und Task 6 das Wort absichtlich enthalten; außerhalb von `docs/forge` steht es sonst nur in `dev-tools-panel.html`, das Task 5 ersetzt.
