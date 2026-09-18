import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SellerSearch, SellerSummary } from '../../../../shared/components/seller-search/seller-search';
// Cross-feature import, read-only: `SellersApi.search('')` loads the full seller list for
// seller-search to filter in-memory. Sanctioned explicitly by Round-16 Task 7 brief ("Load the
// full seller list via SellersApi") — same precedent as `verkaeufer-dialog.ts`'s read-only
// `SellerTypesApi` import.
// eslint-disable-next-line boundaries/dependencies
import { SellersApi } from '../../../sellers/data/sellers-api';
import { IntakeWizard } from '../../components/intake-wizard/intake-wizard';

/**
 * Round-16 Task 7 wiring for Epic_Artikelannahme's entry point: search-for-seller, then hand
 * off to the intake wizard (Task 8's `IntakeWizard` — see the `'wizard'`-state branch below).
 */
type IntakeState = 'search' | 'wizard';

@Component({
  selector: 'app-intake-page',
  imports: [SellerSearch, IntakeWizard],
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
   * `IntakeWizard`'s `closed` output — fires on cancel (with or without a same-session delete)
   * and, in later rounds, on a completed Step 2 booking — so newly created/removed sellers are
   * reflected once we're back on the search view.
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
