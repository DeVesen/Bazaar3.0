import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LabelCard } from './label-card';
import { LabelGraphic } from './label-graphic';
import { DEFAULT_LABEL_ELEMENT_SIZES } from './label-layout';
import { QrCode } from '../qr-code/qr-code';

const STAR: LabelGraphic = { kind: 'icon', value: 'star' };
const PNG_LOGO: LabelGraphic = { kind: 'image', value: 'data:image/png;base64,AAAA' };
const SVG_WITH_SCRIPT: LabelGraphic = {
  kind: 'image',
  value: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')}`,
};

async function render(inputs: Record<string, unknown>): Promise<ComponentFixture<LabelCard>> {
  const fixture = TestBed.createComponent(LabelCard);
  fixture.componentRef.setInput('width', 105);
  fixture.componentRef.setInput('height', 35);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture;
}

function element(fixture: ComponentFixture<LabelCard>, selector: string): HTMLElement | null {
  return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
}

function percent(value: string | undefined): number {
  return Number.parseFloat(value ?? 'NaN');
}

describe('LabelCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelCard] }).compileComponents();
  });

  it('render_number1000_encodesExactly1000InQrCode', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000 });

    // Assert
    const qrCode = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;
    expect(qrCode.value()).toBe('1000');
  });

  it('render_number1000_showsPlainText1000BelowQrCodeInLeftHalf', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000 });

    // Assert
    const styles = fixture.componentInstance.styles();
    expect(element(fixture, '.label-card__number')?.textContent?.trim()).toBe('1000');
    // Vorgaben auf 105 × 35: Artikel-Nummer beginnt genau an der Unterkante des QR-Codes (23 mm).
    expect(percent(styles.numberText['top'])).toBeCloseTo(percent(styles.qr['top']) + percent(styles.qr['height']));
    expect(percent(styles.numberText['left'])).toBeGreaterThan(percent(styles.qr['left']));
    expect(percent(styles.numberText['left'])).toBeLessThan(50);
  });

  it('render_logoSymbolAndDollar_placesLogoBesideQrSymbolsInCornersAndPriceRight', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000, logo: PNG_LOGO, sellerSymbol: STAR, currencySymbol: '$' });

    // Assert
    const styles = fixture.componentInstance.styles();
    expect(element(fixture, '.label-card__logo')).not.toBeNull();
    expect(percent(styles.logo['left'])).toBeGreaterThan(percent(styles.qr['left']) + percent(styles.qr['width']));
    expect(percent(styles.sellerSymbolTopRight['left'])).toBeGreaterThan(50);
    expect(percent(styles.sellerSymbolTopRight['top'])).toBeLessThan(50);
    expect(percent(styles.sellerSymbolBottomLeft['left'])).toBeLessThan(50);
    expect(percent(styles.sellerSymbolBottomLeft['top'])).toBeGreaterThan(50);
    expect(percent(styles.priceRow['left'])).toBeGreaterThan(50);
    expect(element(fixture, '.label-card__price-row .label-card__price-line')).not.toBeNull();
    expect(element(fixture, '.label-card__price-row .label-card__currency')?.textContent?.trim()).toBe('$');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.label-card__symbol')).toHaveLength(2);
  });

  it('render_withoutLogoAndSymbol_rendersNoGraphic', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000, logo: null, sellerSymbol: null });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-label-graphic')).toHaveLength(0);
    expect(element(fixture, '.label-card__price-line')).not.toBeNull();
  });

  it('render_showFoldLine_rendersFoldLineAtCenter', async () => {
    // Arrange & Act
    const fixture = await render({ showFoldLine: true });

    // Assert
    expect(element(fixture, '.label-card__fold')?.style.left).toBe('50%');
  });

  it('render_foldLineNotRequested_rendersNoFoldLine', async () => {
    // Arrange & Act
    const fixture = await render({ showFoldLine: false });

    // Assert
    expect(element(fixture, '.label-card__fold')).toBeNull();
  });

  it('render_iconSymbol_rendersIconSvg', async () => {
    // Arrange & Act
    const fixture = await render({ sellerSymbol: STAR });

    // Assert
    expect(element(fixture, '.label-card__symbol--top-right svg')).not.toBeNull();
  });

  it('render_imageLogo_rendersImageWithItsDataUrl', async () => {
    // Arrange & Act
    const fixture = await render({ logo: PNG_LOGO });

    // Assert
    expect(element(fixture, '.label-card__logo img')?.getAttribute('src')).toBe(PNG_LOGO.value);
  });

  it('render_svgImageWithScript_rendersOnlyImgSrcNoScriptElement', async () => {
    // Arrange & Act
    const fixture = await render({ logo: SVG_WITH_SCRIPT });

    // Assert
    const logo = element(fixture, '.label-card__logo');
    expect(logo?.querySelectorAll('img')).toHaveLength(1);
    expect(logo?.querySelector('img')?.getAttribute('src')).toBe(SVG_WITH_SCRIPT.value);
    expect(logo?.querySelector('script')).toBeNull();
    expect(logo?.querySelector('svg')).toBeNull();
  });

  it('render_noNumber_rendersNoQrCodeAndNoPlainText', async () => {
    // Arrange & Act
    const fixture = await render({ number: null });

    // Assert
    expect(element(fixture, 'app-qr-code')).toBeNull();
    expect(element(fixture, '.label-card__number')).toBeNull();
  });

  it('styles_halfSizeLabel_keepsElementSizesInMm', async () => {
    // Arrange
    const full = await render({ number: 1000 });
    const fullStyles = full.componentInstance.styles();

    // Act
    const half = await render({ width: 52.5, height: 17.5, number: 1000 });

    // Assert
    const halfStyles = half.componentInstance.styles();
    expect(percent(halfStyles.qr['width'])).toBeCloseTo(percent(fullStyles.qr['width']) * 2);
    expect(percent(halfStyles.numberText['font-size'])).toBeCloseTo(percent(fullStyles.numberText['font-size']) * 2);
    expect(half.componentInstance.aspectRatio()).toBe('52.5 / 17.5');
  });

  // A2
  it('styles_defaultSizes_logoBoxFillsFreeAreaBesideQrCode', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000, logo: PNG_LOGO });

    // Assert
    const logo = fixture.componentInstance.styles().logo;
    expect(percent(logo['left'])).toBeCloseTo((24.5 / 105) * 100);
    expect(percent(logo['top'])).toBeCloseTo((1.5 / 35) * 100);
    expect(percent(logo['width'])).toBeCloseTo((26.5 / 105) * 100);
    expect(percent(logo['height'])).toBeCloseTo((20 / 35) * 100);
    expect(element(fixture, '.label-card__logo')).not.toBeNull();
  });

  it('render_qrCodeBeyondFold_rendersNoLogo', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000, logo: PNG_LOGO, sizes: { ...DEFAULT_LABEL_ELEMENT_SIZES, qrCode: 60 } });

    // Assert
    expect(element(fixture, '.label-card__logo')).toBeNull();
  });

  it('render_numberHigherThanLabel_rendersNoLogo', async () => {
    // Arrange & Act
    const fixture = await render({ number: 1000, logo: PNG_LOGO, sizes: { ...DEFAULT_LABEL_ELEMENT_SIZES, numberHeight: 40 } });

    // Assert
    expect(element(fixture, '.label-card__logo')).toBeNull();
  });

  // A5: Schreiblinie füllt den Rest der Preiszeile, das Währungssymbol behält seine Breite.
  it('render_priceRow_lineGrowsAndCurrencyKeepsItsWidth', async () => {
    // Arrange & Act
    const fixture = await render({ currencySymbol: '€' });

    // Assert
    const row = getComputedStyle(element(fixture, '.label-card__price-row') as HTMLElement);
    const line = getComputedStyle(element(fixture, '.label-card__price-line') as HTMLElement);
    const currency = getComputedStyle(element(fixture, '.label-card__currency') as HTMLElement);
    expect(row.display).toBe('flex');
    expect(line.flexGrow).toBe('1');
    expect(line.minWidth).toBe('0px');
    expect(currency.flexShrink).toBe('0');
  });

  // A5
  it('render_currencyHeight9_priceRowHasLineThenCurrencyWithFontInCqw', async () => {
    // Arrange & Act
    const fixture = await render({ currencySymbol: '€', sizes: { ...DEFAULT_LABEL_ELEMENT_SIZES, currencyHeight: 9 } });

    // Assert
    const row = element(fixture, '.label-card__price-row');
    const children = Array.from(row?.children ?? []).map((child) => child.className);
    expect(children).toEqual(['label-card__price-line', 'label-card__currency']);
    expect(row?.style.fontSize).toBe(`${(9 / 105) * 100}cqw`);
    const styles = fixture.componentInstance.styles().priceRow;
    expect(percent(styles['left']) + percent(styles['width'])).toBeCloseTo((103.5 / 105) * 100);
  });

  // A5: Ein überbreites Währungssymbol läuft nach links über, die rechte Kante bleibt bei width − 1,5 k.
  // jsdom rechnet kein Layout, daher Prüfung über die Ausrichtung der Flex-Zeile.
  it('render_oversizedCurrency_keepsCurrencyRightAligned', async () => {
    // Arrange & Act
    const fixture = await render({ currencySymbol: 'EUR', sizes: { ...DEFAULT_LABEL_ELEMENT_SIZES, currencyHeight: 100 } });

    // Assert
    const row = getComputedStyle(element(fixture, '.label-card__price-row') as HTMLElement);
    expect(row.justifyContent).toBe('flex-end');
  });
});
