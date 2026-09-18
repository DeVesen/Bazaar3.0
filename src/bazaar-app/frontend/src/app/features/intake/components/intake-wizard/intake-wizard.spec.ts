import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RoleService } from '../../../../core/auth/role.service';
// eslint-disable-next-line boundaries/dependencies
import { ArticlesApi } from '../../../articles/data/articles-api';
// eslint-disable-next-line boundaries/dependencies
import { CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { BrandsApi } from '../../../brands/data/brands-api';
import { IntakeArticleEntry } from '../intake-article-entry/intake-article-entry';

// `p-tabs`'s `TabList` observes its own size via `ResizeObserver` (for the scrollable-tabs
// nav buttons) — unavailable in jsdom. Same kind of environment stub `intake-page.spec.ts`
// already does for `navigator.mediaDevices`/`BarcodeScanner`.
class ResizeObserverStub {
  observe(): void {
    // no-op: not exercised by these tests, only needed so PrimeNG's TabList doesn't throw.
  }
  unobserve(): void {
    // no-op, see observe().
  }
  disconnect(): void {
    // no-op, see observe().
  }
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;

// eslint-disable-next-line boundaries/dependencies -- see intake-wizard.ts's own justification
import { Seller, SellersApi } from '../../../sellers/data/sellers-api';
// eslint-disable-next-line boundaries/dependencies -- see intake-wizard.ts's own justification
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { IntakeWizard } from './intake-wizard';

const SELLER_TYPES: SellerType[] = [
  { id: 'type-privat', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 5 },
  { id: 'type-gewerblich', name: 'Gewerblich', commissionRate: 15, itemFee: 1, sellerCount: 2 },
];

function createdSeller(overrides: Partial<Seller> = {}): Seller {
  return {
    id: 'SEL00099',
    firstName: 'Max',
    lastName: 'Mustermann',
    address: null,
    postalCode: null,
    city: null,
    phone: null,
    email: 'max@example.com',
    sellerTypeId: 'type-privat',
    salesCommission: 10,
    feePerItem: 0.5,
    status: 'open',
    articleCount: 0,
    releasedCount: 0,
    soldCount: 0,
    returnedCount: 0,
    acceptedValue: 0,
    openValue: 0,
    revenue: 0,
    settledAt: null,
    ...overrides,
  };
}

async function setup(options: {
  isAdmin?: boolean;
  sellerId?: string | null;
  pendingSearchText?: string | null;
  createResult?: Seller;
  createError?: unknown;
} = {}) {
  const isAdminSignal = signal(options.isAdmin ?? false);
  const create = vi.fn().mockReturnValue(
    options.createError !== undefined
      ? throwError(() => options.createError)
      : of(options.createResult ?? createdSeller()),
  );
  const remove = vi.fn().mockReturnValue(of(undefined));
  // Step 2 now renders the real `intake-article-entry` (Round-17 Task 6), which needs its own
  // dependencies stubbed so mounting it doesn't make real HTTP calls in these Step-1-focused
  // tests — see `intake-article-entry.spec.ts` for the component's own dedicated test coverage.
  const getById = vi.fn().mockReturnValue(of({ feePerItem: 0.5 }));

  await TestBed.configureTestingModule({
    imports: [IntakeWizard],
    providers: [
      { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
      { provide: SellerTypesApi, useValue: { getAll: () => of(SELLER_TYPES) } },
      { provide: SellersApi, useValue: { create, remove, getById } },
      {
        provide: ArticlesApi,
        useValue: {
          getNextNumber: () => of({ nextNumber: 1 }),
          getByNumber: () => throwError(() => new HttpErrorResponse({ status: 404 })),
        },
      },
      { provide: CategoriesApi, useValue: { getAll: () => of([]) } },
      { provide: BrandsApi, useValue: { getAll: () => of([]) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeWizard);
  if (options.sellerId !== undefined) {
    fixture.componentRef.setInput('sellerId', options.sellerId);
  }
  if (options.pendingSearchText !== undefined) {
    fixture.componentRef.setInput('pendingSearchText', options.pendingSearchText);
  }
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, isAdminSignal, create, remove };
}

describe('IntakeWizard', () => {
  it('renders both tabs with the exact labels', async () => {
    const { fixture } = await setup();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Schritt 1 — Verkäufer');
    expect(text).toContain('Schritt 2 — Artikelannahme');
  });

  it('skips straight to Step 2 with the resolved sellerId, passed through to intake-article-entry', async () => {
    const { fixture } = await setup({ sellerId: 'SEL00001' });

    expect(fixture.componentInstance.activeStep()).toBe('step2');
    expect(fixture.componentInstance.step2SellerId()).toBe('SEL00001');
    const articleEntry = fixture.debugElement.query(By.directive(IntakeArticleEntry))
      .componentInstance as IntakeArticleEntry;
    expect(articleEntry.sellerId()).toBe('SEL00001');
  });

  it('wires intake-article-entry\'s booked output to the wizard\'s closed output (Round-17 Task 7 hand-off)', async () => {
    const { fixture } = await setup({ sellerId: 'SEL00001' });
    const closedSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closedSpy);

    const articleEntry = fixture.debugElement.query(By.directive(IntakeArticleEntry))
      .componentInstance as IntakeArticleEntry;
    articleEntry.booked.emit();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('starts on Step 1 and pre-splits pendingSearchText on the first space into Vorname/Nachname', async () => {
    const { fixture } = await setup({ pendingSearchText: 'Anna Maria Meier' });

    expect(fixture.componentInstance.activeStep()).toBe('step1');
    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.componentInstance.lastName()).toBe('Maria Meier');
  });

  it('puts the whole text into Vorname with an empty Nachname when there is no space', async () => {
    const { fixture } = await setup({ pendingSearchText: 'Einzelname' });

    expect(fixture.componentInstance.firstName()).toBe('Einzelname');
    expect(fixture.componentInstance.lastName()).toBe('');
  });

  it('gates "Weiter" on all four required fields', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    // sellerTypeId already defaulted by the SellerTypesApi.getAll() response — clear it to
    // exercise the "all four empty" starting point AC-5 describes.
    component.sellerTypeId.set('');
    expect(component.canSave()).toBe(false);

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    expect(component.canSave()).toBe(false);

    component.email.set('max@example.com');
    expect(component.canSave()).toBe(false);

    component.sellerTypeId.set('type-privat');
    expect(component.canSave()).toBe(true);
  });

  it('defaults the seller type to the one with the highest sellerCount', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    expect(component.sellerTypeId()).toBe('type-privat');
    expect(component.feePerItem()).toBe(0.5);
    expect(component.salesCommission()).toBe(10);
  });

  it('updates fee/commission when the type changes', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    component.onTypeChange('type-gewerblich');

    expect(component.sellerTypeId()).toBe('type-gewerblich');
    expect(component.feePerItem()).toBe(1);
    expect(component.salesCommission()).toBe(15);
  });

  // Final-review fix (Important 1): the intake wizard never lets ANY role hand-edit the derived
  // fee/commission fields — `CreateSellerRequest` has no fee/commission fields at all, so a
  // typed-in value would silently be dropped on "Weiter". The admin override still exists, just
  // not here — it lives in the existing Verkäufer-Bearbeiten dialog (`verkaeufer-dialog.ts`),
  // whose update request DOES carry the edited values back to the server.
  it('keeps the fee/commission fields read-only for both a non-admin and an admin (conditions are never editable in the intake wizard)', async () => {
    const nonAdmin = await setup({ isAdmin: false });
    expect(nonAdmin.fixture.componentInstance.conditionsEditable()).toBe(false);

    TestBed.resetTestingModule();
    const admin = await setup({ isAdmin: true });
    expect(admin.fixture.componentInstance.conditionsEditable()).toBe(false);
  });

  it('renders the fee/commission inputs as disabled in the DOM even for an admin', async () => {
    const { fixture } = await setup({ isAdmin: true });
    const feeInput = (fixture.nativeElement as HTMLElement).querySelector(
      '#intake-wizard-fee-per-item',
    ) as HTMLInputElement | null;
    const commissionInput = (fixture.nativeElement as HTMLElement).querySelector(
      '#intake-wizard-sales-commission',
    ) as HTMLInputElement | null;

    expect(feeInput).toBeTruthy();
    expect(commissionInput).toBeTruthy();
    expect(feeInput?.disabled).toBe(true);
    expect(commissionInput?.disabled).toBe(true);
  });

  it('still lets a non-admin freely change the type itself (only manual fee/commission edits are blocked)', async () => {
    const { fixture } = await setup({ isAdmin: false });
    const component = fixture.componentInstance;

    component.onTypeChange('type-gewerblich');

    expect(component.sellerTypeId()).toBe('type-gewerblich');
    expect(component.feePerItem()).toBe(1);
    expect(component.salesCommission()).toBe(15);
  });

  it('on success: calls SellersApi.create() with the right payload (no fee/commission) and switches to Step 2 with the new id', async () => {
    const { fixture, create } = await setup({ createResult: createdSeller({ id: 'SEL00099' }) });
    const component = fixture.componentInstance;

    component.firstName.set(' Max ');
    component.lastName.set(' Mustermann ');
    component.email.set(' max@example.com ');
    component.address.set('  ');
    component.postalCode.set('');
    component.city.set('');
    component.phone.set('');

    component.onNext();

    expect(create).toHaveBeenCalledWith({
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      sellerTypeId: 'type-privat',
      address: null,
      postalCode: null,
      city: null,
      phone: null,
    });
    expect(component.step2SellerId()).toBe('SEL00099');
    expect(component.createdInThisSession()).toBe(true);
    expect(component.activeStep()).toBe('step2');
  });

  it('fix round 1: disables the Step-1 tab once a seller exists for this session (created or resolved)', async () => {
    const created = await setup({ createResult: createdSeller({ id: 'SEL00099' }) });
    expect(created.fixture.componentInstance.canGoToStep1()).toBe(true);

    created.fixture.componentInstance.firstName.set('Max');
    created.fixture.componentInstance.lastName.set('Mustermann');
    created.fixture.componentInstance.email.set('max@example.com');
    created.fixture.componentInstance.onNext();

    expect(created.fixture.componentInstance.canGoToStep1()).toBe(false);

    TestBed.resetTestingModule();
    const resolved = await setup({ sellerId: 'SEL00001' });
    expect(resolved.fixture.componentInstance.canGoToStep1()).toBe(false);
  });

  it('fix round 1: a second "Weiter" click after a successful creation is a no-op — no second create() call, no orphaned duplicate', async () => {
    const { fixture, create } = await setup({ createResult: createdSeller({ id: 'SEL00099' }) });
    const component = fixture.componentInstance;

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');
    component.onNext();
    expect(create).toHaveBeenCalledTimes(1);
    expect(component.step2SellerId()).toBe('SEL00099');

    // Simulate the tab somehow still being reachable (e.g. a future regression re-enabling it)
    // and the user clicking "Weiter" again with the (still-filled) form.
    component.onNext();

    expect(create).toHaveBeenCalledTimes(1);
    expect(component.step2SellerId()).toBe('SEL00099');
  });

  it('fix round 1: onTabChange ignores a manual attempt to switch back to Step 1 once a seller exists for this session', async () => {
    const { fixture } = await setup({ createResult: createdSeller({ id: 'SEL00099' }) });
    const component = fixture.componentInstance;

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');
    component.onNext();
    expect(component.activeStep()).toBe('step2');

    component.onTabChange('step1');

    expect(component.activeStep()).toBe('step2');
  });

  it('on failure: keeps field values, shows an error, and stays on Step 1', async () => {
    const { fixture } = await setup({ createError: new Error('boom') });
    const component = fixture.componentInstance;

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');

    component.onNext();

    expect(component.activeStep()).toBe('step1');
    expect(component.createError()).toBeTruthy();
    expect(component.firstName()).toBe('Max');
    expect(component.lastName()).toBe('Mustermann');
    expect(component.email()).toBe('max@example.com');
  });

  it('blocks "Weiter" with an inline message when the email format is invalid', async () => {
    const { fixture, create } = await setup();
    const component = fixture.componentInstance;

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('not-an-email');

    component.onNext();

    expect(component.emailFormatError()).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
    expect(component.activeStep()).toBe('step1');
  });

  it('Cancel after a same-session creation calls SellersApi.remove(id) and then emits closed', async () => {
    const { fixture, create, remove } = await setup({ createResult: createdSeller({ id: 'SEL00099' }) });
    const component = fixture.componentInstance;
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');
    component.onNext();
    expect(create).toHaveBeenCalled();

    component.onCancel();

    expect(remove).toHaveBeenCalledWith('SEL00099');
    expect(closedSpy).toHaveBeenCalled();
  });

  it('Cancel for a sellerId given as an Input (not created this session) does not call remove(), just emits closed', async () => {
    const { fixture, remove } = await setup({ sellerId: 'SEL00001' });
    const component = fixture.componentInstance;
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onCancel();

    expect(remove).not.toHaveBeenCalled();
    expect(closedSpy).toHaveBeenCalled();
  });

  it('Cancel before any creation (still on Step 1, nothing created yet) does not call remove(), just emits closed', async () => {
    const { fixture, remove } = await setup({ pendingSearchText: 'Anna Meier' });
    const component = fixture.componentInstance;
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onCancel();

    expect(remove).not.toHaveBeenCalled();
    expect(closedSpy).toHaveBeenCalled();
  });
});
