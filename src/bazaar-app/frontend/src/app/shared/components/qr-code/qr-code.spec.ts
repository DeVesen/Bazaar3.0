import { TestBed } from '@angular/core/testing';
import { QrCode } from './qr-code';

describe('QrCode', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCode],
    }).compileComponents();
  });

  it('renders an inline SVG for a valid value', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    await fixture.whenStable();

    const svg = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__image svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('width')).toBe('128');
    expect(svg?.getAttribute('height')).toBe('128');
  });

  it('renders nothing for an empty value', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', '');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.qr-code')).toBeNull();
  });

  it('renders nothing for a whitespace-only value', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', '   ');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.qr-code')).toBeNull();
  });

  it('renders the caption when set and omits it when not set', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.componentRef.setInput('caption', 'a3f9c2d1');
    await fixture.whenStable();

    let caption = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__caption');
    expect(caption?.textContent).toBe('a3f9c2d1');

    fixture.componentRef.setInput('caption', null);
    await fixture.whenStable();

    caption = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__caption');
    expect(caption).toBeNull();
  });

  it('regenerates the SVG when value changes', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    await fixture.whenStable();

    const firstMarkup = (fixture.nativeElement as HTMLElement).querySelector(
      '.qr-code__image',
    )?.innerHTML;

    fixture.componentRef.setInput('value', 'b7e1f4a0');
    await fixture.whenStable();

    const secondMarkup = (fixture.nativeElement as HTMLElement).querySelector(
      '.qr-code__image',
    )?.innerHTML;

    expect(secondMarkup).not.toBe(firstMarkup);
  });

  it('renders at the requested size', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.componentRef.setInput('size', 200);
    await fixture.whenStable();

    const svg = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__image svg');
    expect(svg?.getAttribute('width')).toBe('200');
    expect(svg?.getAttribute('height')).toBe('200');
  });
});
