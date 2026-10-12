import { TestBed } from '@angular/core/testing';
import { SellerCardSkeleton } from './seller-card-skeleton';

describe('SellerCardSkeleton', () => {
  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [SellerCardSkeleton] }).compileComponents();
    const fixture = TestBed.createComponent(SellerCardSkeleton);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('render_default_showsAreasForNameAddressStatusFourStatsAndThreeFooterValues', async () => {
    // Arrange / Act
    const host = await render();

    // Assert
    const single = (cls: string) => host.querySelectorAll(`.seller-card-skeleton__${cls}`);
    expect(single('name').length).toBe(1);
    expect(single('address').length).toBe(1);
    expect(single('status').length).toBe(1);
    expect(single('stat').length).toBe(4);
    expect(single('footer-item').length).toBe(3);
  });

  it('render_default_fillsEveryAreaWithPSkeleton', async () => {
    // Arrange / Act
    const host = await render();

    // Assert
    const areas = host.querySelectorAll(
      '.seller-card-skeleton__name, .seller-card-skeleton__address, .seller-card-skeleton__status, .seller-card-skeleton__stat, .seller-card-skeleton__footer-item',
    );
    expect(areas.length).toBe(10);
    areas.forEach((area) => {
      expect(area.querySelectorAll('p-skeleton').length).toBeGreaterThan(0);
    });
  });

  it('render_default_marksHostAriaHiddenSoScreenReadersSkipIt', async () => {
    // Arrange / Act
    const host = await render();

    // Assert
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
