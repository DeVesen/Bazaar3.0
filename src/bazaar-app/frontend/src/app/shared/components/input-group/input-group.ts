import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Numpad } from '../numpad/numpad';

export type InputMode = 'keyboard' | 'camera' | 'numpad';
export type InputGroupVariant = 'search' | 'price' | 'count';

/** Fixed order per component doc, Abschnitt 3 "Sichtbarkeitsregel der Modus-Buttons". */
const MODE_ORDER: InputMode[] = ['keyboard', 'camera', 'numpad'];

/**
 * Doc section 4 "Debounce": 300ms, fixed constant, no settings/Input — a `suchDebounceMs`
 * knob was explicitly rejected in review as a frontend-tuning constant without fachlichen
 * Anlass (Epic_Einstellungen).
 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Cross-app input pattern for search/scan/price fields with up to three interchangeable entry
 * modes (docs/components/input-group/component.md). Composes `pInputText`/`p-inputnumber` with
 * `app-barcode-scanner` (camera mode) and `app-numpad` (numpad mode) — never modifies either
 * component's own public API (both are final, per their own tasks/docs).
 *
 * PrimeIcons note (Round-16 Task 4, doc Abschnitt 3): the doc's icon column uses
 * `data-p-icon="..."`, this project's convention is a plain `pi pi-...` CSS class (see
 * `verkaeufer-dialog`). `pi-camera` matches the doc exactly. `pi-th-large` matches the doc's own
 * stated alternative for numpad exactly. There is NO keyboard icon at all in the installed
 * `primeicons` 8.0.1 (`data-p-icon="keyboard"` has no CSS-class equivalent) — `pi-text` is used
 * instead as the closest available semantic match ("switch to typing"). The action button (↩)
 * and the numpad's own `⏎` share `pi-reply` (see `numpad.ts` for that same substitution).
 *
 * Debounce (doc Abschnitt 4): 300ms fixed, applied only to keyboard-typed `valueChange`
 * emissions via `toObservable` + `debounceTime` + `distinctUntilChanged`, following the same
 * pattern already used in `articles-page.ts`. Camera (`codeDetected`) and numpad (`keyPressed`)
 * are discrete events and bypass the debounce entirely, emitting immediately.
 *
 * `valueChange` typing: a single `output<string | number>()` — `string` for the search variant
 * (keyboard/camera/numpad-into-text-field) and `number` for the price and count variants. Kept
 * as one output rather than two so that a consumer only ever binds `(valueChange)` once; the
 * variant `input` already tells the consumer which member of the union to expect.
 *
 * Numpad wiring (doc's own Numpad Abschnitt 4 "Empfehlung: Integration im Parent"): for the
 * price and count variants (both "single numeric value" — see `isNumericVariant()`),
 * `p-inputnumber` has its own internal keydown handling that turns a dispatched `KeyboardEvent`
 * into buffer/locale-aware value updates — dispatching the numpad's key onto its native `<input>`
 * is sufficient, exactly as the numpad doc's pattern assumes. The search variant's plain
 * `pInputText` has no such internal buffer (a browser does not apply untrusted synthetic keydown
 * events to a plain `<input>`'s value) — this component therefore ALSO maintains the search
 * field's text buffer itself from the numpad's `key` values, while still dispatching the
 * synthetic event onto the native input for API/behavioral consistency with the doc's pattern
 * and with the numeric variants.
 *
 * Round-25 Task 6a: the `count` variant (`ms`-addon, integer-only `p-inputnumber`, no camera
 * mode) reuses every price-variant code path that is identical for both — `priceValue`,
 * `onPriceTyped`, `onNumpadKey`, `onNumpadClear`, `dispatchTarget`, `onCodeDetected`,
 * `applyExternalValue` — via the shared `isNumericVariant()` check, rather than duplicating a
 * third parallel numeric code path. Only the template (addon text, fraction-digit config,
 * numpad `showDecimal`, no camera branch) differs per variant.
 */
@Component({
  selector: 'app-input-group',
  imports: [
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
    BarcodeScanner,
    Numpad,
  ],
  template: `
    <div class="input-group">
      @if (variant() === 'search') {
        <p-inputgroup>
          @if (showLeftAddon()) {
            <p-inputgroup-addon><i class="pi pi-search"></i></p-inputgroup-addon>
          }

          @if (activeMode() === 'camera' && cameraReplacesInput()) {
            <app-barcode-scanner [active]="activeMode() === 'camera'" (codeDetected)="onCodeDetected($event)" />
          } @else {
            <input
              #searchInput
              pInputText
              type="text"
              [id]="inputId()"
              [ngModel]="rawValue()"
              (ngModelChange)="onTyped($event)"
              [readonly]="activeMode() === 'numpad'"
            />
          }

          @if (searching()) {
            <p-progressspinner styleClass="input-group__spinner" />
          } @else if (rawValue().length > 0) {
            <p-button icon="pi pi-times" [text]="true" [rounded]="true" (onClick)="onClear()" />
          }

          <p-button
            icon="pi pi-reply"
            [text]="true"
            [rounded]="true"
            [disabled]="rawValue().length === 0"
            (onClick)="onSubmit()"
          />

          @for (mode of visibleModes(); track mode) {
            <p-button [icon]="iconForMode(mode)" [text]="true" [rounded]="true" (onClick)="switchMode(mode)" />
          }
        </p-inputgroup>

        @if (activeMode() === 'numpad') {
          <app-numpad
            [showDecimal]="false"
            [showEnter]="true"
            [enterDisabled]="rawValue().length === 0"
            (keyPressed)="onNumpadKey($event)"
            (cleared)="onNumpadClear()"
            (submitted)="onSubmit()"
          />
        }
      } @else if (variant() === 'price') {
        <p-inputgroup>
          @if (activeMode() === 'camera') {
            <app-barcode-scanner [active]="activeMode() === 'camera'" (codeDetected)="onCodeDetected($event)" />
          } @else {
            <p-inputnumber
              #priceInput
              [inputId]="inputId()"
              mode="decimal"
              locale="de-DE"
              [minFractionDigits]="2"
              [ngModel]="priceValue()"
              (ngModelChange)="onPriceTyped($event)"
              [readonly]="activeMode() === 'numpad'"
            />
          }
          <p-inputgroup-addon>€</p-inputgroup-addon>

          @for (mode of visibleModes(); track mode) {
            <p-button [icon]="iconForMode(mode)" [text]="true" [rounded]="true" (onClick)="switchMode(mode)" />
          }
        </p-inputgroup>

        @if (activeMode() === 'numpad') {
          <app-numpad
            [showDecimal]="true"
            [showEnter]="true"
            [enterDisabled]="priceValue() === null"
            (keyPressed)="onNumpadKey($event)"
            (cleared)="onNumpadClear()"
            (submitted)="onSubmit()"
          />
        }
      } @else {
        <!-- count variant (Round-25 Task 6a): mirrors the price branch above — same
             "addon + numpad, no camera, no clear/action button" shape — but no camera mode at
             all (a millisecond pause is never barcode-scanned, doc Abschnitt 5a) and an
             integer-only p-inputnumber (minFractionDigits/maxFractionDigits 0, no locale
             fraction formatting concern since there are no decimals). -->
        <p-inputgroup>
          <p-inputnumber
            #priceInput
            [inputId]="inputId()"
            mode="decimal"
            [minFractionDigits]="0"
            [maxFractionDigits]="0"
            [ngModel]="priceValue()"
            (ngModelChange)="onPriceTyped($event)"
            [readonly]="activeMode() === 'numpad'"
          />
          <p-inputgroup-addon>ms</p-inputgroup-addon>

          @for (mode of visibleModes(); track mode) {
            <p-button [icon]="iconForMode(mode)" [text]="true" [rounded]="true" (onClick)="switchMode(mode)" />
          }
        </p-inputgroup>

        @if (activeMode() === 'numpad') {
          <app-numpad
            [showDecimal]="false"
            [showEnter]="true"
            [enterDisabled]="priceValue() === null"
            (keyPressed)="onNumpadKey($event)"
            (cleared)="onNumpadClear()"
            (submitted)="onSubmit()"
          />
        }
      }

      @if (cameraDenied()) {
        <div class="input-group__camera-error">Kamerazugriff nicht möglich</div>
      }
    </div>
  `,
  styleUrl: './input-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroup {
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly priceInputRef = viewChild<InputNumber>('priceInput');

  readonly modes = input<InputMode[]>(['keyboard']);
  readonly variant = input<InputGroupVariant>('search');
  /**
   * Doc gap fill (Round-16 Task 4 brief): the doc's slot table (Abschnitt 2/4) requires a
   * spinner that replaces the clear button "während die Suche läuft" but never defines how the
   * parent signals that state. Added as the minimal reasonable `Input` for it.
   */
  readonly searching = input<boolean>(false);
  /**
   * Round-16 Task 7 fix round 1 (reviewer Critical 1): when `false`, the search-variant camera
   * mode does NOT swap `app-barcode-scanner` in for the `<input>` — the field stays visible and
   * usable, and this component renders no internal scanner at all. For a consumer like
   * Seller-Search that needs the camera view to replace something else entirely (its own result
   * list, per its own component doc Abschnitt 6/input-group doc Abschnitt 3's note), the
   * consumer renders its own `app-barcode-scanner` wherever it wants and pushes detected values
   * back in via `applyExternalValue()`. Defaults to `true` (input-group's own historical
   * behavior, unchanged for every other consumer of this component).
   */
  readonly cameraReplacesInput = input<boolean>(true);
  /**
   * Final-review fix (Important 2): doc AC-8 requires the Left-Addon slot to fall away
   * completely — not just visually — when it is not configured. Additive `Input`, default
   * `true` so every existing consumer (e.g. Seller-Search) keeps its 🔍 addon unchanged; only
   * the price variant never renders it (it has no Left-Addon slot in the first place, see
   * Abschnitt 5). Set to `false` when a search-variant consumer needs the field without one.
   */
  readonly showLeftAddon = input<boolean>(true);
  /** Forwarded onto the variant's native input (search: `<input>`, price: `p-inputnumber`'s
   * internal input), so a parent `<label for="…">` can associate with the field (a11y —
   * `@angular-eslint/template/label-has-associated-control`). */
  readonly inputId = input<string | undefined>(undefined);

  readonly valueChange = output<string | number>();
  readonly submitted = output<void>();

  /**
   * Public, deliberately read-only surface (Round-16 Task 7 fix round 1, reviewer Important 2):
   * external code reads the current mode but can only change it through `switchMode()` — never
   * by writing the signal directly. Always starts at `'keyboard'` (doc Abschnitt 3
   * "Startmodus") — no device detection, no persistence.
   */
  private readonly _activeMode = signal<InputMode>('keyboard');
  readonly activeMode = this._activeMode.asReadonly();

  /** Same read-only-surface contract as `activeMode` above. */
  private readonly _rawValue = signal<string>('');
  readonly rawValue = this._rawValue.asReadonly();

  readonly priceValue = signal<number | null>(null);
  readonly cameraDenied = signal<boolean>(false);

  /**
   * The mode active immediately before the current/most-recent camera session — captured
   * synchronously inside `switchMode()` itself (Round-16 Task 7 fix round 1, reviewer
   * Important 3), not reconstructed afterwards from signal-change timing. Read via
   * `getPreviousMode()`.
   */
  private previousMode: InputMode = 'keyboard';

  private readonly keyboardTypedSearch = signal<string | undefined>(undefined);
  private readonly keyboardTypedPrice = signal<number | null | undefined>(undefined);
  private numpadDispatchInProgress = false;
  private permissionStatus: PermissionStatus | undefined;

  readonly visibleModes = computed<InputMode[]>(() => {
    const modes = this.modes();
    if (modes.length <= 1) return [];
    const active = this.activeMode();
    return MODE_ORDER.filter((mode) => mode !== active && modes.includes(mode));
  });

  constructor() {
    toObservable(this.keyboardTypedSearch)
      .pipe(
        filter((value): value is string => value !== undefined),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => this.valueChange.emit(value));

    toObservable(this.keyboardTypedPrice)
      .pipe(
        filter((value): value is number | null => value !== undefined),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => this.valueChange.emit(value ?? 0));

    // Doc Abschnitt 3 "Kamera nicht verfügbar oder Zugriff verweigert" — see class doc-comment
    // and the report's concern #4 for the reliability limits of this detection.
    effect(() => {
      if (this.activeMode() === 'camera') {
        this.cameraDenied.set(false);
        void this.checkCameraAccess();
      } else {
        this.teardownPermissionWatch();
      }
    });
  }

  iconForMode(mode: InputMode): string {
    switch (mode) {
      case 'keyboard':
        return 'pi pi-text';
      case 'camera':
        return 'pi pi-camera';
      case 'numpad':
        return 'pi pi-th-large';
    }
  }

  switchMode(mode: InputMode): void {
    if (mode === 'camera' && this._activeMode() !== 'camera') {
      this.previousMode = this._activeMode();
    }
    this._activeMode.set(mode);
  }

  /**
   * The mode active immediately before the current/most-recent switch into `'camera'` — doc's
   * "zuvor aktiver Modus" (Abschnitt 4 Escape, Abschnitt 6 "Mehrere" scan result). Defaults to
   * `'keyboard'` if camera was never entered yet.
   */
  getPreviousMode(): InputMode {
    return this.previousMode;
  }

  onTyped(value: string): void {
    this._rawValue.set(value);
    this.keyboardTypedSearch.set(value);
  }

  onPriceTyped(value: number | null): void {
    this.priceValue.set(value);
    if (this.numpadDispatchInProgress) {
      // Numpad-originated value change — discrete event, emits immediately (doc: numpad
      // events are not subject to the typing debounce).
      this.valueChange.emit(value ?? 0);
    } else {
      this.keyboardTypedPrice.set(value);
    }
  }

  onClear(): void {
    this._rawValue.set('');
    this.valueChange.emit('');
    this.searchInputRef()?.nativeElement.focus();
  }

  onCodeDetected(value: string): void {
    if (this.isNumericVariant()) {
      const parsed = this.parseGermanDecimal(value);
      this.priceValue.set(parsed);
      this.valueChange.emit(parsed ?? 0);
    } else {
      this._rawValue.set(value);
      this.valueChange.emit(value);
    }
    // A hit ends the standard scan (component doc: "Ausprägung je Verwendungsstelle" — this is
    // input-group's own default when it owns the camera view itself, i.e. `cameraReplacesInput`
    // is `true`). A consumer with `cameraReplacesInput=false` never triggers this method at all
    // (it renders its own scanner and calls `applyExternalValue()` instead), so it fully owns
    // the post-scan mode transition — see that method's own doc comment.
    this.switchMode('keyboard');
  }

  /**
   * Public write entry point for a parent that owns its own camera view instead of this
   * component's internal one (`cameraReplacesInput=false` — see that input's doc comment, e.g.
   * Seller-Search's component doc Abschnitt 6). Sets the field's value and emits `valueChange`
   * immediately, exactly like a normal internal scan (`onCodeDetected`) would — but, unlike
   * `onCodeDetected`, does NOT touch `activeMode`: the parent decides the post-scan mode
   * transition itself (it knows the scan's result count; this component does not).
   */
  applyExternalValue(value: string): void {
    if (this.isNumericVariant()) {
      const parsed = this.parseGermanDecimal(value);
      this.priceValue.set(parsed);
      this.valueChange.emit(parsed ?? 0);
    } else {
      this._rawValue.set(value);
      this.valueChange.emit(value);
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    const target = this.dispatchTarget();
    if (target) {
      target.focus();
      this.numpadDispatchInProgress = true;
      try {
        target.dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true }));
      } finally {
        this.numpadDispatchInProgress = false;
      }
    }

    if (this.variant() === 'search') {
      this.applyNumpadKeyToSearchValue(init.key);
    }
  }

  onNumpadClear(): void {
    if (this.isNumericVariant()) {
      // Review fix (Round-16 Task 4, fix round 1): do NOT emit `valueChange` here. `null`/empty
      // is "kein Wert eingegeben", which is not the same as a valid value of `0` — emitting `0`
      // would make the two indistinguishable for a later consumer (e.g. intake-wizard). The
      // field simply becomes empty; a real value is only emitted once one is actually entered
      // again (typed, scanned, or via the numpad). Applies identically to price and count.
      this.priceValue.set(null);
    } else {
      this._rawValue.set('');
      this.valueChange.emit('');
    }
  }

  onSubmit(): void {
    this.submitted.emit();
  }

  private dispatchTarget(): HTMLInputElement | undefined {
    if (this.isNumericVariant()) {
      return this.priceInputRef()?.input()?.nativeElement;
    }
    return this.searchInputRef()?.nativeElement;
  }

  /** Round-25 Task 6a: `price` and `count` are both "single numeric value, addon, numpad, no
   * clear/action button" shapes that share every non-template code path — see class doc-comment. */
  private isNumericVariant(): boolean {
    return this.variant() === 'price' || this.variant() === 'count';
  }

  private applyNumpadKeyToSearchValue(key: string | undefined): void {
    if (key === undefined) return;
    const current = this._rawValue();
    const next = key === 'Backspace' ? current.slice(0, -1) : current + key;
    this._rawValue.set(next);
    this.valueChange.emit(next);
  }

  private parseGermanDecimal(raw: string): number | null {
    const normalized = raw.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && normalized.length > 0 ? parsed : null;
  }

  /**
   * Best-effort approximation, not a definitive signal — see report concern #4.
   * `barcode-scanner` (Task 3) is a dumb component that never surfaces a `getUserMedia`
   * rejection by design, so this component cannot reliably distinguish "camera denied" from
   * "camera working, no code in view yet" without touching Task 3's final public API. Where
   * the Permissions API is available and supports querying `'camera'` (Chromium-based
   * browsers), this gives a real, immediate signal, including a live revoke while active. In
   * browsers without that support (e.g. Firefox), or without `navigator.mediaDevices` at all,
   * only the "no camera API present at all" case is caught — a genuinely denied prompt in
   * those browsers is NOT detected here, and `codeDetected` will simply never arrive.
   */
  private async checkCameraAccess(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.flagCameraDenied();
      return;
    }

    const permissions = navigator.permissions;
    if (!permissions?.query) {
      return;
    }

    try {
      const status = await permissions.query({ name: 'camera' as unknown as PermissionName });
      if (status.state === 'denied') {
        this.flagCameraDenied();
        return;
      }
      this.permissionStatus = status;
      status.onchange = () => {
        if (status.state === 'denied' && this.activeMode() === 'camera') {
          this.flagCameraDenied();
        }
      };
    } catch {
      // Permissions API present but querying 'camera' is unsupported/throws — same
      // documented limitation as the missing-API branch above.
    }
  }

  private flagCameraDenied(): void {
    this.cameraDenied.set(true);
    this._activeMode.set('keyboard');
  }

  private teardownPermissionWatch(): void {
    if (this.permissionStatus) {
      this.permissionStatus.onchange = null;
      this.permissionStatus = undefined;
    }
  }
}
