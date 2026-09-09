import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Shell } from './shell';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../auth/role.service';

describe('Shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        MessageService,
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'u', role: 'admin', exp: 0 }) } },
        { provide: RoleService, useValue: { activeRole: () => 'admin', setRole: () => undefined } }
      ]
    });
  });

  it('starts with the sidebar open on a desktop-width viewport', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeTruthy();
  });

  it('renders a single trigger button in the content header', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const triggers = fixture.debugElement.queryAll(By.css('[data-sidebar-trigger]'));
    expect(triggers.length).toBe(1);
  });

  it('renders a single p-toast for app-wide notifications', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-toast')).not.toBeNull();
  });
});
