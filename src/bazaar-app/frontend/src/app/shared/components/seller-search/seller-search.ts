import { ChangeDetectionStrategy, Component, computed, effect, output, input, signal, viewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { InputGroup, InputMode } from '../input-group/input-group';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';

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
 * field itself with a `p-listbox` result list / own `app-barcode-scanner` camera view that this
 * component owns and positions itself.
 *
 * Design note on tracking/driving `input-group`'s active mode (Round-16 Task 7 brief's central
 * question, revisited in fix round 1 after code review): rather than reaching into
 * `input-group`'s internal signals via a `viewChild` reference (the original Task 7 approach,
 * flagged as an encapsulation break), this component now drives `input-group` entirely through
 * its deliberate public API, added additively in fix round 1:
 * - `[cameraReplacesInput]="false"` — tells `input-group` NOT to swap its own `<input>` for an
 *   internal `app-barcode-scanner` in camera mode. Seller-search renders its OWN
 *   `app-barcode-scanner` in place of the result list instead (this component's own override of
 *   input-group's "camera replaces the input field" default, per input-group's doc Abschnitt 3
 *   note about Seller-Search) — the search field itself stays visible and usable throughout,
 *   exactly as AC-5 requires.
 * - `activeMode()` (read-only signal) / `switchMode(mode)` (the one sanctioned way to change it)
 *   / `getPreviousMode()` (the mode active immediately before the current camera session,
 *   tracked synchronously by input-group itself) / `applyExternalValue(value)` (pushes a scanned
 *   value into the field and emits `valueChange`, without input-group touching the mode itself).
 * This makes the whole flow deterministic and synchronous — no more inferring "did this value
 * come from a scan" from signal-write ordering, and no more `queueMicrotask` overrides racing
 * input-group's own effects.
 */
@Component({
  selector: 'app-seller-search',
  imports: [CardModule, ButtonModule, ListboxModule, TagModule, InputGroup, BarcodeScanner],
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
   * Live search text — read directly off `input-group`'s own (public, read-only) `rawValue`
   * signal rather than its debounced `valueChange` output, so the result list (and Enter/Arrow
   * behavior) always reacts to what is currently in the field, per doc Abschnitt 3 ("Filterung
   * erfolgt in der Komponente"). The debounced `valueChange` is only forwarded to this
   * component's own `searchChanged` output, matching that output's doc description ("für
   * optionales Parent-Tracking").
   */
  readonly searchText = computed<string>(() => this.inputGroupRef()?.rawValue() ?? '');

  readonly filteredSellers = computed<SellerSummary[]>(() => filterSellers(this.sellers(), this.searchText()));

  /** Inline hint shown after a blocked (settled-seller) selection attempt — doc's Epic AC-12 extension. */
  readonly blockedSelectionHint = signal<string | null>(null);

  /** ↓/↑ highlight index into `filteredSellers()` (doc Abschnitt 4 "Navigation in der Trefferliste"). */
  readonly highlightedIndex = signal<number>(-1);

  readonly isCameraActive = computed<boolean>(() => this.inputGroupRef()?.activeMode() === 'camera');

  constructor() {
    // Reset the highlight whenever the visible result set changes shape (new search text).
    effect(() => {
      this.filteredSellers();
      this.highlightedIndex.set(-1);
    });
  }

  /** Fires for every `input-group` `valueChange` from typing/numpad — scans never go through this (see `onScanDetected`). */
  onValueChange(value: string | number): void {
    this.searchChanged.emit(String(value));
  }

  /**
   * Fires from this component's OWN `app-barcode-scanner` (rendered in place of the result
   * list while `isCameraActive()`, see the template) — never from inside `input-group`, since
   * `cameraReplacesInput=false` means input-group renders no internal scanner of its own. Doc
   * Abschnitt 6 "Scan-Ablauf": pushes the value into the field via `applyExternalValue()`, then
   * decides the post-scan mode transition itself, synchronously, based on the resulting match
   * count — no timing assumptions, no microtask.
   */
  onScanDetected(value: string): void {
    const inputGroup = this.inputGroupRef();
    if (!inputGroup) return;

    inputGroup.applyExternalValue(value);
    this.searchChanged.emit(value);

    const results = this.filteredSellers();
    if (results.length === 1) {
      this.trySelect(results[0]);
      inputGroup.switchMode('keyboard');
    } else if (results.length > 1) {
      inputGroup.switchMode(inputGroup.getPreviousMode());
    }
    // 0 results: value stays visible, camera stays active — no mode change needed since
    // input-group never left camera mode on its own in this configuration.
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
      inputGroup.switchMode(inputGroup.getPreviousMode());
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
