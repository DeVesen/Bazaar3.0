import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { Input, InputAddon } from '../input/input';
import { FieldMode, FieldModeState, applyNumpadKey, fieldModeAddons } from '../input/field-mode';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Numpad } from '../numpad/numpad';

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
 * (docs/components/seller-search/component.md). Suchfeld ist ein `app-input` (Label „Verkäufer"
 * im Rahmen, Buttons bündig wie im Verkauf); Modus-Logik über `field-mode.ts`. Die Kamera
 * ersetzt die Trefferliste, nicht das Feld; der Nummernblock klappt unter dem Hinweis auf.
 */
@Component({
  selector: 'app-seller-search',
  imports: [CardModule, ButtonModule, ListboxModule, TagModule, Input, Numpad, BarcodeScanner],
  templateUrl: './seller-search.html',
  styleUrl: './seller-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSearch {
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  readonly sellers = input<SellerSummary[]>([]);
  readonly hint = input<string>('');
  readonly showCreateButton = input<boolean>(false);
  readonly showScanButton = input<boolean>(false);

  readonly sellerSelected = output<SellerSummary>();
  readonly createRequested = output<string>();
  /** Feuert bei jeder Änderung des Feldwerts (Tippen, Nummernblock, Scan, Löschen). */
  readonly searchChanged = output<string>();

  readonly mode = new FieldModeState();

  readonly modes = computed<FieldMode[]>(() =>
    this.showScanButton() ? ['keyboard', 'camera', 'numpad'] : ['keyboard', 'numpad'],
  );

  readonly inputAddons = computed<InputAddon[]>(() => fieldModeAddons(this.modes(), this.mode.active()));

  readonly searchText = signal('');

  readonly filteredSellers = computed<SellerSummary[]>(() => filterSellers(this.sellers(), this.searchText()));

  /** Inline hint shown after a blocked (settled-seller) selection attempt — doc's Epic AC-12 extension. */
  readonly blockedSelectionHint = signal<string | null>(null);

  /** ↓/↑ highlight index into `filteredSellers()` (doc Abschnitt 4 "Navigation in der Trefferliste"). */
  readonly highlightedIndex = signal<number>(-1);

  readonly isCameraActive = computed<boolean>(() => this.mode.active() === 'camera');

  constructor() {
    // Reset the highlight whenever the visible result set changes shape (new search text).
    effect(() => {
      this.filteredSellers();
      this.highlightedIndex.set(-1);
    });
  }

  onTyped(value: string): void {
    this.searchText.set(value);
    this.searchChanged.emit(value);
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
      case 'numpad':
        this.mode.toggle(key);
        return;
      case 'clear':
        this.clear();
        return;
      case 'enter':
        this.onSubmit();
        return;
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    this.onTyped(applyNumpadKey(this.searchText(), init));
  }

  onNumpadClear(): void {
    this.onTyped('');
  }

  /**
   * Doc Abschnitt 6 "Scan-Ablauf": Wert ins Feld, dann Moduswechsel nach Trefferzahl —
   * 1 Treffer: auswählen + Tastatur; mehrere: zurück zum vorherigen Modus; 0: Kamera bleibt.
   */
  onScanDetected(value: string): void {
    this.onTyped(value);

    const results = this.filteredSellers();
    if (results.length === 1) {
      this.trySelect(results[0]);
      this.mode.switchTo('keyboard');
    } else if (results.length > 1) {
      this.mode.switchTo(this.mode.previousMode());
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
    if (this.mode.active() === 'camera') {
      this.mode.switchTo(this.mode.previousMode());
    } else {
      this.clear();
    }
  }

  private clear(): void {
    this.onTyped('');
    this.blockedSelectionHint.set(null);
    // app-input hat kein öffentliches focus() — gleiches Host-querySelector-Muster wie scan-dialog.ts.
    queueMicrotask(() => this.hostElement.nativeElement.querySelector<HTMLInputElement>('input')?.focus());
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
