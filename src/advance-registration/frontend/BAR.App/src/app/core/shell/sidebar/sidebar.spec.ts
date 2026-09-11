import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Sidebar } from './sidebar';
import { AuthService } from '@core/auth/auth.service';
import { RoleService } from '@core/auth/role.service';

describe('Sidebar', () => {
  function setup(role: 'admin' | 'seller') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'u', role, exp: 0 }) } },
        { provide: RoleService, useValue: { activeRole: () => role, setRole: () => undefined } }
      ]
    });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    return fixture;
  }

  it('renders four groups with ten items for an admin', () => {
    const fixture = setup('admin');
    const items = fixture.debugElement.queryAll(By.css('[data-nav-item]'));
    const groups = fixture.debugElement.queryAll(By.css('[data-nav-group]'));
    expect(groups.length).toBe(4);
    expect(items.length).toBe(10);
  });

  it('renders two groups with four items for a seller', () => {
    const fixture = setup('seller');
    const items = fixture.debugElement.queryAll(By.css('[data-nav-item]'));
    const groups = fixture.debugElement.queryAll(By.css('[data-nav-group]'));
    expect(groups.length).toBe(2);
    expect(items.length).toBe(4);
  });

  it('shows the role toggle only for admin', () => {
    expect(setup('admin').debugElement.query(By.css('[data-role-toggle]'))).toBeTruthy();
    expect(setup('seller').debugElement.query(By.css('[data-role-toggle]'))).toBeFalsy();
  });
});
