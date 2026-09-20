import { TestBed } from '@angular/core/testing';
import { UserDialog } from './user-dialog';

describe('UserDialog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDialog],
    }).compileComponents();
  });

  describe('create mode', () => {
    it('renders username, role and initial password fields', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('input[name="username"]')).not.toBeNull();
      expect(compiled.querySelector('p-select[name="role"]')).not.toBeNull();
      expect(compiled.querySelector('input[name="initialPassword"]')).not.toBeNull();
    });

    it('shows the forced-change hint', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Wird beim ersten Login zum Ändern verlangt.',
      );
    });

    it('does not show the role-change-timing hint', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
        'Rollenwechsel wirkt erst beim nächsten Login.',
      );
    });

    it('starts with empty fields', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      expect(component.username()).toBe('');
      expect(component.role()).toBeNull();
      expect(component.initialPassword()).toBe('');
    });

    it('does not allow save until username, role and a >=8-char password are set', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      const component = fixture.componentInstance;
      await fixture.whenStable();

      expect(component.canSave()).toBe(false);

      component.username.set('kasse3');
      expect(component.canSave()).toBe(false);

      component.role.set('cashier');
      expect(component.canSave()).toBe(false);

      component.initialPassword.set('short');
      expect(component.canSave()).toBe(false);

      component.initialPassword.set('longenough');
      expect(component.canSave()).toBe(true);
    });

    it('emits save with username/role/initialPassword and null newPassword', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      const component = fixture.componentInstance;
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);
      await fixture.whenStable();

      component.username.set('  kasse3  ');
      component.role.set('cashier');
      component.initialPassword.set('longenough');
      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith({
        username: 'kasse3',
        role: 'cashier',
        initialPassword: 'longenough',
        newPassword: null,
      });
    });
  });

  describe('edit mode', () => {
    it('renders no username field', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      await fixture.whenStable();

      expect(
        (fixture.nativeElement as HTMLElement).querySelector('input[name="username"]'),
      ).toBeNull();
    });

    it('pre-fills the role from initialValue', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      await fixture.whenStable();

      expect(fixture.componentInstance.role()).toBe('admin');
    });

    it('shows the role-change-timing hint', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Rollenwechsel wirkt erst beim nächsten Login.',
      );
    });

    it('does not show the forced-change hint until "Neues Passwort setzen" is checked', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      const component = fixture.componentInstance;
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
        'Wird beim ersten Login zum Ändern verlangt.',
      );

      component.setNewPassword.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Wird beim ersten Login zum Ändern verlangt.',
      );
    });

    it('allows save with only the role set (no password change)', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      const component = fixture.componentInstance;
      await fixture.whenStable();

      expect(component.canSave()).toBe(true);
    });

    it('requires >=8 chars once "Neues Passwort setzen" is checked', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      const component = fixture.componentInstance;
      await fixture.whenStable();

      component.setNewPassword.set(true);
      expect(component.canSave()).toBe(false);

      component.newPassword.set('short');
      expect(component.canSave()).toBe(false);

      component.newPassword.set('longenough');
      expect(component.canSave()).toBe(true);
    });

    it('emits save with role and newPassword null when "Neues Passwort setzen" stays unchecked', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      const component = fixture.componentInstance;
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);
      await fixture.whenStable();

      component.role.set('cashier');
      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith({
        username: null,
        role: 'cashier',
        initialPassword: null,
        newPassword: null,
      });
    });

    it('emits save with the new password when "Neues Passwort setzen" is checked', async () => {
      const fixture = TestBed.createComponent(UserDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('initialValue', { role: 'admin' });
      const component = fixture.componentInstance;
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);
      await fixture.whenStable();

      component.setNewPassword.set(true);
      component.newPassword.set('longenough');
      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith({
        username: null,
        role: 'admin',
        initialPassword: null,
        newPassword: 'longenough',
      });
    });
  });

  it('does not emit save while saving is true', async () => {
    const fixture = TestBed.createComponent(UserDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('saving', true);
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.username.set('kasse3');
    component.role.set('cashier');
    component.initialPassword.set('longenough');
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('emits cancel and visibleChange(false) on cancel', async () => {
    const fixture = TestBed.createComponent(UserDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const cancelSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);
    component.visibleChange.subscribe(visibleChangeSpy);
    await fixture.whenStable();

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('displays a server-side field error', async () => {
    const fixture = TestBed.createComponent(UserDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('serverErrors', { username: 'Benutzername bereits vergeben' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Benutzername bereits vergeben',
    );
  });
});
