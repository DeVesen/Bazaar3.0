import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrintAbgabeBeleg, PrintAbgabeBelegArticle, PrintAbgabeBelegSeller } from './print-abgabe-beleg';
import { QrCode } from '../qr-code/qr-code';

describe('PrintAbgabeBeleg', () => {
  const seller: PrintAbgabeBelegSeller = {
    id: 'a3f9c2d1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
    phone: '0721 123456',
  };

  const articles: PrintAbgabeBelegArticle[] = [
    { number: 1043, name: 'Winterjacke', brand: 'Nike', price: 12 },
    { number: 1044, name: 'Gummistiefel', brand: 'Aigle', price: 8 },
  ];

  async function setup(overrides: {
    seller?: PrintAbgabeBelegSeller;
    articles?: PrintAbgabeBelegArticle[];
    feePerItem?: number;
    feeAmount?: number;
    occurredAt?: Date;
  } = {}) {
    await TestBed.configureTestingModule({
      imports: [PrintAbgabeBeleg],
    }).compileComponents();

    const fixture = TestBed.createComponent(PrintAbgabeBeleg);
    fixture.componentRef.setInput('seller', overrides.seller ?? seller);
    fixture.componentRef.setInput('articles', overrides.articles ?? articles);
    fixture.componentRef.setInput('feePerItem', overrides.feePerItem ?? 0.5);
    fixture.componentRef.setInput('feeAmount', overrides.feeAmount ?? 1);
    fixture.componentRef.setInput('occurredAt', overrides.occurredAt ?? new Date(2026, 7, 17, 8, 12));
    await fixture.whenStable();

    return fixture;
  }

  it('renders exactly the given articles, in order, with their data', async () => {
    const fixture = await setup();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.print-abgabe-beleg__articles tbody tr',
    );

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('1043');
    expect(rows[0].textContent).toContain('Winterjacke');
    expect(rows[0].textContent).toContain('Nike');
    expect(rows[0].textContent).toContain('12,00');
    expect(rows[1].textContent).toContain('1044');
    expect(rows[1].textContent).toContain('Gummistiefel');
    expect(rows[1].textContent).toContain('Aigle');
    expect(rows[1].textContent).toContain('8,00');
  });

  it('shows only the given articles, not more, for a single-article session', async () => {
    const fixture = await setup({ articles: [articles[0]] });
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.print-abgabe-beleg__articles tbody tr',
    );

    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Winterjacke');
  });

  it('shows the traceability line as feePerItem × article count = product', async () => {
    const fixture = await setup({ feePerItem: 0.5 });
    const footerText = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-abgabe-beleg__footer',
    )?.textContent;

    expect(footerText).toContain('2 Artikel');
    expect(footerText).toContain('Annahmegebühr 2');
    expect(footerText).toContain('0,50');
    expect(footerText).toContain('1,00');
  });

  it('shows the actually paid feeAmount separately from the calculated fee, without mixing them up', async () => {
    // feePerItem × articles.length = 1.00, but the actually paid feeAmount is deliberately
    // different (3.50) — proves the two values are shown independently, never conflated.
    const fixture = await setup({ feePerItem: 0.5, feeAmount: 3.5 });
    const footerText = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-abgabe-beleg__footer',
    )?.textContent;

    expect(footerText).toContain('1,00');
    expect(footerText).toContain('3,50');
    expect(footerText).toContain('bezahlt');
  });

  it('passes the seller id to app-qr-code as its value (and caption)', async () => {
    const fixture = await setup();
    const qrCode = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;

    expect(qrCode.value()).toBe('a3f9c2d1');
    expect(qrCode.caption()).toBe('a3f9c2d1');
  });

  it('renders seller name, address, city line, and phone', async () => {
    const fixture = await setup();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.print-abgabe-beleg__seller')
      ?.textContent;

    expect(text).toContain('Anna Meier');
    expect(text).toContain('Musterstraße 5');
    expect(text).toContain('76133 Karlsruhe');
    expect(text).toContain('0721 123456');
  });

  it('hides null seller fields instead of printing "null"', async () => {
    const fixture = await setup({
      seller: {
        id: 'b7e1f4a0',
        firstName: 'Max',
        lastName: 'Schmidt',
        address: null,
        postalCode: null,
        city: null,
        phone: null,
      },
    });
    const sellerSection = fixture.nativeElement as HTMLElement;
    const text = sellerSection.querySelector('.print-abgabe-beleg__seller')?.textContent ?? '';

    expect(text).toContain('Max Schmidt');
    expect(text).not.toContain('null');
  });

  it('hides the city line only when both postalCode and city are null', async () => {
    const fixture = await setup({
      seller: { ...seller, postalCode: null, city: 'Karlsruhe' },
    });
    const text = (fixture.nativeElement as HTMLElement).querySelector('.print-abgabe-beleg__seller')
      ?.textContent;

    expect(text).toContain('Karlsruhe');
    expect(text).not.toContain('null');
  });

  it('formats occurredAt as dd.MM.yyyy, HH:mm', async () => {
    const fixture = await setup({ occurredAt: new Date(2026, 7, 17, 8, 12) });
    const text = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-abgabe-beleg__occurred-at',
    )?.textContent;

    expect(text).toContain('17.08.2026, 08:12');
  });

  it('renders a null article brand as an empty cell instead of "null"', async () => {
    const fixture = await setup({ articles: [{ number: 1, name: 'Schal', brand: null, price: 2 }] });
    const row = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-abgabe-beleg__articles tbody tr',
    );

    expect(row?.textContent).not.toContain('null');
  });
});
