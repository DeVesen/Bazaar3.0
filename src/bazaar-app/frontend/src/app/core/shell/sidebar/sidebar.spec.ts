import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Sidebar } from './sidebar';
import { AuthService } from '../../auth/auth.service';
import { RoleService } from '../../auth/role.service';

describe('Sidebar', () => {
  function createSidebar(role: 'admin' | 'cashier') {
    const authService = {
      currentUser: signal({
        sub: '1',
        name: 'Sven',
        role,
        mustChangePassword: false,
        exp: 9999999999,
      }),
      logout: vi.fn(),
    } as unknown as AuthService;
    const roleService = { isAdmin: signal(role === 'admin') } as unknown as RoleService;

    TestBed.overrideProvider(AuthService, { useValue: authService });
    TestBed.overrideProvider(RoleService, { useValue: roleService });

    const fixture = TestBed.createComponent(Sidebar);
    return { fixture, authService };
  }

  async function openFooterMenu(fixture: ReturnType<typeof TestBed.createComponent<Sidebar>>): Promise<void> {
    const footer = (fixture.nativeElement as HTMLElement).querySelector('p-sidebar-footer') as HTMLElement;
    footer.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('hides "Einstellungen" for role cashier', async () => {
    const { fixture } = createSidebar('cashier');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Einstellungen');
  });

  it('shows "Einstellungen" for role admin', async () => {
    const { fixture } = createSidebar('admin');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Einstellungen');
  });

  it('renders no p-badge since openArticlesCount has no external data source yet', async () => {
    const { fixture } = createSidebar('admin');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-badge')).toBeNull();
  });

  it('opens the footer popover when the avatar/name area is clicked', async () => {
    const { fixture } = createSidebar('admin');
    await fixture.whenStable();
    const popover = fixture.componentInstance.footerMenu();
    const toggleSpy = vi.spyOn(popover, 'toggle');

    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('p-sidebar-footer') as HTMLElement;
    const clickEvent = new MouseEvent('click');
    footer.dispatchEvent(clickEvent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toggleSpy).toHaveBeenCalledExactlyOnceWith(clickEvent);
    expect(popover.overlayVisible()).toBe(true);
    expect(document.querySelector('.p-popover')).not.toBeNull();
  });

  it('calls authService.logout() and navigates to /login when "Abmelden" in the popover is clicked', async () => {
    const { fixture, authService } = createSidebar('admin');
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');
    await fixture.whenStable();
    await openFooterMenu(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll('button'));
    const logoutButton = buttons.find((button) => button.textContent?.includes('Abmelden'));
    logoutButton?.click();

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login');
  });

  it('"Passwort ändern" in the popover links to /change-password', async () => {
    const { fixture } = createSidebar('admin');
    await fixture.whenStable();
    await openFooterMenu(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const changePasswordLink = compiled.querySelector('[routerLink="/change-password"]');

    expect(changePasswordLink).not.toBeNull();
    expect(changePasswordLink?.textContent).toContain('Passwort ändern');
  });
});
