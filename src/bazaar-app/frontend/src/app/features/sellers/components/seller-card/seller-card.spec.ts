import { TestBed } from '@angular/core/testing';
import { SellerCard } from './seller-card';
import { SellerCard as SellerCardModel } from '../../data/sellers-api';

function buildCard(overrides: Partial<SellerCardModel> = {}): SellerCardModel {
  return {
    id: 'a3f9c2d1-1234-5678-9abc-def012345678',
    firstName: 'Maria',
    lastName: 'Muster',
    postalCode: '76133',
    city: 'Karlsruhe',
    sellerType: 'Standard',
    status: 'open',
    articleCount: 12,
    releasedCount: 8,
    soldCount: 5,
    returnedCount: 1,
    acceptedValue: 100.5,
    openValue: 20.25,
    revenue: 80.25,
    settledAt: null,
    ...overrides,
  };
}

describe('SellerCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerCard],
    }).compileComponents();
  });

  it('renders name, address line with id, type badge and all stats/footer values from the input', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    fixture.componentRef.setInput('card', buildCard());
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('Maria Muster');
    expect(text).toContain('76133 Karlsruhe · #a3f9c2d1');
    expect(text).toContain('Standard');
    expect(text).toContain('12');
    expect(text).toContain('8');
    expect(text).toContain('5');
    expect(text).toContain('1');
    expect(text).toContain('100.50');
    expect(text).toContain('20.25');
    expect(text).toContain('80.25');
  });

  it('maps status "open"/"selling"/"settled" to the German display labels', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    fixture.componentRef.setInput('card', buildCard({ status: 'open' }));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Offen');

    fixture.componentRef.setInput('card', buildCard({ status: 'selling' }));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Im Verkauf');

    fixture.componentRef.setInput('card', buildCard({ status: 'settled' }));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Abgerechnet');
  });

  it('emits edit with the card on edit button click, without emitting cardClick', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    const card = buildCard();
    fixture.componentRef.setInput('card', card);
    const component = fixture.componentInstance;
    const editSpy = vi.fn();
    const cardClickSpy = vi.fn();
    component.edit.subscribe(editSpy);
    component.cardClick.subscribe(cardClickSpy);
    await fixture.whenStable();

    const editButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Bearbeiten"]',
    ) as HTMLButtonElement;
    editButton.click();

    expect(editSpy).toHaveBeenCalledWith(card);
    expect(cardClickSpy).not.toHaveBeenCalled();
  });

  it('emits scan with the card on scanner button click, without emitting cardClick', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    const card = buildCard();
    fixture.componentRef.setInput('card', card);
    const component = fixture.componentInstance;
    const scanSpy = vi.fn();
    const cardClickSpy = vi.fn();
    component.scan.subscribe(scanSpy);
    component.cardClick.subscribe(cardClickSpy);
    await fixture.whenStable();

    const scanButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Scannen"]',
    ) as HTMLButtonElement;
    scanButton.click();

    expect(scanSpy).toHaveBeenCalledWith(card);
    expect(cardClickSpy).not.toHaveBeenCalled();
  });

  it('emits statusClick with the card on status badge click, without emitting cardClick', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    const card = buildCard();
    fixture.componentRef.setInput('card', card);
    const component = fixture.componentInstance;
    const statusClickSpy = vi.fn();
    const cardClickSpy = vi.fn();
    component.statusClick.subscribe(statusClickSpy);
    component.cardClick.subscribe(cardClickSpy);
    await fixture.whenStable();

    const statusTag = (fixture.nativeElement as HTMLElement).querySelector(
      '.seller-card__status p-tag',
    ) as HTMLElement;
    statusTag.click();

    expect(statusClickSpy).toHaveBeenCalledWith(card);
    expect(cardClickSpy).not.toHaveBeenCalled();
  });

  it('emits cardClick with the card when clicking the card surface outside any button/badge', async () => {
    const fixture = TestBed.createComponent(SellerCard);
    const card = buildCard();
    fixture.componentRef.setInput('card', card);
    const component = fixture.componentInstance;
    const cardClickSpy = vi.fn();
    component.cardClick.subscribe(cardClickSpy);
    await fixture.whenStable();

    const cardEl = (fixture.nativeElement as HTMLElement).querySelector(
      '.seller-card',
    ) as HTMLElement;
    cardEl.click();

    expect(cardClickSpy).toHaveBeenCalledWith(card);
  });
});
