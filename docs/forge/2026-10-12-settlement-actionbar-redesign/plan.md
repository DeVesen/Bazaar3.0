# Aktionsleiste der Abrechnungsseite — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-settlement-actionbar-redesign/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Im Zustand „Verkäufer abrechnen" der Seite „Abrechnung" (Haupt-App) werden Name, Adresse, Abrechnungs-Tag und die vier Aktionen zu einer einzigen gerahmten Aktionsleiste mit „<"-Button links, Verkäufer-Name samt Adresse und Tag mittig und „Drucken", „Zurückgeben", „Abrechnen" rechts.
**Architektur:** Die Leiste wird mit der PrimeNG-Komponente `p-toolbar` (Standard-Projektion, drei direkte Kinder `bar-start`, `bar-center`, `bar-end`) in `settlement-page.html` gebaut; Layout (Mitte exakt mittig über zwei gleich wachsende Außenbereiche, Kürzen mit „…", Umbruch bei schmaler Seite per Container-Query) kommt aus `settlement-page.scss`. Die Logik von `SettlementPage` bleibt unverändert; Template, Styles, Specs und das Glossar ändern sich.
**Tech-Stack:** Angular 22 (zoneless, OnPush), PrimeNG 22 (`p-toolbar`, `p-button`, `pTooltip`, `p-tag`), Vitest über `dv-angular-test`.
**Spec:** docs/forge/2026-10-12-settlement-actionbar-redesign/spec.md
**Basis:** 0502943

## Global Constraints
- Umgesetzt wird nur der Zustand „Verkäufer abrechnen" der Seite „Abrechnung" der Haupt-App (`src/bazaar-app/frontend/.../features/settlement/pages/settlement-page`); der Auswahlschritt mit der Verkäufersuche, der Wizard der Artikelannahme und die Voranmelde-App bleiben unverändert. (Spec: Soll-Vorgaben, AC-17)
- Layout-Muster der Aktionsleiste (Vorbild für künftige Seiten): Zurück links als reines Icon, Name des Gegenstands mittig, Aktionen rechts; gerahmt wie die Filterleiste der Verkäufer-Referenz. (Spec: Soll-Vorgaben, W · Rahmen)
- Der Zurück-Button zeigt nur das „<"-Symbol und keinen Text; Hinweis (Hover und Screenreader): „Zurück zur Verkäuferwahl". (Spec: AC-02, AC-03)
- Beschriftungen, Symbole und Aktiv-/Inaktiv-Regeln von „Drucken", „Zurückgeben" und „Abrechnen" bleiben unverändert; Reihenfolge rechts: „Drucken", „Zurückgeben", „Abrechnen". (Spec: AC-09, AC-10, AC-11)
- Der Seitentitel „Abrechnung", die KPI-Kacheln und die Artikeltabelle bleiben unverändert; die Leiste steht unter dem Seitentitel und über den KPI-Kacheln. (Spec: AC-01, AC-15)
- Mitte: Name (Vorname und Nachname) horizontal mittig, darunter Adresse, bei abgerechneten Verkäufern darunter „Abgerechnet am <Datum Uhrzeit> · <Betrag>"; Name und Adresse einzeilig und mit „…" gekürzt, der Tag vollständig sichtbar. (Spec: AC-05, AC-06, AC-07, AC-08)
- Schmale Seite: Die Leiste bricht um, die Mitte steht in einer eigenen Zeile mittig, es entsteht keine waagerechte Bildlaufleiste, alle Elemente bleiben erreichbar. (Spec: AC-16)
- Begriff: „Aktionsleiste" ist der kanonische Begriff und steht im Glossar; „Filterleiste" bleibt den Listenseiten vorbehalten. (Spec: W · Begriff)
- Projekt-`CLAUDE.md`: nur PrimeNG-Komponenten, kein natives HTML für UI-Elemente; Code, Routen und JSON-Contract englisch, Doku deutsch.
- dv-angular:angular-testing-vitest-conventions: Specs mit Vitest (`vi.fn`, `expect`), Test-Aufbau Arrange/Act/Assert mit Kommentaren `// Arrange` `// Act` `// Assert`, neue `it`-Namen nach `<methode>_<Situation>_<Erwartung>`, bestehende Testnamen bleiben, zoneless: Act → `await fixture.whenStable()` → Assert, keine zusätzlichen Mock-Bibliotheken, Verifikation nur über den Testbefehl des Projekts.
- dv-angular:angular-component: `ChangeDetectionStrategy.OnPush` bleibt, native Control-Flow-Syntax, kein `ngClass`/`ngStyle`.
- dv-angular:angular-styling: Standard-Kapselung (`Emulated`) bleibt, kein `::ng-deep`, Klassen auf Elementen im eigenen Template.
- primeng: PrimeNG-v22-Code nur nach den Referenzen schreiben (`p-button` mit `icon`/`ariaLabel`/`text`/`severity`, `pTooltip` aus `primeng/tooltip`, `p-toolbar` aus `primeng/toolbar`); kein `styleClass` an neuen Buttons.
- dv-angular:toolchain: Tests laufen über `dv-angular-test` (siehe Task-Schritte), nicht über `ng test` per Hand.

---

### Task 1: Gerahmte Aktionsleiste (Template, Styles, Struktur- und Style-Tests)

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-15, AC-16, AC-17

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.html:6-23` · `<div class="settlement-page__header">`
- Modify: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.ts:1-60` · `import { TagModule } from 'primeng/tag';`
- Modify: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.scss:1-39` · `&__header {`
- Test: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts:172-185` · `it('keeps "Abrechnung" above the seller header after a seller is selected'`

Zu ändern sind im Template der Block von `<div class="settlement-page__header">` bis zu dessen schließendem `</div>` (Zeilen 6–23), in `settlement-page.ts` die PrimeNG-Import-Zeilen und das `imports`-Array der Komponente (beide bei `TagModule`), in `settlement-page.scss` die Regeln `&__header`, `&__identity` und `&__actions` sowie `.settlement-page` selbst, und in der Spec der Test `keeps "Abrechnung" above the seller header after a seller is selected` samt neuem `describe`-Block danach.

**Interfaces:**
- Consumes: bestehende Methoden und Signale von `SettlementPage` — `onBack(): void`, `onPrint(): void`, `onReturnClick(): void`, `onSettleClick(): void`, `canReturn(): boolean`, `canSettleClick(): boolean`, `isSettled(): boolean`, `settlement(): SellerSettlement | null` (unverändert).
- Produces: DOM-Vertrag für Tests und Folge-Tasks — innerhalb von `div.settlement-page` als erstes Kind `p-toolbar.settlement-page__actionbar` mit genau drei direkten Kindern in der Reihenfolge `div.settlement-page__bar-start` (ein `p-button`), `div.settlement-page__bar-center` (`span.settlement-page__name`, `span.settlement-page__address`, bei abgerechnetem Verkäufer `p-tag`), `div.settlement-page__bar-end` (drei `p-button`: „🖨️ Drucken", „↩ Zurückgeben", „✓ Abrechnen"); danach `app-kpi-grid` und `p-table`. Die Klassen `settlement-page__header`, `settlement-page__identity` und `settlement-page__actions` entfallen; `settlement-page__name` und `settlement-page__address` bleiben.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `settlement-page.spec.ts` den Import oben erweitern (Zeile 1 und neue Zeile darunter):
  ```ts
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { Tooltip } from 'primeng/tooltip';
  ```
  Den bestehenden Test `keeps "Abrechnung" above the seller header after a seller is selected` ersetzen durch:
  ```ts
  it('keeps "Abrechnung" above the action bar after a seller is selected', async () => {
    const { fixture, component } = await setup();
    selectSeller(component);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Abrechnung');
    expect(el.querySelector('app-page .page__content .settlement-page__actionbar')).not.toBeNull();
  });
  ```
  Direkt nach dem Test `sorts the article list ascending by number` (vor `describe('canReturn / canSettleClick'`) diesen Block einfügen:
  ```ts
  describe('action bar', () => {
    async function renderActionBar(
      settlementOverrides: Partial<SellerSettlement> = {},
    ): Promise<{
      fixture: ComponentFixture<SettlementPage>;
      component: SettlementPage;
      el: HTMLElement;
      bar: HTMLElement;
      start: HTMLElement;
      center: HTMLElement;
      end: HTMLElement;
      backButton: HTMLButtonElement;
    }> {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement(settlementOverrides)));
      const { fixture, component } = await setup({ settlementApi });
      selectSeller(component);
      fixture.detectChanges();
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      const bar = el.querySelector<HTMLElement>('.settlement-page > p-toolbar.settlement-page__actionbar');
      const start = bar?.querySelector<HTMLElement>(':scope > .settlement-page__bar-start');
      const center = bar?.querySelector<HTMLElement>(':scope > .settlement-page__bar-center');
      const end = bar?.querySelector<HTMLElement>(':scope > .settlement-page__bar-end');
      const backButton = start?.querySelector<HTMLButtonElement>('p-button button');
      if (!bar || !start || !center || !end || !backButton) {
        throw new Error('settlement-page__actionbar not rendered');
      }
      return { fixture, component, el, bar, start, center, end, backButton };
    }

    function containerRule(): CSSRule {
      const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
      const rule = rules.find((r) => r.cssText.startsWith('@container (max-width: 52rem)') && r.cssText.includes('settlement-page__bar-center'));
      if (!rule) throw new Error('@container (max-width: 52rem) rule for the action bar not found');
      return rule;
    }

    it('template_sellerSelected_rendersOneToolbarWithThreeAreasBetweenTitleAndKpiGrid', async () => {
      // Arrange
      // Act
      const { el, bar } = await renderActionBar();

      // Assert
      const title = el.querySelector('app-page .page__title') as HTMLElement;
      expect(title.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(el.querySelectorAll('p-toolbar').length).toBe(1);
      expect(Array.from(bar.children).map((c) => c.className)).toEqual([
        'settlement-page__bar-start',
        'settlement-page__bar-center',
        'settlement-page__bar-end',
      ]);
      const content = Array.from(el.querySelector('.settlement-page')?.children ?? []).map((c) => c.tagName.toLowerCase());
      expect(content).toEqual(['p-toolbar', 'app-kpi-grid', 'p-table']);
      expect(el.querySelectorAll('.settlement-page__header').length).toBe(0);
    });

    it('template_sellerSelected_rendersOnlyIconBackButtonOnTheLeftAndNoActionsLeftOfTheName', async () => {
      // Arrange
      // Act
      const { start, backButton } = await renderActionBar();

      // Assert
      expect(start.querySelectorAll('p-button').length).toBe(1);
      expect(backButton.textContent?.trim()).toBe('');
      expect(backButton.querySelector('.pi-angle-left')).not.toBeNull();
      expect(start.textContent?.trim()).toBe('');
    });

    it('template_sellerSelected_labelsBackButtonZurueckZurVerkaeuferwahlForHoverAndScreenreader', async () => {
      // Arrange
      // Act
      const { fixture, backButton } = await renderActionBar();

      // Assert
      expect(backButton.getAttribute('aria-label')).toBe('Zurück zur Verkäuferwahl');
      const host = fixture.debugElement.query(By.css('.settlement-page__bar-start p-button'));
      expect(host.injector.get(Tooltip).content()).toBe('Zurück zur Verkäuferwahl');
    });

    it('onBack_backButtonClicked_showsSellerSelectionWithoutActionBar', async () => {
      // Arrange
      const { fixture, component, el, backButton } = await renderActionBar();

      // Act
      backButton.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(component.state()).toBe('selection');
      expect(el.querySelector('app-seller-search')).not.toBeNull();
      expect(el.querySelector('p-toolbar')).toBeNull();
    });

    it('template_selectionStateShown_rendersNoActionBar', async () => {
      // Arrange
      // Act
      const { fixture } = await setup();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('app-seller-search')).not.toBeNull();
      expect(el.querySelector('p-toolbar')).toBeNull();
      expect(el.querySelector('.settlement-page__actionbar')).toBeNull();
    });

    it('template_unsettledSeller_rendersNameThenAddressInCenterAndNoSettledTag', async () => {
      // Arrange
      // Act
      const { center } = await renderActionBar({ settledAt: null });

      // Assert
      expect(Array.from(center.children).map((c) => c.className)).toEqual([
        'settlement-page__name',
        'settlement-page__address',
      ]);
      expect(center.querySelector('.settlement-page__name')?.textContent?.trim()).toBe('Anna Meier');
      expect(center.querySelector('.settlement-page__address')?.textContent?.trim()).toBe(
        'Hauptstr. 1, 76133 Karlsruhe',
      );
      expect(center.textContent).not.toContain('Abgerechnet am');
      expect(center.querySelector('p-tag')).toBeNull();
    });

    it('template_settledSeller_rendersNameAddressAndSettledTagInCenterInOrder', async () => {
      // Arrange
      // Act
      const { center } = await renderActionBar({
        settledAt: '2026-01-15T10:00:00Z',
        payoutAmount: 332.94,
      });

      // Assert
      expect(Array.from(center.children).map((c) => c.tagName.toLowerCase())).toEqual([
        'span',
        'span',
        'p-tag',
      ]);
      const tag = center.querySelector('p-tag') as HTMLElement;
      expect(tag.textContent).toContain('Abgerechnet am');
      expect(tag.textContent).toContain('332.94');
    });

    it('template_sellerSelected_rendersActionsInOrderDruckenZurueckgebenAbrechnen', async () => {
      // Arrange
      // Act
      const { end } = await renderActionBar();

      // Assert
      const labels = Array.from(end.querySelectorAll('p-button button')).map((b) => b.textContent?.trim());
      expect(labels).toEqual(['🖨️ Drucken', '↩ Zurückgeben', '✓ Abrechnen']);
    });

    it('styles_sellerSelected_startAndEndGrowEquallyCenterDoesNotAndBarDoesNotWrapWhenWide', async () => {
      // Arrange
      // Act
      const { bar, start, center, end } = await renderActionBar();

      // Assert
      expect(getComputedStyle(bar).flexWrap).toBe('nowrap');
      expect(getComputedStyle(start).flexGrow).toBe('1');
      expect(getComputedStyle(end).flexGrow).toBe('1');
      expect(getComputedStyle(center).flexGrow).toBe('0');
      expect(getComputedStyle(end).justifyContent).toBe('flex-end');
    });

    it('styles_sellerSelected_centerIsCenteredAndNameAndAddressTruncateWithEllipsis', async () => {
      // Arrange
      // Act
      const { center } = await renderActionBar({ settledAt: '2026-01-15T10:00:00Z', payoutAmount: 332.94 });

      // Assert
      expect(getComputedStyle(center).textAlign).toBe('center');
      expect(getComputedStyle(center).alignItems).toBe('center');
      for (const selector of ['.settlement-page__name', '.settlement-page__address']) {
        const style = getComputedStyle(center.querySelector(selector) as HTMLElement);
        expect(style.overflow).toBe('hidden');
        expect(style.textOverflow).toBe('ellipsis');
        expect(style.whiteSpace).toBe('nowrap');
      }
      expect(getComputedStyle(center.querySelector('p-tag') as HTMLElement).textOverflow).not.toBe('ellipsis');
    });

    it('styles_narrowContainer_wrapsAndPutsCenterIntoItsOwnFullWidthRow', async () => {
      // Arrange
      await renderActionBar();

      // Act
      const css = containerRule().cssText;

      // Assert
      expect(css).toContain('flex-wrap: wrap');
      expect(css).toMatch(/settlement-page__bar-center[^}]*flex-basis: 100%/);
      expect(css).toMatch(/settlement-page__bar-center[^}]*order: 3/);
      expect(css).toMatch(/settlement-page__bar-end[^}]*flex-wrap: wrap/);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: FAIL `template_sellerSelected_rendersOneToolbarWithThreeAreasBetweenTitleAndKpiGrid` (und die übrigen zehn neuen Tests des Blocks `action bar` sowie `keeps "Abrechnung" above the action bar after a seller is selected`; `settlement-page__actionbar not rendered`); `template_selectionStateShown_rendersNoActionBar` ist schon grün
- [ ] **Schritt 3: Minimal implementieren**
  1. `settlement-page.ts`: Import-Zeilen ergänzen (nach `import { TagModule } from 'primeng/tag';`):
     ```ts
     import { ToolbarModule } from 'primeng/toolbar';
     import { TooltipModule } from 'primeng/tooltip';
     ```
     und im `@Component({ imports: [...] })` nach `TagModule,` einfügen:
     ```ts
         ToolbarModule,
         TooltipModule,
     ```
  2. `settlement-page.html`: den Block von `<div class="settlement-page__header">` (Zeile 6) bis zum schließenden `</div>` des Headers (Zeile 23) ersetzen durch:
     ```html
         <p-toolbar class="settlement-page__actionbar">
           <div class="settlement-page__bar-start">
             <p-button
               icon="pi pi-angle-left"
               severity="secondary"
               [text]="true"
               ariaLabel="Zurück zur Verkäuferwahl"
               pTooltip="Zurück zur Verkäuferwahl"
               tooltipPosition="bottom"
               (onClick)="onBack()"
             />
           </div>

           <div class="settlement-page__bar-center">
             <span class="settlement-page__name">{{ s.seller.firstName }} {{ s.seller.lastName }}</span>
             <span class="settlement-page__address">{{ s.seller.address }}, {{ s.seller.postalCode }} {{ s.seller.city }}</span>
             @if (isSettled()) {
               <p-tag
                 severity="success"
                 [value]="'Abgerechnet am ' + (s.settledAt | date: 'dd.MM.yyyy HH:mm') + ' · ' + (s.payoutAmount | currency: 'EUR')"
               />
             }
           </div>

           <div class="settlement-page__bar-end">
             <p-button label="🖨️ Drucken" (onClick)="onPrint()" />
             <p-button label="↩ Zurückgeben" [disabled]="!canReturn()" (onClick)="onReturnClick()" />
             <p-button label="✓ Abrechnen" [disabled]="!canSettleClick()" (onClick)="onSettleClick()" />
           </div>
         </p-toolbar>
     ```
     Die Zeilen darunter (`<app-kpi-grid ...>` bis `</p-table>`) und alles danach bleiben unverändert.
  3. `settlement-page.scss`: die komplette Datei ersetzen durch:
     ```scss
     :host {
       display: block;
     }

     .settlement-page {
       display: flex;
       flex-direction: column;
       gap: 1.25rem;
       // Container für die Umbruch-Regel der Aktionsleiste (siehe @container unten).
       container-type: inline-size;

       // p-toolbar liefert Rahmen, Padding und Flex; hier nur Mitte-Layout und Umbruch.
       &__actionbar {
         flex-wrap: nowrap;
       }

       // Außenbereiche wachsen gleich (flex-basis 0) -> Mitte steht exakt mittig,
       // unabhängig von der Breite der Außenbereiche.
       &__bar-start,
       &__bar-end {
         display: flex;
         align-items: center;
         flex-grow: 1;
         flex-shrink: 1;
         flex-basis: 0;
       }

       &__bar-start {
         justify-content: flex-start;
       }

       &__bar-end {
         justify-content: flex-end;
         gap: 0.5rem;
       }

       &__bar-center {
         display: flex;
         flex-direction: column;
         align-items: center;
         gap: 0.25rem;
         flex-grow: 0;
         flex-shrink: 1;
         flex-basis: auto;
         min-width: 0;
         text-align: center;
       }

       &__name,
       &__address {
         max-width: 100%;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
       }

       &__name {
         font-weight: 600;
         font-size: 1.125rem;
       }

       &__address {
         color: var(--p-text-muted-color);
       }
     }

     // Schmale Seite: drei Bereiche passen nicht nebeneinander. Zurück links und Aktionen rechts
     // bleiben in Zeile 1, die Mitte rutscht in eine eigene, volle Zeile darunter.
     @container (max-width: 52rem) {
       .settlement-page__actionbar {
         flex-wrap: wrap;
       }

       .settlement-page__bar-start {
         order: 1;
       }

       .settlement-page__bar-end {
         order: 2;
         flex-wrap: wrap;
       }

       .settlement-page__bar-center {
         order: 3;
         flex-grow: 0;
         flex-shrink: 0;
         flex-basis: 100%;
       }
     }
     ```
     Die Außenbereiche haben bewusst kein `min-width: 0`: ihr Mindestmaß bleibt der Inhalt, damit „Drucken", „Zurückgeben" und „Abrechnen" bei Platzmangel nicht zusammengedrückt werden; stattdessen schrumpft die Mitte (`min-width: 0`) und kürzt Name und Adresse mit „…".
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: PASS aller Tests der Datei (die elf neuen des Blocks `action bar`, der angepasste Seitentitel-Test und die übrigen bestehenden). Schlägt `styles_narrowContainer_wrapsAndPutsCenterIntoItsOwnFullWidthRow` fehl, weil Angular den Selektor im `@container` mit Attributen umschreibt, bleibt der Test inhaltlich gleich; angepasst wird nur die Regex-Prüfung auf `cssText`, nicht die SCSS-Regel.
- [ ] **Schritt 5: Ergänzende Sichtprüfung der berechneten Layouts (AC-05, AC-08, AC-16; Regeln sind in Schritt 1 automatisch getestet)**
  Dev-Server starten: `preview_start` mit `{"name": "bazaar-app-frontend"}`, Seite „Abrechnung" öffnen, einen Verkäufer wählen und prüfen: Leiste gerahmt unter dem Titel; Name exakt mittig (Mittelpunkt von `.settlement-page__bar-center` und der Leiste stimmen überein, z. B. per `javascript_tool` mit `getBoundingClientRect`); langer Name und lange Adresse mit „…" gekürzt, Tag vollständig; `resize_window` mit `{"preset": "mobile"}` — Mitte in eigener Zeile mittig, keine waagerechte Bildlaufleiste, alle vier Buttons erreichbar; danach `resize_window` mit `{"preset": "desktop"}`. Lässt sich die Seite nicht öffnen (Anmeldung/Backend nötig), steht das im Bericht des Tasks als „nicht geprüft", kein Code wird dafür geändert.
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.html src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.ts src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.scss src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` · `git commit -m "feat(bazaar-app): Aktionsleiste Abrechnungsseite mit Zurück-Icon, Name mittig, Aktionen rechts (settlement-actionbar-redesign)"`

### Task 2: Absicherung Aktionen und unveränderter Seitenrahmen

**ACs:** AC-10, AC-11, AC-12, AC-13, AC-14, AC-15

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts:172-300` · `describe('action bar'` (neuer `describe` direkt danach, Anker erst nach Task 1 vorhanden)

**Interfaces:**
- Consumes: DOM-Vertrag aus Task 1 (`p-toolbar.settlement-page__actionbar`, `.settlement-page__bar-end` mit den drei Buttons in der Reihenfolge Drucken, Zurückgeben, Abrechnen); bestehende Methoden `SettlementPage.onPrint()`, `onReturnClick()`, `onSettleClick()` und Signale `scanDialogVisible`, `settlePanelVisible`; die Helfer `setup`, `selectSeller`, `settlement`, `settlementApiStub`, `printServiceStub` der Spec-Datei.
- Produces: keine.

- [ ] **Schritt 1: Absicherungstest schreiben**
  In `settlement-page.spec.ts` direkt nach dem Ende von `describe('action bar', ...)` einfügen:
  ```ts
  describe('action bar actions (unchanged behaviour)', () => {
    async function renderWithActions(
      settlementOverrides: Partial<SellerSettlement>,
      printService = printServiceStub(),
    ) {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement(settlementOverrides)));
      const { fixture, component } = await setup({ settlementApi, printService });
      selectSeller(component);
      fixture.detectChanges();
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      const [print, giveBack, settle] = Array.from(
        el.querySelectorAll<HTMLButtonElement>('.settlement-page__bar-end p-button button'),
      );
      return { fixture, component, el, print, giveBack, settle, printService };
    }

    it('template_unsettledSellerWithOpenArticles_enablesZurueckgeben', async () => {
      // Arrange
      // Act
      const { giveBack } = await renderWithActions({ openCount: 3, canSettle: false });

      // Assert
      expect(giveBack.disabled).toBe(false);
    });

    it('template_unsettledSellerWithoutOpenArticles_disablesZurueckgeben', async () => {
      // Arrange
      // Act
      const { giveBack } = await renderWithActions({ openCount: 0, canSettle: true });

      // Assert
      expect(giveBack.disabled).toBe(true);
    });

    it('template_settledSeller_disablesZurueckgebenAndAbrechnen', async () => {
      // Arrange
      // Act
      const { giveBack, settle } = await renderWithActions({
        openCount: 3,
        canSettle: true,
        settledAt: '2026-01-15T10:00:00Z',
        payoutAmount: 332.94,
      });

      // Assert
      expect(giveBack.disabled).toBe(true);
      expect(settle.disabled).toBe(true);
    });

    it('template_unsettledSellerServerAllowsSettlement_enablesAbrechnen', async () => {
      // Arrange
      // Act
      const { settle } = await renderWithActions({ openCount: 0, canSettle: true });

      // Assert
      expect(settle.disabled).toBe(false);
    });

    it('template_unsettledSellerServerDeniesSettlement_disablesAbrechnen', async () => {
      // Arrange
      // Act
      const { settle } = await renderWithActions({ openCount: 0, canSettle: false });

      // Assert
      expect(settle.disabled).toBe(true);
    });

    it('onReturnClick_zurueckgebenClicked_opensScanDialog', async () => {
      // Arrange
      const { fixture, component, giveBack } = await renderWithActions({ openCount: 3 });

      // Act
      giveBack.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(component.scanDialogVisible()).toBe(true);
    });

    it('onSettleClick_abrechnenClicked_opensSettlementPanel', async () => {
      // Arrange
      const { fixture, component, settle } = await renderWithActions({ openCount: 0, canSettle: true });

      // Act
      settle.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(component.settlePanelVisible()).toBe(true);
    });

    it('onPrint_unsettledSeller_printsPreliminarySummary', async () => {
      // Arrange
      const printService = printServiceStub();
      const { fixture, print } = await renderWithActions({ openCount: 3 }, printService);

      // Act
      print.click();
      await fixture.whenStable();

      // Assert
      expect(printService.printSellerSummary).toHaveBeenCalledWith({
        sellerId: 'SEL00001',
        phase: 'preliminary',
      });
    });

    it('onPrint_settledSeller_printsFinalSummary', async () => {
      // Arrange
      const printService = printServiceStub();
      const { fixture, print } = await renderWithActions(
        { settledAt: '2026-01-15T10:00:00Z', payoutAmount: 332.94 },
        printService,
      );

      // Act
      print.click();
      await fixture.whenStable();

      // Assert
      expect(printService.printSellerSummary).toHaveBeenCalledWith({
        sellerId: 'SEL00001',
        phase: 'final',
      });
    });

    it('template_sellerSelected_keepsPageTitleKpiTilesAndArticleTableBelowTheBar', async () => {
      // Arrange
      // Act
      const { el } = await renderWithActions({ openCount: 4, soldCount: 31, revenue: 380.5 });

      // Assert
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Abrechnung');
      expect(el.querySelectorAll('app-kpi-tile').length).toBe(3);
      expect(el.querySelector('.settlement-page > p-table')).not.toBeNull();
      const headers = Array.from(el.querySelectorAll('p-table th')).map((th) => th.textContent?.trim());
      expect(headers).toEqual(['Nummer', 'Bezeichnung', 'Preis', 'Status']);
    });
  });
  ```
- [ ] **Schritt 2: Absicherungstest laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: PASS aller zehn neuen Tests des Blocks `action bar actions (unchanged behaviour)`, darunter `onReturnClick_zurueckgebenClicked_opensScanDialog`, `onSettleClick_abrechnenClicked_opensSettlementPanel`, `onPrint_unsettledSeller_printsPreliminarySummary` und `onPrint_settledSeller_printsFinalSummary`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit**
  `git add src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` · `git commit -m "test(bazaar-app): Absicherung Aktionen der Aktionsleiste Abrechnungsseite (settlement-actionbar-redesign)"`

### Task 3: Glossar-Eintrag „Aktionsleiste"

**ACs:** keine (setzt die Spec-Entscheidung „W · Begriff" um)

**Dateien:**
- Modify: `docs/glossary/frontend-terms.md:73-76` · `### Kachelliste`

**Interfaces:**
- Consumes: DOM-/Klassenvertrag aus Task 1 (`p-toolbar.settlement-page__actionbar` in `settlement-page.html`).
- Produces: Glossar-Begriff „Aktionsleiste" mit Abgrenzung zur „Filterleiste".

- [ ] **Schritt 1: Eintrag schreiben**
  Am Dateiende von `docs/glossary/frontend-terms.md` (nach dem Eintrag `### Kachelliste` und dessen drei Zeilen) eine Leerzeile und diesen Block anhängen:
  ```markdown

  ### Aktionsleiste
  - **Maps to:** `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.html` — gerahmte Leiste (`p-toolbar.settlement-page__actionbar`) auf einer Seite mit einem Gegenstand und Aktionen: Zurück links als reines „<"-Icon, Name des Gegenstands mittig (mit Adresse bzw. Zusatzzeile darunter), Aktionen rechts. Erste Ausprägung: Abrechnungsseite der Haupt-App im Zustand „Verkäufer abrechnen"; Vorbild für weitere Seiten dieser Art. Nicht verwenden: „Filterleiste" — dieser Begriff bleibt den Listenseiten (Suche, Sortierung, Status) vorbehalten.
  - **Confidence:** user-confirmed
  - **First seen:** 2026-10-12
  ```
- [ ] **Schritt 2: Eintrag prüfen**
  Befehl: `grep -n "^### Aktionsleiste" docs/glossary/frontend-terms.md` — erwartet: genau eine Zeile `### Aktionsleiste`
- [ ] **Schritt 3: Commit**
  `git add docs/glossary/frontend-terms.md` · `git commit -m "docs(glossary): Begriff Aktionsleiste (settlement-actionbar-redesign)"`

## Entscheidungen
- **W · Planungs-Skills** · Aussage — Es gelten dv-angular:angular-testing-vitest-conventions, dv-angular:angular-component (mit dv-angular:toolchain), primeng und dv-angular:angular-styling.
- **E · Komponente der Leiste** · Planer — `p-toolbar` (PrimeNG) mit Standard-Projektion statt eigenem Flex-Container: Das Host-Element `p-toolbar` ist selbst das gerahmte Flex-Element (Rahmen, Padding, Gap aus den Toolbar-Tokens); die Spec lässt die Komponentenwahl dem Plan, und die Leiste entspricht damit der Filterleiste der Verkäufer-Referenz. Die `#start`/`#center`/`#end`-Templates werden nicht genutzt, weil ihre Wrapper-Elemente in PrimeNG-Styles liegen und ohne `::ng-deep` nicht für die Mitte-Regeln erreichbar wären.
- **E · Exakt mittig und Kürzen** · Planer — Die Außenbereiche haben `flex-grow: 1` und `flex-basis: 0`, die Mitte `flex-grow: 0`; solange alle drei Bereiche nebeneinander passen, steht die Mitte dadurch exakt mittig (AC-05). Bei Platzmangel schrumpft die Mitte (`min-width: 0`) und Name und Adresse werden mit „…" gekürzt (AC-08), die Außenbereiche behalten ihr Inhaltsmaß. Der Tag bleibt unverkürzt (kein `overflow: hidden`).
- **E · Umbruch per Container-Query bei 52 rem** · Planer — AC-16 verlangt ein Umbrechen, „wenn die drei Bereiche nicht nebeneinander passen"; ein reines `flex-wrap` würde die Aktionen statt der Mitte umbrechen. Deshalb: `.settlement-page` ist Container (`container-type: inline-size`, gleiches Muster wie `kpi-grid.scss`), unterhalb 52 rem (ca. Zurück-Button + drei Aktionen + Mindestbreite der Mitte) bricht die Leiste um und die Mitte steht mit `order: 3` und `flex-basis: 100%` in einer eigenen Zeile. Der Schwellwert ist eine Näherung an die Breite der drei Aktionen und lässt sich in der Sichtprüfung (Task 1, Schritt 5) nachziehen.
- **E · Zurück-Button ohne `styleClass`** · Planer — `icon="pi pi-angle-left"`, `[text]="true"`, `severity="secondary"` und `ariaLabel` entsprechen dem Zurück-Button des Wizards der Artikelannahme (`intake-wizard.html`), ohne das veraltete `styleClass="p-button-icon-only"`; ein Button ohne Label ist in PrimeNG v22 automatisch icon-only. Der Hover-Hinweis kommt zusätzlich über `pTooltip` (AC-03 verlangt ihn bei Mausberührung), `tooltipPosition="bottom"` wie die Tabellen-Aktionen.
- **E · Test der Umbruch-Regeln** · Planer — jsdom berechnet keine Layouts, behält aber `@container`-Regeln in `document.styleSheets` (geprüft). Der Test `styles_narrowContainer_wrapsAndPutsCenterIntoItsOwnFullWidthRow` liest deshalb die Regel aus; die berechneten Pixel (Mitte exakt mittig, Umbruch bei echter Breite) bleiben Sichtprüfung als Ergänzung.
- **E · Aktionen unverändert, Absicherung statt Zyklus** · Planer — AC-10 bis AC-14 und AC-15 ändern kein Verhalten; Task 2 sichert sie über die DOM-Buttons der neuen Leiste ab. Die Logik-Tests von `canReturn`/`canSettleClick`/`onSettleConfirmed` im bestehenden Spec bleiben unverändert.
