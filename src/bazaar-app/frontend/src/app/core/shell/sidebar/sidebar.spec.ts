import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    })
      .compileComponents();
  });

  function createSidebar(role: 'admin' | 'cashier', openArticlesCount?: number) {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('role', role);
    fixture.componentRef.setInput('username', 'Sven');
    fixture.componentRef.setInput('roleLabel', role === 'admin' ? 'Admin' : 'Kasse');
    if (openArticlesCount !== undefined) {
      fixture.componentRef.setInput('openArticlesCount', openArticlesCount);
    }
    return fixture;
  }

  it('hides "Einstellungen" for role cashier', async () => {
    const fixture = createSidebar('cashier');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Einstellungen');
  });

  it('shows "Einstellungen" for role admin', async () => {
    const fixture = createSidebar('admin');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Einstellungen');
  });

  it('renders no p-badge when openArticlesCount is 0', async () => {
    const fixture = createSidebar('admin', 0);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-badge')).toBeNull();
  });

  it('renders a p-badge with value 3 when openArticlesCount is 3', async () => {
    const fixture = createSidebar('admin', 3);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('p-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('3');
  });

  it('emits logoutClicked when the "Abmelden" button is clicked', async () => {
    const fixture = createSidebar('admin');
    await fixture.whenStable();
    const emitted: void[] = [];
    fixture.componentInstance.logoutClicked.subscribe(() => emitted.push(undefined));

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll('button'));
    const logoutButton = buttons.find((button) => button.textContent?.includes('Abmelden'));
    logoutButton?.click();

    expect(emitted.length).toBe(1);
  });
});
