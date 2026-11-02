import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LabelCard } from './label-card';
import { LabelGraphic } from './label-graphic';
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
    expect(percent(styles.numberText['top'])).toBeGreaterThan(percent(styles.qr['top']) + percent(styles.qr['height']));
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
    expect(percent(styles.priceLine['left'])).toBeGreaterThan(50);
    expect(element(fixture, '.label-card__price-line')).not.toBeNull();
    expect(element(fixture, '.label-card__currency')?.textContent?.trim()).toBe('$');
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

  it('styles_halfSizeLabel_keepsSamePercentagesAsFullSize', async () => {
    // Arrange
    const full = await render({ number: 1000 });
    const fullStyles = full.componentInstance.styles();

    // Act
    const half = await render({ width: 52.5, height: 17.5, number: 1000 });

    // Assert
    const halfStyles = half.componentInstance.styles();
    expect(percent(halfStyles.qr['width'])).toBeCloseTo(percent(fullStyles.qr['width']));
    expect(halfStyles.numberText['font-size']).toBe(fullStyles.numberText['font-size']);
    expect(half.componentInstance.aspectRatio()).toBe('52.5 / 17.5');
  });
});
