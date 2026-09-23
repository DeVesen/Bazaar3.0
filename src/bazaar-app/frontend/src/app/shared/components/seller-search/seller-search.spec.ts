import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SellerSearch, SellerSummary } from './seller-search';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
// `BarcodeScanner` (direct dependency of `SellerSearch`) — the ONE shared `@zxing/browser` mock
// (see that file's own comment) so camera-mode tests never touch real device APIs.
import { getDecodeFromVideoDeviceMock } from '../barcode-scanner/testing/zxing-browser.mock';

const decodeFromVideoDeviceMock = getDecodeFromVideoDeviceMock();

function seller(overrides: Partial<SellerSummary> = {}): SellerSummary {
  return {
    id: 'SEL00001',
    firstName: 'Anna',
    lastName: 'Meier',
    zip: '76133',
    city: 'Karlsruhe',
    settledAt: null,
    ...overrides,
  };
}

describe('SellerSearch', () => {
  beforeEach(async () => {
    decodeFromVideoDeviceMock.mockReset();
    decodeFromVideoDeviceMock.mockResolvedValue({ stop: vi.fn() });

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [SellerSearch],
    }).compileComponents();
  });

  function create(sellers: SellerSummary[] = [], opts: { showCreateButton?: boolean; showScanButton?: boolean } = {}) {
    const fixture = TestBed.createComponent(SellerSearch);
    fixture.componentRef.setInput('sellers', sellers);
    fixture.componentRef.setInput('hint', 'Test-Hinweis');
    if (opts.showCreateButton !== undefined) fixture.componentRef.setInput('showCreateButton', opts.showCreateButton);
    if (opts.showScanButton !== undefined) fixture.componentRef.setInput('showScanButton', opts.showScanButton);
    fixture.detectChanges();
    return fixture;
  }

  function typeInto(fixture: ReturnType<typeof create>, text: string) {
    fixture.componentInstance.onTyped(text);
    fixture.detectChanges();
  }

  function enterMode(fixture: ReturnType<typeof create>, mode: 'camera' | 'numpad') {
    fixture.componentInstance.onAddonClick(mode);
    fixture.detectChanges();
  }

  function scannerOf(fixture: ReturnType<typeof create>): BarcodeScanner {
    return fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
  }

  // Layout-Vereinheitlichung Teil 4
  it('renders app-input with the label "Verkäufer" in the frame and no search icon', () => {
    const fixture = create([seller()]);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-input p-iftalabel label')?.textContent).toContain('Verkäufer');
    expect(el.querySelector('.pi-search')).toBeNull();
    expect(el.querySelector('app-input-group')).toBeNull();
  });

  it('keeps the hint directly below the field, before the result list', () => {
    const fixture = create([seller()]);
    const card: HTMLElement = fixture.nativeElement;
    const order = Array.from(card.querySelectorAll('app-input, .seller-search__hint, p-listbox')).map((n) => n.tagName.toLowerCase() === 'p' ? 'hint' : n.tagName.toLowerCase());

    expect(order).toEqual(['app-input', 'hint', 'p-listbox']);
  });

  it('offers numpad, clear and enter addons, plus camera only with showScanButton', () => {
    expect(create([seller()]).componentInstance.inputAddons().map((a) => a.key)).toEqual(['numpad', 'clear', 'enter']);
    expect(create([seller()], { showScanButton: true }).componentInstance.inputAddons().map((a) => a.key)).toEqual([
      'camera',
      'numpad',
      'clear',
      'enter',
    ]);
  });

  // AC-1
  it('shows all sellers when the search field is empty', () => {
    const sellers = [seller({ id: 'SEL1' }), seller({ id: 'SEL2', lastName: 'Schmidt' })];
    const fixture = create(sellers);

    expect(fixture.componentInstance.filteredSellers()).toEqual(sellers);
  });

  // AC-2
  it('filters by id/firstName/lastName, case-insensitive substring', () => {
    const sellers = [
      seller({ id: 'SEL00001', firstName: 'Anna', lastName: 'Meier' }),
      seller({ id: 'SEL00002', firstName: 'Max', lastName: 'Mustermann' }),
    ];
    const fixture = create(sellers);

    typeInto(fixture, 'mei');

    expect(fixture.componentInstance.filteredSellers()).toEqual([sellers[0]]);
  });

  // AC-3
  it('emits sellerSelected on Enter when exactly one result matches', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target, seller({ id: 'SEL00002', lastName: 'Other' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'SEL00001');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([target]);
  });

  it('treats the enter addon like a keyboard Enter', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'SEL00001');
    fixture.componentInstance.onAddonClick('enter');

    expect(emitted).toEqual([target]);
  });

  it('does nothing on Enter when more than one result matches', () => {
    const fixture = create([seller({ id: 'SEL1', lastName: 'Meier' }), seller({ id: 'SEL2', lastName: 'Meierhof' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'meier');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([]);
  });

  // AC-4
  it('emits createRequested with the search text on Enter when there are 0 results and showCreateButton is set', () => {
    const fixture = create([], { showCreateButton: true });
    const emitted: string[] = [];
    fixture.componentInstance.createRequested.subscribe((text) => emitted.push(text));

    typeInto(fixture, 'Unbekannt');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual(['Unbekannt']);
  });

  it('does not emit createRequested on Enter with 0 results when showCreateButton is off (Abrechnung)', () => {
    const fixture = create([], { showCreateButton: false });
    const emitted: string[] = [];
    fixture.componentInstance.createRequested.subscribe((text) => emitted.push(text));

    typeInto(fixture, 'Unbekannt');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([]);
    expect(fixture.debugElement.query(By.css('p-button[label="+ Neuen Verkäufer anlegen"]'))).toBeFalsy();
  });

  it('shows the "+ Neuen Verkäufer anlegen" button only when showCreateButton is set and results are empty', () => {
    const createButton = () => fixture.debugElement.query(By.css('p-button[label="+ Neuen Verkäufer anlegen"]'));
    const fixture = create([], { showCreateButton: true });
    fixture.detectChanges();

    expect(createButton()).toBeTruthy();

    fixture.componentRef.setInput('sellers', [seller()]);
    typeInto(fixture, 'anna');

    expect(createButton()).toBeFalsy();
  });

  // AC-5
  it('swaps the RESULT LIST (not the input field) for the video feed in camera mode', () => {
    const fixture = create([seller()], { showScanButton: true });

    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'camera', 'numpad']);
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();

    enterMode(fixture, 'camera');

    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeFalsy();
    const scanners = fixture.debugElement.queryAll(By.directive(BarcodeScanner));
    expect(scanners.length).toBe(1);
    expect(scanners[0].nativeElement.classList).toContain('seller-search__camera');
    expect(fixture.debugElement.query(By.css('app-input input[pInputText]'))).toBeTruthy();
  });

  it('does not offer the camera mode when showScanButton is false (default)', () => {
    const fixture = create([seller()]);
    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'numpad']);
  });

  // AC-6 + scan flow
  it('auto-selects on scan when exactly one result matches, and the camera stops', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target], { showScanButton: true });
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('SEL00001');
    fixture.detectChanges();

    expect(emitted).toEqual([target]);
    expect(fixture.componentInstance.mode.active()).toBe('keyboard');
  });

  it('emits searchChanged exactly once per scan', () => {
    const fixture = create([seller({ id: 'SEL00001' })], { showScanButton: true });
    const emitted: string[] = [];
    fixture.componentInstance.searchChanged.subscribe((v) => emitted.push(v));

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('SEL00001');
    fixture.detectChanges();

    expect(emitted).toEqual(['SEL00001']);
  });

  it('keeps the camera active when a scan matches 0 sellers', () => {
    const fixture = create([seller({ id: 'SEL00001' })], { showScanButton: true });

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('NOPE');
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('camera');
  });

  it('returns to the previously active mode when a scan matches more than one seller', () => {
    const fixture = create(
      [seller({ id: 'SEL1', lastName: 'Meier' }), seller({ id: 'SEL2', lastName: 'Meierhof' })],
      { showScanButton: true },
    );

    enterMode(fixture, 'numpad');
    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('Meier');
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('numpad');
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();
  });

  // AC-7
  it('stops the camera and returns to the previously active mode on Escape', () => {
    const fixture = create([seller()], { showScanButton: true });

    enterMode(fixture, 'numpad');
    enterMode(fixture, 'camera');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('numpad');
  });

  it('clears the field and shows all sellers on Escape in keyboard mode', () => {
    const fixture = create([seller({ id: 'SEL1' }), seller({ id: 'SEL2', lastName: 'Other' })]);
    typeInto(fixture, 'SEL1');

    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.searchText()).toBe('');
    expect(fixture.componentInstance.filteredSellers().length).toBe(2);
  });

  // AC-8
  it('types via the numpad and treats its submit like a keyboard Enter', () => {
    const target = seller({ id: '42', lastName: 'Zahl' });
    const fixture = create([target, seller({ id: '7', lastName: 'Andere' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    enterMode(fixture, 'numpad');
    expect(fixture.nativeElement.querySelector('app-numpad')).not.toBeNull();
    fixture.componentInstance.onNumpadKey({ key: '4' });
    fixture.componentInstance.onNumpadKey({ key: '2' });
    fixture.componentInstance.onSubmit();

    expect(fixture.componentInstance.searchText()).toBe('42');
    expect(emitted).toEqual([target]);
  });

  // AC-9
  it('shows one camera-denied hint and falls back to keyboard when no camera API exists', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    const fixture = create([seller()], { showScanButton: true });

    enterMode(fixture, 'camera');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('keyboard');
    const occurrences = (fixture.nativeElement.textContent.match(/Kamerazugriff nicht möglich/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  // Epic_Artikelannahme AC-12 — settled sellers
  it('shows a settled seller with a badge and blocks selection with an inline hint instead of emitting sellerSelected', () => {
    const settled = seller({ id: 'SEL00001', settledAt: '2026-01-01T00:00:00Z' });
    const fixture = create([settled]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('p-tag'))).toBeTruthy();

    fixture.componentInstance.onListboxChange({ value: settled });
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance.blockedSelectionHint()).toContain('Admin');
    expect(fixture.componentInstance.blockedSelectionHint()).toContain('Anna Meier');
  });

  it('still selects a non-settled seller normally when clicked from the list', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    fixture.componentInstance.onListboxChange({ value: target });

    expect(emitted).toEqual([target]);
    expect(fixture.componentInstance.blockedSelectionHint()).toBeNull();
  });
});
