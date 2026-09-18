import { ChangeDetectionStrategy, Component, computed, effect, output, input, signal, viewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { InputGroup, InputMode } from '../input-group/input-group';

/**
 * Shape the search-result list is filtered/rendered over
 * (docs/components/seller-search/component.md Abschnitt 2, extended per Round-16 Task 7's
 * controller ruling on Epic_Artikelannahme AC-12 with `settledAt` — the doc's own
 * `SellerSummary` predates that requirement).
 */
export interface SellerSummary {
  id: string;
  firstName: string;
  lastName: string;
  zip: string;
  city: string;
  settledAt: string | null;
}

/**
 * Shared cross-app entry point for "find one seller, then continue" flows
 * (docs/components/seller-search/component.md). Composes `app-input-group` for the search
 * field itself with a `p-listbox` result list / camera-view swap that this component owns.
 *
 * Design note on tracking `input-group`'s active mode (Round-16 Task 7 brief's central
 * question): `InputGroup.activeMode` (and `.rawValue`/`.onClear()`) are already plain public
 * class members in the merged Task 4 component — not marked `private`, not wrapped behind any
 * `@Input`/`@Output`. Reading (and, for the camera-mode override below, writing) them via a
 * `viewChild<InputGroup>()` reference therefore needs NO change to `input-group.ts` at all;
 * that file is untouched by this task. See the two effects below and `onValueChange` for the
 * exact mechanics.
 */
@Component({
  selector: 'app-seller-search',
  imports: [CardModule, ButtonModule, ListboxModule, TagModule, InputGroup],
  templateUrl: './seller-search.html',
  styleUrl: './seller-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSearch {
  readonly sellers = input<SellerSummary[]>([]);
  readonly hint = input<string>('');
  readonly showCreateButton = input<boolean>(false);
  readonly showScanButton = input<boolean>(false);

  readonly sellerSelected = output<SellerSummary>();
  readonly createRequested = output<string>();
  readonly searchChanged = output<string>();

  private readonly inputGroupRef = viewChild<InputGroup>('inputGroup');

  readonly modes = computed<InputMode[]>(() =>
    this.showScanButton() ? ['keyboard', 'camera', 'numpad'] : ['keyboard', 'numpad'],
  );

  /**
   * Live search text — read directly off `input-group`'s own `rawValue` signal rather than its
   * debounced `valueChange` output, so the result list (and Enter/Arrow behavior) always reacts
   * to what is currently in the field, per doc Abschnitt 3 ("Filterung erfolgt in der
   * Komponente"). The debounced `valueChange` is only forwarded to this component's own
   * `searchChanged` output, matching that output's doc description ("für optionales
   * Parent-Tracking").
   */
  readonly searchText = computed<string>(() => this.inputGroupRef()?.rawValue() ?? '');

  readonly filteredSellers = computed<SellerSummary[]>(() => filterSellers(this.sellers(), this.searchText()));

  /** Inline hint shown after a blocked (settled-seller) selection attempt — doc's Epic AC-12 extension. */
  readonly blockedSelectionHint = signal<string | null>(null);

  /** ↓/↑ highlight index into `filteredSellers()` (doc Abschnitt 4 "Navigation in der Trefferliste"). */
  readonly highlightedIndex = signal<number>(-1);

  /** The mode `input-group` was in immediately before switching to camera — restored on Escape/multi-hit-after-scan. */
  private readonly lastNonCameraMode = signal<InputMode>('keyboard');

  readonly isCameraActive = computed<boolean>(() => this.inputGroupRef()?.activeMode() === 'camera');

  constructor() {
    // Tracks the last non-camera mode so Escape-in-camera and "multiple hits after a scan" can
    // restore the mode the user was actually in before switching to the camera — instead of
    // relying on input-group's own post-scan default of always resetting to keyboard.
    effect(() => {
      const mode = this.inputGroupRef()?.activeMode();
      if (mode && mode !== 'camera') {
        this.lastNonCameraMode.set(mode);
      }
    });

    // Reset the highlight whenever the visible result set changes shape (new search text).
    effect(() => {
      this.filteredSellers();
      this.highlightedIndex.set(-1);
    });
  }

  /**
   * Fires for every `input-group` `valueChange` — keyboard-typed (debounced), scanned, or
   * numpad-typed (immediate). Forwards to `searchChanged` unconditionally, then applies the
   * scan-specific result-count rules from doc Abschnitt 6 ("Scan-Ablauf") only when the value
   * actually came from a scan.
   *
   * Detecting "came from a scan": `input-group.onCodeDetected()` sets `rawValue`, emits
   * `valueChange` (this handler runs synchronously inside that emit), and only THEN sets
   * `activeMode` back to `'keyboard'`. So at the moment this handler runs, `activeMode()` still
   * reads `'camera'` for a scan-originated value and never does for a typed/numpad one.
   */
  onValueChange(value: string | number): void {
    const text = String(value);
    this.searchChanged.emit(text);

    const cameFromScan = this.inputGroupRef()?.activeMode() === 'camera';
    if (!cameFromScan) {
      return;
    }

    const results = filterSellers(this.sellers(), text);
    if (results.length === 1) {
      // input-group itself already stops the camera (sets activeMode back to 'keyboard') right
      // after this handler returns — matches doc's "Kamera stoppt".
      this.trySelect(results[0]);
    } else if (results.length > 1) {
      // Multiple hits: camera stops, return to the mode active before camera — deferred past
      // input-group's own synchronous keyboard-reset so this override actually sticks.
      queueMicrotask(() => this.inputGroupRef()?.activeMode.set(this.lastNonCameraMode()));
    } else {
      // 0 hits: value stays visible, camera stays active — override input-group's default of
      // resetting to keyboard after every scan.
      queueMicrotask(() => this.inputGroupRef()?.activeMode.set('camera'));
    }
  }

  onSubmit(): void {
    const results = this.filteredSellers();
    if (results.length === 1) {
      this.trySelect(results[0]);
    } else if (results.length === 0 && this.showCreateButton()) {
      this.createRequested.emit(this.searchText());
    }
    // > 1 result: no action (doc Abschnitt 4).
  }

  onListboxChange(event: { value: SellerSummary }): void {
    this.trySelect(event.value);
  }

  onCreateClick(): void {
    this.createRequested.emit(this.searchText());
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.onSubmit();
        break;
      case 'Escape':
        event.preventDefault();
        this.onEscape();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
    }
  }

  private moveHighlight(delta: number): void {
    const count = this.filteredSellers().length;
    if (count === 0) return;
    const next = this.highlightedIndex() + delta;
    this.highlightedIndex.set(Math.min(Math.max(next, 0), count - 1));
  }

  private onEscape(): void {
    const inputGroup = this.inputGroupRef();
    if (!inputGroup) return;

    if (inputGroup.activeMode() === 'camera') {
      inputGroup.activeMode.set(this.lastNonCameraMode());
    } else {
      inputGroup.onClear();
      this.blockedSelectionHint.set(null);
    }
  }

  private trySelect(seller: SellerSummary): void {
    if (seller.settledAt !== null) {
      this.blockedSelectionHint.set(
        `${seller.firstName} ${seller.lastName} ist bereits abgerechnet — ein Admin muss die Abrechnung zuerst stornieren.`,
      );
      return;
    }
    this.blockedSelectionHint.set(null);
    this.sellerSelected.emit(seller);
  }
}

function filterSellers(sellers: SellerSummary[], query: string): SellerSummary[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return sellers;
  }
  return sellers.filter(
    (s) =>
      s.id.toLowerCase().includes(q) ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q),
  );
}
