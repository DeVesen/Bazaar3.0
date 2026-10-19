import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { DevToolsPanel } from './dev-tools-panel';
import { DevToolsApi } from '../../data/dev-tools-api';
import { AuthService } from '../../../../core/auth/auth.service';

describe('DevToolsPanel', () => {
  let isDevelopment$: ReturnType<typeof vi.fn>;
  let resetDatabase$: ReturnType<typeof vi.fn>;
  let authService: { logout: ReturnType<typeof vi.fn> };
  let reloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    isDevelopment$ = vi.fn().mockReturnValue(of(true));
    resetDatabase$ = vi.fn().mockReturnValue(of(undefined));
    authService = { logout: vi.fn() };

    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [DevToolsPanel],
      providers: [
        { provide: DevToolsApi, useValue: { isDevelopment: isDevelopment$, resetDatabase: resetDatabase$ } },
        { provide: AuthService, useValue: authService },
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('hides itself when not running in Development', () => {
    isDevelopment$.mockReturnValue(of(false));
    const fixture = TestBed.createComponent(DevToolsPanel);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dev-tools-panel')).toBeNull();
  });

  it('shows the reset button disabled until RESET is typed', () => {
    const fixture = TestBed.createComponent(DevToolsPanel);
    fixture.detectChanges();

    expect(fixture.componentInstance.canReset()).toBe(false);

    fixture.componentInstance.confirmText.set('RESET');
    expect(fixture.componentInstance.canReset()).toBe(true);
  });

  it('resets the database, logs out and reloads once confirmed', () => {
    const fixture = TestBed.createComponent(DevToolsPanel);
    fixture.detectChanges();
    fixture.componentInstance.confirmText.set('RESET');

    fixture.componentInstance.resetDatabase();

    expect(resetDatabase$).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('does nothing when the confirm phrase does not match', () => {
    const fixture = TestBed.createComponent(DevToolsPanel);
    fixture.detectChanges();
    fixture.componentInstance.confirmText.set('reset');

    fixture.componentInstance.resetDatabase();

    expect(resetDatabase$).not.toHaveBeenCalled();
  });

  it('shows an error and re-enables the button when the reset fails', () => {
    resetDatabase$.mockReturnValue(throwError(() => new Error('boom')));
    const fixture = TestBed.createComponent(DevToolsPanel);
    fixture.detectChanges();
    fixture.componentInstance.confirmText.set('RESET');

    fixture.componentInstance.resetDatabase();

    expect(fixture.componentInstance.resetting()).toBe(false);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('template_development_showsHeadingDatenbankZuruecksetzen', () => {
    // Arrange
    const fixture = TestBed.createComponent(DevToolsPanel);

    // Act
    fixture.detectChanges();

    // Assert
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dev-tools-panel__title')?.textContent?.trim()).toBe('Datenbank zurücksetzen');
    expect(el.textContent).not.toContain('Entwickler-Werkzeuge');
  });
});
