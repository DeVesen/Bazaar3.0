import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelGraphic } from './label-graphic';
import { LabelGraphicView } from './label-graphic-view';

const STAR: LabelGraphic = { kind: 'icon', value: 'star' };
const PNG_LOGO: LabelGraphic = { kind: 'image', value: 'data:image/png;base64,AAAA' };

async function render(graphic: LabelGraphic): Promise<ComponentFixture<LabelGraphicView>> {
  const fixture = TestBed.createComponent(LabelGraphicView);
  fixture.componentRef.setInput('graphic', graphic);
  await fixture.whenStable();
  return fixture;
}

// A2/E8: Logo in nicht quadratischer Fläche – eingepasst, zentriert, nie verzerrt.
describe('LabelGraphicView', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelGraphicView] }).compileComponents();
  });

  it('render_image_fitsImageWithObjectFitContain', async () => {
    // Arrange & Act
    const fixture = await render(PNG_LOGO);

    // Assert
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(image).not.toBeNull();
    expect(getComputedStyle(image as HTMLImageElement).objectFit).toBe('contain');
  });

  it('render_image_centersImageInItsBox', async () => {
    // Arrange & Act
    const fixture = await render(PNG_LOGO);

    // Assert
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(image).not.toBeNull();
    expect(getComputedStyle(image as HTMLImageElement).objectPosition).toBe('50% 50%');
  });

  it('render_icon_keepsAspectRatioOfSvg', async () => {
    // Arrange & Act
    const fixture = await render(STAR);

    // Assert
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('preserveAspectRatio')).not.toBe('none');
    expect(svg?.getAttribute('viewBox')).not.toBeNull();
  });

  // Fehlendes Attribut bedeutet SVG-Default „xMidYMid meet“ (zentriert).
  it('render_icon_centersSvgContent', async () => {
    // Arrange & Act
    const fixture = await render(STAR);

    // Assert
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');
    expect(svg).not.toBeNull();
    const preserveAspectRatio = svg?.getAttribute('preserveAspectRatio');
    if (preserveAspectRatio !== null && preserveAspectRatio !== undefined) {
      expect(preserveAspectRatio.startsWith('xMidYMid')).toBe(true);
    }
  });
});
