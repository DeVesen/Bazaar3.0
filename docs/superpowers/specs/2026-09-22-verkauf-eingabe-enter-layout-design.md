# Design: Verkauf Artikelnummer-Eingabe (Enter-Bestätigung), Page-Header & responsives Layout

Quelle: [`docs/spec/2026-09-22-verkauf-eingabe-enter-layout.md`](../../spec/2026-09-22-verkauf-eingabe-enter-layout.md) (Anforderungen, Akzeptanzkriterien, geklärte Fragen — dort verbindlich, hier nur die technische Umsetzung).

## Betroffene Dateien (Übersicht)

- `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.ts` — größter Umbau: Enter/Valid-Zustandsmaschine, Moduswechsel-Ownership, Numpad-Buffer-Logik.
- `.../checkout-page/checkout-page.html` — Page-Header-Markup, `app-input` statt `app-input-group`, `app-barcode-scanner`/`app-numpad` als eigene Siblings.
- `.../checkout-page/checkout-page.scss` — Header-CSS, responsives Grid, Cart-Höhenbegrenzung.
- `src/bazaar-app/frontend/src/app/features/checkout/components/cart/cart.html` + `cart.scss` — neuer Item-Listen-Wrapper für Scroll-Isolation.
- Keine Änderungen an `app-input`, `app-input-group`, `app-barcode-scanner`, `app-numpad` selbst (bestehende APIs reichen aus) und keine Änderungen an `input-group` bleibt ungenutzt für diese Seite, aber nicht gelöscht (andere Nutzer möglich).

## 1. Architektur & Komponenten-Verkabelung

`checkout-page` übernimmt die Orchestrierungs-Rolle, die bisher intern in `app-input-group` steckte:

- Neue Signale: `articleNumber: signal<string>('')`, `activeMode: signal<'keyboard'|'camera'|'numpad'>('keyboard')`, `previousMode: signal<'keyboard'|'camera'|'numpad'>('keyboard')`.
- Template-Ausschnitt:
  ```html
  <app-input
    [value]="articleNumber()"
    [debounceMs]="0"
    [addonRight]="inputAddons()"
    (valueChange)="onTyped($event)"
    (enter)="onEnterPressed()"
    (addonClick)="onAddonClick($event)"
  />
  @if (activeMode() === 'camera') {
    <app-barcode-scanner (codeDetected)="onCodeDetected($event)" />
  }
  @if (activeMode() === 'numpad') {
    <app-numpad
      [enterDisabled]="lookupState() === 'searching'"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onEnterPressed()"
    />
  }
  ```
- Numpad-Digit-Buffer-Logik wird 1:1 aus `input-group.ts` (`applyNumpadKeyToSearchValue`, Zeilen 521-527) nach `checkout-page.ts` übernommen — reine String-Manipulation, keine Abhängigkeit von `input-group`.
- `inputAddons()` computed liefert `InputAddon[]`:
  - Normalzustand (`lookupState() !== 'found'`): 4 Icon-Addons — Kamera (`key:'camera'`), Numpad (`key:'numpad'`), Clear (`key:'clear'`), Enter (`key:'enter'`). Aktiver Modus bekommt zusätzliche CSS-Klasse (z. B. `addon--active`) über das `class`-Feld.
  - `lookupState() === 'found'`: nur Clear + Enter.
  - Enter-Addon bekommt zusätzlich `class` mit `addon--disabled`-Marker wenn `lookupState() === 'searching'` (visuelles Disable per CSS `pointer-events:none; opacity:.5`, da `InputAddon` kein natives `disabled`-Feld hat).
- `onAddonClick(key)`: `'camera'`/`'numpad'` → `activeMode.set(key)` (bzw. zurück auf `'keyboard'` wenn bereits aktiv, Toggle-Verhalten wie bisher); `'clear'` → `articleNumber.set(''); lookupState.set('idle')`; `'enter'` → `onEnterPressed()`.

## 2. Enter/Valid-Zustandsmaschine

- `lookupState: signal<'idle'|'searching'|'found'|'not-sellable'|'error'>('idle')`, `foundValue: signal<string|null>(null)` (Feldinhalt zum Zeitpunkt des Fundes).
- `onEnterPressed()`:
  1. `if (lookupState() === 'searching') return;` (Negativfall: Enter während Suche wirkungslos).
  2. `if (lookupState() === 'found' && articleNumber() === foundValue()) { addToCart(); return; }`
  3. sonst `startLookup()`.
- `startLookup()`: `lookupState.set('searching')` → bestehender API-Call (`articlesApi.getByNumber`, inkl. lokalem Duplikat-Check zuerst wie bisher) → Ergebnis setzt `lookupState` auf `found` (+ `foundValue.set(articleNumber())`, `previousMode.set(activeMode()); activeMode.set('keyboard')`) oder `not-sellable`/`error` (Text-Mapping unverändert aus bestehendem `handleArticleFound`/`handleArticleLookupError`).
- `onTyped(value)`: `articleNumber.set(value)`; wenn `lookupState()` in (`found`,`not-sellable`,`error`) und `value !== foundValue()` (oder bei `not-sellable`/`error` einfach jede Änderung) → `lookupState.set('idle')` (Fund/Fehler verfällt, nächstes Enter = neuer Lookup).
- Cart-Add (`addToCart()`): bestehende Logik, danach `articleNumber.set(''); lookupState.set('idle'); foundValue.set(null); activeMode.set(previousMode())`, InfoArea grün „Nächsten Artikel eingeben", Fokus zurück ins Feld.
- Fokus-Handling: `app-input` exponiert kein `focus()` — gleiches Best-Effort-Pattern wie bisher (`ViewChild` auf Host + `nativeElement.querySelector('input')?.focus()`); bei `found`/`not-sellable`/`error` zusätzlich Inhalt selektieren (`.select()` auf dem gefundenen `<input>`-Element).
- Kamera-Treffer (`onCodeDetected(code)`): `articleNumber.set(code); activeMode.set('keyboard')` — kein Lookup, Enter weiterhin nötig.
- Info-Text-Mapping: `idle` initial (kein `foundValue`, Feld nie befüllt) → gelb „Bitte Artikelnummer eingeben"; `found` → „Artikel gültig – `<Preis>` – Enter zum Übernehmen"; nach Cart-Add → grün „Nächsten Artikel eingeben"; `not-sellable`/`error` → bestehende Texte je Fall unverändert.

## 3. Page-Header

- Neuer Block ganz oben in `checkout-page.html`:
  ```html
  <div class="checkout-page__header">
    <h1 class="checkout-page__title">Verkauf</h1>
  </div>
  ```
- CSS (`checkout-page.scss`), exakt nach `docs/components/overview.md` Page-Header-Format:
  ```scss
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  &__title {
    font-size: 20px;
    font-weight: 800;
    color: #0f1f30;
  }
  ```
- Keine Actions-Zeile (Titel ist einziges Element im Header).

## 4. Responsives Layout

- `.checkout-page` (Grid-Wrapper):
  ```scss
  .checkout-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (min-width: 769px) {
      max-width: 75vw;
      margin: 0 auto;
      grid-template-columns: 1fr 2fr; // 33% / 67%
    }
  }
  ```
- `≤`768px (kein Media-Query nötig, ist der Default): `grid-template-columns: 1fr 1fr` reicht nicht für „gestapelt, je 100%" — Default muss `grid-template-columns: 1fr` (eine Spalte) sein, `>`768px überschreibt auf `1fr 2fr`. Reihenfolge im Markup ist bereits Eingabe-Spalte vor Warenkorb-Spalte (aktuell `--left`/`--right`), Grid-Stacking übernimmt automatisch „Eingabe über Warenkorb".
- Kein neuer Breakpoint-Wert — `769px`/`768px` deckungsgleich mit bestehendem Shell-Literal (`shell.scss:5`, `max-width:768px`); hier `min-width:769px` als Gegenstück, weil Grid-Columns (nicht Padding) betroffen sind.

## 5. Cart-Höhenbegrenzung (nur `>`768px)

- `.checkout-page__column--right` (Wrapper um `<app-cart>`):
  ```scss
  @media (min-width: 769px) {
    .checkout-page__column--right {
      max-height: calc(100vh - 26px - 26px - 44px - 20px); // Shell-Padding oben+unten + Header-Höhe + margin-bottom
      overflow: hidden;
      display: flex;
    }
  }
  ```
  (Exakter Pixel-Wert für Header-Höhe wird beim Implementieren gegen den echten Header abgeglichen — 20px/800-Titel liegt bei ca. 28px Zeilenhöhe, + 20px margin-bottom + Shell-Padding 26px oben/unten aus `shell.scss:1-3`.)
- `app-cart`s Host bzw. `p-card` bekommt `display:flex; flex-direction:column; max-height:100%; overflow:hidden`.
- `cart.html` bekommt einen neuen Wrapper um die Item-Liste:
  ```html
  <div class="cart__items">
    @for (item of items(); track item.id) { ... bestehende Item-Zeile ... }
  </div>
  ```
  CSS: `.cart__items { overflow-y: auto; flex: 1; min-height: 0; }` (`min-height:0` nötig, sonst verweigert Flexbox das Schrumpfen unter Content-Höhe).
- `.cart__total` und `.cart__footer` bekommen `flex-shrink: 0` — bleiben dadurch immer sichtbar, kein `position:sticky` nötig (reines Flex-Layout genügt, da Footer/Total ohnehin am Ende des Flex-Containers stehen).
- `≤`768px: alle obigen Regeln liegen unter `@media (min-width:769px)` — im gestapelten Zustand gilt automatisch das alte Verhalten (kein `max-height`, normales Seiten-Scrollen).

## Testing

- Unit-Tests `checkout-page.spec.ts`: Zustandsmaschine (idle→searching→found→cart-add, Verfall bei Tippen, Enter während searching no-opt, alle fünf Nicht-verkaufbar-Fälle behalten Fokus+Select), Numpad-Buffer-Logik, Kamera-Fill-ohne-Lookup, Addon-Array-Berechnung (4 vs. 2 Addons, disabled-Klasse während searching).
- Kein neuer Test für `app-input`/`app-input-group`/`app-numpad`/`app-barcode-scanner` nötig — deren APIs bleiben unverändert, nur neu verkabelt.
- Cart: neuer Test für `cart__items`-Wrapper-Vorhandensein optional (CSS-only-Änderung, kein Verhalten im TS).
- Responsives Layout/Höhenbegrenzung: kein sinnvoller Unit-Test (reines CSS/Media-Query) — manuelle/visuelle Prüfung bei `>`768px und `≤`768px im Implementierungsschritt.

## Offene technische Annahme

- Exakter `calc()`-Wert für Cart-`max-height` (Abschnitt 5) ist eine Schätzung — wird beim Implementieren gegen den real gerenderten Header abgeglichen, notfalls über eine CSS-Custom-Property vom Header-Element statt Festwert (Fallback, falls die Schätzung optisch nicht passt).
