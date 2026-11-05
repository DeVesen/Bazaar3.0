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

  it('render_margin0AndSize0_modulesStartAtOriginWithoutPadding', async () => {
    // Arrange
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', '11111');
    fixture.componentRef.setInput('size', 0);
    fixture.componentRef.setInput('margin', 0);

    // Act
    await fixture.whenStable();

    // Assert
    const svg = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__image svg');
    const modules = [...(svg?.querySelectorAll('rect') ?? [])].slice(1);
    const right = Math.max(...modules.map((r) => Number(r.getAttribute('x')) + Number(r.getAttribute('width'))));
    const bottom = Math.max(...modules.map((r) => Number(r.getAttribute('y')) + Number(r.getAttribute('height'))));
    expect(modules[0].getAttribute('x')).toBe('0');
    expect(modules[0].getAttribute('y')).toBe('0');
    expect(right).toBe(Number(svg?.getAttribute('width')));
    expect(bottom).toBe(Number(svg?.getAttribute('height')));
  });

  it('renders a fixed white background rect covering the full SVG behind the modules', async () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.componentRef.setInput('size', 128);
    await fixture.whenStable();

    const svg = (fixture.nativeElement as HTMLElement).querySelector('.qr-code__image svg');
    const rects = svg?.querySelectorAll('rect');
    const background = rects?.[0];

    expect(background?.getAttribute('fill')).toBe('#fff');
    expect(background?.getAttribute('x')).toBe('0');
    expect(background?.getAttribute('y')).toBe('0');
    expect(background?.getAttribute('width')).toBe(svg?.getAttribute('width'));
    expect(background?.getAttribute('height')).toBe(svg?.getAttribute('height'));
  });
});
