import { TestBed } from '@angular/core/testing';
import { SettlementPanel } from './settlement-panel';
import { SellerSettlement } from '../../data/settlement-api';

function settlement(overrides: Partial<SellerSettlement> = {}): SellerSettlement {
  return {
    seller: {
      id: 'SEL00001',
      firstName: 'Anna',
      lastName: 'Meier',
      address: 'Hauptstr. 1',
      postalCode: '76133',
      city: 'Karlsruhe',
    },
    openCount: 0,
    soldCount: 31,
    returnedCount: 9,
    revenue: 380.5,
    commissionRate: 12.5,
    commission: 47.56,
    payout: 332.94,
    intakeFeePaid: 20,
    notDeliveredCount: 10,
    settledAt: null,
    payoutAmount: null,
    canSettle: true,
    ...overrides,
  };
}

async function setup(extra: Record<string, unknown> = {}) {
  await TestBed.configureTestingModule({
    imports: [SettlementPanel],
  }).compileComponents();

  const fixture = TestBed.createComponent(SettlementPanel);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('settlement', settlement());
  for (const [key, val] of Object.entries(extra)) {
    fixture.componentRef.setInput(key, val);
  }

  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture };
}

function text(fixture: { nativeElement: HTMLElement }): string {
  return fixture.nativeElement.textContent ?? '';
}

describe('SettlementPanel', () => {
  it('renders revenue/commission/payout formatted as currency, with a leading − on commission', async () => {
    const { fixture } = await setup();

    const t = text(fixture);
    expect(t).toContain('Umsatz');
    expect(t).toContain('380,50');
    expect(t).toContain('Provision');
    expect(t).toContain('− ');
    expect(t).toContain('47,56');
    expect(t).toContain('Auszahlung');
    expect(t).toContain('332,94');
  });

  it('shows the "N nicht abgegebene Artikel werden entfernt" hint when notDeliveredCount > 0', async () => {
    const { fixture } = await setup();

    expect(text(fixture)).toContain('10 nicht abgegebene Artikel werden entfernt');
  });

  it('does not render the hint when notDeliveredCount is 0', async () => {
    const { fixture } = await setup({ settlement: settlement({ notDeliveredCount: 0 }) });

    expect(text(fixture)).not.toContain('nicht abgegebene Artikel');
  });

  it('does not render any Annahmegebühr/intakeFeePaid row or text at all', async () => {
    const { fixture } = await setup();

    const t = text(fixture);
    expect(t).not.toContain('Annahmegebühr');
    expect(t).not.toContain('20');
  });

  it('clicking "Buchen" emits confirmed', async () => {
    const { fixture } = await setup();
    const confirmedSpy = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmedSpy);

    fixture.componentInstance.onConfirm();

    expect(confirmedSpy).toHaveBeenCalled();
  });

  it('clicking "Abbrechen" emits visibleChange(false)', async () => {
    const { fixture } = await setup();
    const visibleChangeSpy = vi.fn();
    fixture.componentInstance.visibleChange.subscribe(visibleChangeSpy);

    fixture.componentInstance.onCancel();

    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('renders the error banner when errorMessage is set', async () => {
    const { fixture } = await setup({ errorMessage: '3 Artikel sind noch im Verkauf' });

    expect(fixture.nativeElement.querySelector('.settlement-panel__error')).toBeTruthy();
    expect(text(fixture)).toContain('3 Artikel sind noch im Verkauf');
  });

  it('renders no error banner element when errorMessage is null (default)', async () => {
    const { fixture } = await setup();

    expect(fixture.nativeElement.querySelector('.settlement-panel__error')).toBeNull();
  });

  it('keeps the "Buchen" button present and enabled even when errorMessage is set', async () => {
    const { fixture } = await setup({ errorMessage: '3 Artikel sind noch im Verkauf' });

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('p-button')) as HTMLElement[];
    const buchenButton = buttons.find((b) => b.getAttribute('label') === 'Buchen');

    expect(buchenButton).toBeTruthy();
    expect(buchenButton?.getAttribute('disabled')).not.toBe('true');
  });
});
