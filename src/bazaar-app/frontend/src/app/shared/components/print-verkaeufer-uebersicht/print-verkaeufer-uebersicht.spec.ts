import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  PrintVerkaeuferUebersicht,
  PrintVerkaeuferUebersichtArticle,
  PrintVerkaeuferUebersichtSeller,
  PrintVerkaeuferUebersichtSettlement,
} from './print-verkaeufer-uebersicht';
import { QrCode } from '../qr-code/qr-code';

describe('PrintVerkaeuferUebersicht', () => {
  const seller: PrintVerkaeuferUebersichtSeller = {
    id: 'a3f9c2d1',
    firstName: 'Anna',
    lastName: 'Meier',
    postalCode: '76133',
    city: 'Karlsruhe',
  };

  const articles: PrintVerkaeuferUebersichtArticle[] = [
    { number: 1051, name: 'Regenjacke', price: 6, status: 'selling' },
    { number: 1043, name: 'Winterjacke', price: 12, status: 'sold' },
    { number: 1077, name: 'Puppe', price: 4, status: 'returned' },
    { number: 1099, name: 'Sonstiges', price: 2, status: 'registered' },
  ];

  const settlement: PrintVerkaeuferUebersichtSettlement = {
    revenue: 380.5,
    commission: 47.56,
    payout: 332.94,
    commissionRate: 12.5,
    intakeFeePaid: 20,
  };

  async function setup(
    overrides: {
      seller?: PrintVerkaeuferUebersichtSeller;
      articles?: PrintVerkaeuferUebersichtArticle[];
      settlement?: PrintVerkaeuferUebersichtSettlement;
      phase?: 'preliminary' | 'final';
    } = {},
  ) {
    await TestBed.configureTestingModule({
      imports: [PrintVerkaeuferUebersicht],
    }).compileComponents();

    const fixture = TestBed.createComponent(PrintVerkaeuferUebersicht);
    fixture.componentRef.setInput('seller', overrides.seller ?? seller);
    fixture.componentRef.setInput('articles', overrides.articles ?? articles);
    fixture.componentRef.setInput('settlement', overrides.settlement ?? settlement);
    fixture.componentRef.setInput('phase', overrides.phase ?? 'final');
    await fixture.whenStable();

    return fixture;
  }

  it('groups articles by status into the three sections, excluding statuses outside the three groups', async () => {
    const fixture = await setup();
    const groups = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.print-verkaeufer-uebersicht__group',
    );

    expect(groups.length).toBe(3);

    const sellingGroup = groups[0];
    expect(sellingGroup.querySelector('h2')?.textContent).toContain('Noch im Verkauf (1)');
    expect(sellingGroup.textContent).toContain('Regenjacke');
    expect(sellingGroup.textContent).not.toContain('Sonstiges');

    const soldGroup = groups[1];
    expect(soldGroup.querySelector('h2')?.textContent).toContain('Verkauft (1)');
    expect(soldGroup.textContent).toContain('Winterjacke');
    expect(soldGroup.textContent).not.toContain('Sonstiges');

    const returnedGroup = groups[2];
    expect(returnedGroup.querySelector('h2')?.textContent).toContain('Zurückgegeben (1)');
    expect(returnedGroup.textContent).toContain('Puppe');
    expect(returnedGroup.textContent).not.toContain('Sonstiges');
  });

  it('shows "—" instead of an empty list for a group with no articles', async () => {
    const fixture = await setup({ articles: articles.filter((article) => article.status !== 'returned') });
    const groups = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.print-verkaeufer-uebersicht__group',
    );
    const returnedGroup = groups[2];

    expect(returnedGroup.querySelector('h2')?.textContent).toContain('Zurückgegeben (0)');
    expect(returnedGroup.querySelector('ul')).toBeNull();
    expect(returnedGroup.querySelector('p')?.textContent?.trim()).toBe('—');
  });

  it('shows the preliminary hint when phase is "preliminary"', async () => {
    const fixture = await setup({ phase: 'preliminary' });
    const hint = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-verkaeufer-uebersicht__preliminary-hint',
    );

    expect(hint?.textContent).toContain('VORLÄUFIG — es sind noch Artikel im Verkauf.');
  });

  it('does not show the preliminary hint when phase is "final"', async () => {
    const fixture = await setup({ phase: 'final' });
    const hint = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-verkaeufer-uebersicht__preliminary-hint',
    );

    expect(hint).toBeNull();
  });

  it('renders revenue, commission (with rate), payout, and the intake-fee hint exactly as given by settlement', async () => {
    const fixture = await setup();
    const settlementSection = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-verkaeufer-uebersicht__settlement',
    );
    const feeHint = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-verkaeufer-uebersicht__fee-hint',
    );

    expect(settlementSection?.textContent).toContain('380,50');
    expect(settlementSection?.textContent).toContain('12,5 %');
    expect(settlementSection?.textContent).toContain('47,56');
    expect(settlementSection?.textContent).toContain('332,94');
    expect(feeHint?.textContent).toContain('Annahmegebühr 20,00');
    expect(feeHint?.textContent).toContain('bereits bezahlt.');
  });

  it('passes the seller id to app-qr-code as its value (and caption)', async () => {
    const fixture = await setup();
    const qrCode = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;

    expect(qrCode.value()).toBe('a3f9c2d1');
    expect(qrCode.caption()).toBe('a3f9c2d1');
  });

  it('hides the city line, without printing "null", when postalCode and city are both null', async () => {
    const fixture = await setup({
      seller: { id: 'b7e1f4a0', firstName: 'Max', lastName: 'Schmidt', postalCode: null, city: null },
    });
    const header = (fixture.nativeElement as HTMLElement).querySelector(
      '.print-verkaeufer-uebersicht__header',
    );

    expect(header?.textContent).toContain('Max Schmidt');
    expect(header?.textContent).not.toContain('null');
  });
});
