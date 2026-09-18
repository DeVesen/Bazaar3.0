import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
// Cross-feature import, read-only: `SellersApi.create()`/`SellersApi.remove()` — same pattern
// `verkaeufer-dialog.ts`/`intake-page.ts` already use for the sellers feature's public API.
// eslint-disable-next-line boundaries/dependencies
import { CreateSellerRequest, SellersApi } from '../../../sellers/data/sellers-api';
// Cross-feature import, read-only: `SellerTypesApi.getAll()` populates the type dropdown —
// same pattern `verkaeufer-dialog.ts` uses.
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { IntakeStepTwoPlaceholder } from '../intake-step-two-placeholder/intake-step-two-placeholder';

type WizardStep = 'step1' | 'step2';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** AC-4 / seller-search's own "+ Neu anlegen" contract: split on the FIRST space only. */
function splitPendingSearchText(text: string): { firstName: string; lastName: string } {
  const spaceIndex = text.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: text, lastName: '' };
  }
  return { firstName: text.slice(0, spaceIndex), lastName: text.slice(spaceIndex + 1) };
}

/**
 * Wizard shell for Epic_Artikelannahme Abschnitt 2 (Round-16 Task 8) — two tabs, "Schritt 1 —
 * Verkäufer" (seller creation form, ANNAHME-S02) and "Schritt 2 — Artikelannahme" (placeholder
 * this round, real form in a later round).
 *
 * Exactly one of `sellerId` (an existing seller resolved by search — skip straight to Step 2)
 * or `pendingSearchText` (the create-flow's typed text, pre-fills Step 1's name split) is
 * non-null at a time, per `intake-page`'s own state machine.
 */
@Component({
  selector: 'app-intake-wizard',
  imports: [
    FormsModule,
    TabsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    AutoFocusModule,
    IntakeStepTwoPlaceholder,
  ],
  templateUrl: './intake-wizard.html',
  styleUrl: './intake-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeWizard {
  private readonly sellersApi = inject(SellersApi);
  private readonly sellerTypesApi = inject(SellerTypesApi);

  readonly sellerId = input<string | null>(null);
  readonly pendingSearchText = input<string | null>(null);

  readonly closed = output<void>();

  readonly activeStep = signal<WizardStep>('step1');
  /** The seller id Step 2 renders for — either the resolved `sellerId` Input, or the id returned by `create()`. */
  readonly step2SellerId = signal<string | null>(null);
  /**
   * Tracks whether THIS wizard instance created the seller (Epic AC-11's cancel-deletes-seller
   * exception applies only then — never for a `sellerId` handed in as an Input, since there is
   * nothing to undo there).
   */
  readonly createdInThisSession = signal(false);

  readonly sellerTypesList = signal<SellerType[]>([]);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  readonly feePerItem = signal(0);
  readonly salesCommission = signal(0);

  readonly saving = signal(false);
  readonly createError = signal<string | null>(null);
  readonly emailFormatError = signal<string | null>(null);

  /**
   * Final-review fix (Important 1): fixed `false`, no longer `computed(() => this.isAdmin())`.
   * `CreateSellerRequest` deliberately has no fee/commission fields (see `onNext()`'s own doc
   * comment) — the server always derives both from `sellerTypeId` on creation. Letting an admin
   * type a value into these fields here would silently discard it on "Weiter", with no error and
   * no indication anything was dropped. The admin override this field name still hints at does
   * NOT happen in the intake wizard: it lives exclusively in the existing Verkäufer-Bearbeiten
   * dialog (`Epic_Verkaeufer` / `verkaeufer-dialog.ts`, whose own `conditionsEditable` computed
   * from `isAdmin()` is correct there because that dialog's update request DOES carry the edited
   * fee/commission back to the server), per Epic_Artikelannahme Abschnitt 2. The fields stay
   * `[disabled]` unconditionally here, independent of role.
   */
  readonly conditionsEditable = computed(() => false);

  readonly canSave = computed(
    () =>
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      this.email().trim().length > 0 &&
      this.sellerTypeId().length > 0 &&
      !this.saving(),
  );

  readonly canGoToStep2 = computed(() => this.step2SellerId() !== null);
  /**
   * Fix round 1 (review finding): once a seller exists for this session — either created via
   * "Weiter" or resolved via the `sellerId` Input — Step 1 must no longer be reachable. Clicking
   * back into it with the form still filled and hitting "Weiter" again would call `create()` a
   * second time, orphaning the first seller with no Cancel path back to it (Cancel only ever
   * targets `step2SellerId()`, i.e. the most recent one).
   */
  readonly canGoToStep1 = computed(() => this.step2SellerId() === null);

  constructor() {
    this.sellerTypesApi.getAll().subscribe((types) => {
      this.sellerTypesList.set(types);
      // Only apply the default when nothing has been selected yet — the one-time init effect
      // below may have already run (order between the two is not guaranteed), and a resolved
      // `sellerId` path never needs a type at all.
      if (this.sellerTypeId().length === 0 && this.step2SellerId() === null) {
        const defaultType = this.defaultTypeForCreate(types);
        this.sellerTypeId.set(defaultType?.id ?? '');
        this.feePerItem.set(defaultType?.itemFee ?? 0);
        this.salesCommission.set(defaultType?.commissionRate ?? 0);
      }
    });

    // One-time init from the Inputs (contractually set once, per intake-page's state machine —
    // this still reacts correctly if either ever changed, since both are read here).
    effect(() => {
      const resolvedId = this.sellerId();
      const pending = this.pendingSearchText();

      if (resolvedId) {
        this.step2SellerId.set(resolvedId);
        this.createdInThisSession.set(false);
        this.activeStep.set('step2');
        return;
      }

      if (pending) {
        const { firstName, lastName } = splitPendingSearchText(pending);
        this.firstName.set(firstName);
        this.lastName.set(lastName);
        this.activeStep.set('step1');
      }
    });
  }

  /** Type with the highest `sellerCount`; first one encountered wins a tie — identical to `verkaeufer-dialog.ts`'s `defaultTypeForCreate()`. */
  private defaultTypeForCreate(types: SellerType[]): SellerType | null {
    if (types.length === 0) return null;
    return types.reduce((best, current) => (current.sellerCount > best.sellerCount ? current : best));
  }

  onTypeChange(newTypeId: string): void {
    const newType = this.sellerTypesList().find((t) => t.id === newTypeId) ?? null;
    this.sellerTypeId.set(newTypeId);
    this.feePerItem.set(newType?.itemFee ?? 0);
    this.salesCommission.set(newType?.commissionRate ?? 0);
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined) return;
    if (value === 'step2' && !this.canGoToStep2()) return;
    if (value === 'step1' && !this.canGoToStep1()) return;
    this.activeStep.set(value as WizardStep);
  }

  onNext(): void {
    // Defense in depth #1 (fix round 1, review finding): a seller was already created (or
    // resolved) for this wizard session — a second `create()` would orphan the first one with
    // no cancel-path back to it. The Step-1 tab's `[disabled]` binding is the primary guard
    // (defense in depth #2); this check covers any path that could still reach `onNext()`
    // (e.g. a stale reference, a re-enabled tab via a future change) regardless of the template.
    if (this.step2SellerId() !== null) return;
    if (!this.canSave()) return;

    const email = this.email().trim();
    if (!EMAIL_PATTERN.test(email)) {
      this.emailFormatError.set('Ungültiges E-Mail-Format.');
      return;
    }
    this.emailFormatError.set(null);
    this.createError.set(null);
    this.saving.set(true);

    // `CreateSellerRequest` deliberately has no fee/commission fields — the server derives them
    // from `sellerTypeId` on creation (see that interface's own doc comment).
    const request: CreateSellerRequest = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email,
      sellerTypeId: this.sellerTypeId(),
      address: this.address().trim() || null,
      postalCode: this.postalCode().trim() || null,
      city: this.city().trim() || null,
      phone: this.phone().trim() || null,
    };

    this.sellersApi.create(request).subscribe({
      next: (seller) => {
        this.saving.set(false);
        this.step2SellerId.set(seller.id);
        this.createdInThisSession.set(true);
        this.activeStep.set('step2');
      },
      error: () => {
        // AC-9: keep all field values exactly as entered, show an error, stay on Step 1.
        this.saving.set(false);
        this.createError.set('Verkäufer konnte nicht angelegt werden. Bitte erneut versuchen.');
      },
    });
  }

  /**
   * Epic AC-11's cancel/delete exception, "auch für Kassenpersonal" — no role gate, unlike every
   * other delete-is-admin rule in the app. No confirm dialog: the seller was just created in
   * this very session and has no articles/data yet (`DELETE` only succeeds under that same
   * condition), so a confirm would only add a click, not real protection — unlike
   * `verkaeufer-dialog`'s admin delete, which removes a seller that may carry history.
   */
  onCancel(): void {
    if (this.createdInThisSession() && this.step2SellerId()) {
      this.sellersApi.remove(this.step2SellerId()!).subscribe({
        next: () => this.closed.emit(),
        // Even if the (already unlikely, since nothing else touched this brand-new seller in
        // the meantime) delete fails server-side, the wizard still closes — staying open would
        // strand Kassenpersonal on a dead-end screen with no retry affordance for a low-stakes
        // cleanup of their own just-created record.
        error: () => this.closed.emit(),
      });
      return;
    }
    this.closed.emit();
  }
}
