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

  describe('import button', () => {
    const IMPORT_BUTTON = 'button[aria-label="Importieren"]';

    it('render_ImportVisibleAndNotSettled_ShowsEnabledIconOnlyButtonAfterCameraButton', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard());
      fixture.componentRef.setInput('importVisible', true);

      // Act
      await fixture.whenStable();

      // Assert
      const buttons = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.seller-card__actions button'),
      );
      expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
        'Bearbeiten',
        'Scannen',
        'Importieren',
        'Drucken',
      ]);
    });

    it('render_ImportButton_HasNoTextLabel', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard());
      fixture.componentRef.setInput('importVisible', true);

      // Act
      await fixture.whenStable();

      // Assert
      const button = (fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON);
      expect(button?.textContent?.trim()).toBe('');
    });

    it('render_ImportNotVisible_HasNoImportButton', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard());

      // Act
      await fixture.whenStable();

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).toBeNull();
    });

    it('render_SettledSeller_DisablesImportButton', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard({ status: 'settled' }));
      fixture.componentRef.setInput('importVisible', true);

      // Act
      await fixture.whenStable();

      // Assert
      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(IMPORT_BUTTON);
      expect(button?.disabled).toBe(true);
    });

    it('render_OpenSeller_KeepsImportButtonEnabled', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard({ status: 'open' }));
      fixture.componentRef.setInput('importVisible', true);

      // Act
      await fixture.whenStable();

      // Assert
      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(IMPORT_BUTTON);
      expect(button?.disabled).toBe(false);
    });

    it('onImportArticles_ButtonClick_EmitsCardWithoutEmittingCardClick', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      const card = buildCard();
      fixture.componentRef.setInput('card', card);
      fixture.componentRef.setInput('importVisible', true);
      const importSpy = vi.fn();
      const cardClickSpy = vi.fn();
      fixture.componentInstance.importArticles.subscribe(importSpy);
      fixture.componentInstance.cardClick.subscribe(cardClickSpy);
      await fixture.whenStable();
      const button = (fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON) as HTMLButtonElement;

      // Act
      button.click();

      // Assert
      expect(importSpy).toHaveBeenCalledWith(card);
      expect(cardClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('print button', () => {
    function actionLabels(el: HTMLElement): string[] {
      return Array.from(el.querySelectorAll('.seller-card__actions button')).map(
        (button) => button.getAttribute('aria-label') ?? '',
      );
    }

    it('template_withoutImportRight_showsPrintAsLastActionNextToEditAndScan', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard());
      fixture.componentRef.setInput('importVisible', false);

      // Act
      await fixture.whenStable();

      // Assert
      expect(actionLabels(fixture.nativeElement)).toEqual(['Bearbeiten', 'Scannen', 'Drucken']);
    });

    it('template_printButton_usesPrinterIcon', async () => {
      // Arrange
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', buildCard());

      // Act
      await fixture.whenStable();

      // Assert
      const button = (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Drucken"]');
      expect(button?.querySelector('.pi-print')).not.toBeNull();
    });

    it('onPrintReceipt_buttonClicked_emitsCardWithoutOpeningDetail', async () => {
      // Arrange
      const card = buildCard({ articleCount: 0 });
      const fixture = TestBed.createComponent(SellerCard);
      fixture.componentRef.setInput('card', card);
      const printSpy = vi.fn();
      const cardClickSpy = vi.fn();
      fixture.componentInstance.printReceipt.subscribe(printSpy);
      fixture.componentInstance.cardClick.subscribe(cardClickSpy);
      await fixture.whenStable();
      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        'button[aria-label="Drucken"]',
      );

      // Act
      button?.click();

      // Assert
      expect(printSpy).toHaveBeenCalledWith(card);
      expect(cardClickSpy).not.toHaveBeenCalled();
    });
  });
});
