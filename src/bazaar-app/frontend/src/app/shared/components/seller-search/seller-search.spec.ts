import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SellerSearch, SellerSummary } from './seller-search';
import { InputGroup } from '../input-group/input-group';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';

/**
 * `InputGroup` (a real dependency of `SellerSearch`) itself depends on `BarcodeScanner`, which
 * depends on `@zxing/browser` — mocked the same way `input-group.spec.ts` does so camera-mode
 * tests never touch real device APIs (unavailable in jsdom).
 */
const decodeFromVideoDeviceMock = vi.fn();
vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));

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

  function inputGroupOf(fixture: ReturnType<typeof create>): InputGroup {
    return fixture.debugElement.query(By.directive(InputGroup)).componentInstance as InputGroup;
  }

  function typeInto(fixture: ReturnType<typeof create>, text: string) {
    inputGroupOf(fixture).onTyped(text);
    fixture.detectChanges();
  }

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
  it('offers the camera mode and swaps the result list for the video feed when active, leaving the field itself in place', () => {
    const fixture = create([seller()], { showScanButton: true });

    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'camera', 'numpad']);
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();

    inputGroupOf(fixture).switchMode('camera');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeFalsy();
    expect(fixture.debugElement.query(By.directive(BarcodeScanner))).toBeTruthy();
  });

  it('does not offer the camera mode when showScanButton is false (default)', () => {
    const fixture = create([seller()]);
    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'numpad']);
  });

  // AC-6 + scan flow (doc Abschnitt 6)
  it('auto-selects on scan when exactly one result matches, and the camera stops', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target], { showScanButton: true });
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    const inputGroup = inputGroupOf(fixture);
    inputGroup.switchMode('camera');
    fixture.detectChanges();
    const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;

    scanner.codeDetected.emit('SEL00001');
    fixture.detectChanges();

    expect(emitted).toEqual([target]);
    expect(inputGroup.activeMode()).toBe('keyboard');
  });

  it('keeps the camera active when a scan matches 0 sellers', async () => {
    const fixture = create([seller({ id: 'SEL00001' })], { showScanButton: true });

    const inputGroup = inputGroupOf(fixture);
    inputGroup.switchMode('camera');
    fixture.detectChanges();
    const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;

    scanner.codeDetected.emit('NOPE');
    fixture.detectChanges();
    // input-group's own onCodeDetected() synchronously resets to keyboard; seller-search's
    // override runs in a microtask right after.
    await Promise.resolve();
    fixture.detectChanges();

    expect(inputGroup.activeMode()).toBe('camera');
  });

  it('stops the camera and returns to the previously active mode when a scan matches more than one seller', async () => {
    const fixture = create(
      [seller({ id: 'SEL1', lastName: 'Meier' }), seller({ id: 'SEL2', lastName: 'Meierhof' })],
      { showScanButton: true },
    );

    const inputGroup = inputGroupOf(fixture);
    // previously active mode was 'keyboard' (the default) before switching to camera
    inputGroup.switchMode('camera');
    fixture.detectChanges();
    const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;

    scanner.codeDetected.emit('Meier');
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(inputGroup.activeMode()).toBe('keyboard');
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();
  });

  // AC-7
  it('stops the camera and returns to the previously active mode on Escape', () => {
    const fixture = create([seller()], { showScanButton: true });
    const inputGroup = inputGroupOf(fixture);

    inputGroup.switchMode('numpad');
    fixture.detectChanges();
    inputGroup.switchMode('camera');
    fixture.detectChanges();

    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(inputGroup.activeMode()).toBe('numpad');
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
  it("treats the numpad's submitted event the same as a keyboard Enter", () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target], { showScanButton: false });
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    const inputGroup = inputGroupOf(fixture);
    inputGroup.switchMode('numpad');
    typeInto(fixture, 'SEL00001');
    fixture.detectChanges();

    inputGroup.submitted.emit();

    expect(emitted).toEqual([target]);
  });

  // AC-9 — delegated to input-group, verify seller-search doesn't duplicate/break it
  it('delegates the camera-denied red info area to input-group without adding its own', () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    const fixture = create([seller()], { showScanButton: true });

    const inputGroup = inputGroupOf(fixture);
    inputGroup.switchMode('camera');
    fixture.detectChanges();

    expect(inputGroup.activeMode()).toBe('keyboard');
    expect(inputGroup.cameraDenied()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Kamerazugriff nicht möglich');
    // Only one such message exists — seller-search does not render a second one of its own.
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
