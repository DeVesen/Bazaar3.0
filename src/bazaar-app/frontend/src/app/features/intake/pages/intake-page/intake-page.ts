import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SellerSearch, SellerSummary } from '../../../../shared/components/seller-search/seller-search';
// Cross-feature import, read-only: `SellersApi.search('')` loads the full seller list for
// seller-search to filter in-memory. Sanctioned explicitly by Round-16 Task 7 brief ("Load the
// full seller list via SellersApi") — same precedent as `verkaeufer-dialog.ts`'s read-only
// `SellerTypesApi` import.
// eslint-disable-next-line boundaries/dependencies
import { SellersApi } from '../../../sellers/data/sellers-api';

/**
 * Round-16 Task 7 wiring for Epic_Artikelannahme's entry point: search-for-seller, then hand
 * off to the intake wizard (not built yet, Task 8 — see the `'wizard'`-state branch below).
 */
type IntakeState = 'search' | 'wizard';

@Component({
  selector: 'app-intake-page',
  imports: [SellerSearch],
  templateUrl: './intake-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakePage implements OnInit {
  private readonly sellersApi = inject(SellersApi);

  readonly state = signal<IntakeState>('search');
  readonly resolvedSellerId = signal<string | null>(null);
  readonly pendingSearchText = signal<string | null>(null);

  readonly sellers = signal<SellerSummary[]>([]);

  /**
   * Hinweistext (spec.md, exact wording) — the Artikelannahme search view never sets
   * `showScanButton` (spec.md's explicit call-out that neither Epic_Artikelannahme Abschnitt 1
   * nor round.md require camera search here).
   */
  readonly hint = 'ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint';

  ngOnInit(): void {
    this.loadSellers();
  }

  onSellerSelected(seller: SellerSummary): void {
    this.resolvedSellerId.set(seller.id);
    this.pendingSearchText.set(null);
    this.state.set('wizard');
  }

  onCreateRequested(searchText: string): void {
    this.resolvedSellerId.set(null);
    this.pendingSearchText.set(searchText);
    this.state.set('wizard');
  }

  /**
   * Task 8's `intake-wizard` will call this (or an equivalent) on cancel/complete so that
   * newly created/removed sellers are reflected once the wizard-state branch below is replaced
   * with the real `<app-intake-wizard>` — see that branch's own comment.
   */
  onWizardClosed(): void {
    this.resolvedSellerId.set(null);
    this.pendingSearchText.set(null);
    this.state.set('search');
    this.loadSellers();
  }

  private loadSellers(): void {
    this.sellersApi.search('').subscribe((results) => {
      this.sellers.set(
        results.map((r) => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          zip: '',
          city: r.city ?? '',
          settledAt: r.settledAt,
        })),
      );
    });
  }
}
