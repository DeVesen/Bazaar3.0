import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { UserManagement } from './user-management';
import { AppUser, UsersApi } from '../../data/users-api';

function appUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    id: 'u1',
    username: 'anna',
    role: 'admin',
    mustChangePassword: false,
    ...overrides,
  };
}

describe('UserManagement', () => {
  let getAll: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;
  let confirmCalls: { key?: string; header?: string; message?: string; accept?: () => void }[];

  beforeEach(async () => {
    getAll = vi.fn().mockReturnValue(of([appUser()]));
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    messageServiceAdd = vi.fn();
    confirmCalls = [];

    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        { provide: UsersApi, useValue: { getAll, create, update, remove } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
        // Real ConfirmationService (same pattern as sellers-page.spec.ts) — `p-confirmdialog`
        // subscribes to its `requireConfirmation$` in its own constructor, which a bare
        // `useValue` mock doesn't provide and would crash on render. `confirm()` itself is
        // spied below to capture the options without opening the real overlay.
        ConfirmationService,
      ],
    }).compileComponents();

    const confirmationService = TestBed.inject(ConfirmationService);
    vi.spyOn(confirmationService, 'confirm').mockImplementation(
      (options: { key?: string; header?: string; message?: string; accept?: () => void }) => {
        confirmCalls.push(options);
        return confirmationService;
      },
    );
  });

  async function createComponent() {
    const fixture = TestBed.createComponent(UserManagement);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('loads users on construction', async () => {
    await createComponent();
    expect(getAll).toHaveBeenCalled();
  });

  it('maps users into rows with a German role label and pending-change label', async () => {
    getAll.mockReturnValue(
      of([
        appUser({ id: 'u1', username: 'anna', role: 'admin', mustChangePassword: false }),
        appUser({ id: 'u2', username: 'kasse1', role: 'cashier', mustChangePassword: true }),
      ]),
    );
    const { component } = await createComponent();

    expect(component.rows()).toEqual([
      expect.objectContaining({ username: 'anna', roleLabel: 'Admin', mustChangePasswordLabel: '—' }),
      expect.objectContaining({
        username: 'kasse1',
        roleLabel: 'Kassenpersonal',
        mustChangePasswordLabel: 'Wechsel offen',
      }),
    ]);
  });

  it('rowAdd opens the dialog in create mode with no initial value and clears serverErrors', async () => {
    const { component } = await createComponent();

    component.onRowAdd();

    expect(component.dialogVisible()).toBe(true);
    expect(component.dialogMode()).toBe('create');
    expect(component.dialogInitialValue()).toBeNull();
    expect(component.serverErrors()).toBeNull();
  });

  it('edit action opens the dialog in edit mode pre-filled with the row role', async () => {
    const { component } = await createComponent();
    const row = appUser({ id: 'u2', username: 'kasse1', role: 'cashier' });

    component.onActionClick({ actionId: 'edit', row: { ...row, roleLabel: 'Kassenpersonal', mustChangePasswordLabel: '—' } });

    expect(component.dialogVisible()).toBe(true);
    expect(component.dialogMode()).toBe('edit');
    expect(component.dialogInitialValue()).toEqual({ role: 'cashier' });
  });

  describe('save', () => {
    it('in create mode calls UsersApi.create and shows a success toast', async () => {
      create.mockReturnValue(of(appUser()));
      const { component } = await createComponent();
      component.onRowAdd();

      component.onDialogSave({
        username: 'kasse3',
        role: 'cashier',
        initialPassword: 'longenough',
        newPassword: null,
      });

      expect(create).toHaveBeenCalledWith('kasse3', 'cashier', 'longenough');
      expect(update).not.toHaveBeenCalled();
      expect(component.dialogVisible()).toBe(false);
      expect(component.saving()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Benutzer gespeichert' }),
      );
    });

    it('in edit mode calls UsersApi.update with the editing user id, role and newPassword', async () => {
      update.mockReturnValue(of(undefined));
      const { component } = await createComponent();
      const row = appUser({ id: 'u1', role: 'admin' });
      component.onActionClick({ actionId: 'edit', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });

      component.onDialogSave({ username: null, role: 'cashier', initialPassword: null, newPassword: 'longenough' });

      expect(update).toHaveBeenCalledWith('u1', 'cashier', 'longenough');
      expect(create).not.toHaveBeenCalled();
      expect(component.dialogVisible()).toBe(false);
    });

    it('on 400 validation error keeps the dialog open and sets serverErrors', async () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { errors: { initialPassword: ['Muss mindestens 8 Zeichen lang sein.'] } },
      });
      create.mockReturnValue(throwError(() => error));
      const { component } = await createComponent();
      component.onRowAdd();

      component.onDialogSave({ username: 'x', role: 'cashier', initialPassword: 'short', newPassword: null });

      expect(component.dialogVisible()).toBe(true);
      expect(component.saving()).toBe(false);
      expect(component.serverErrors()).toEqual(
        expect.objectContaining({ initialPassword: 'Muss mindestens 8 Zeichen lang sein.' }),
      );
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });

    it('on user.username_taken (create) shows an error toast', async () => {
      const error = new HttpErrorResponse({ status: 409, error: { errorCode: 'user.username_taken' } });
      create.mockReturnValue(throwError(() => error));
      const { component } = await createComponent();
      component.onRowAdd();

      component.onDialogSave({ username: 'anna', role: 'admin', initialPassword: 'longenough', newPassword: null });

      expect(component.dialogVisible()).toBe(true);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Benutzername bereits vergeben' }),
      );
    });

    it('on user.last_admin (edit, demoting the last admin) shows an error toast', async () => {
      const error = new HttpErrorResponse({ status: 409, error: { errorCode: 'user.last_admin' } });
      update.mockReturnValue(throwError(() => error));
      const { component } = await createComponent();
      const row = appUser({ id: 'u1', role: 'admin' });
      component.onActionClick({ actionId: 'edit', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });

      component.onDialogSave({ username: null, role: 'cashier', initialPassword: null, newPassword: null });

      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('delete', () => {
    it('shows a confirmation before calling UsersApi.remove', async () => {
      const { component } = await createComponent();
      const row = appUser();

      component.onActionClick({ actionId: 'delete', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });

      expect(confirmCalls).toHaveLength(1);
      expect(confirmCalls[0].key).toBe('deleteUser');
      expect(remove).not.toHaveBeenCalled();
    });

    it('on confirm accept calls UsersApi.remove and reloads the list', async () => {
      remove.mockReturnValue(of(undefined));
      const { component } = await createComponent();
      const row = appUser();
      getAll.mockClear();

      component.onActionClick({ actionId: 'delete', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });
      confirmCalls[0].accept?.();

      expect(remove).toHaveBeenCalledWith('u1');
      expect(getAll).toHaveBeenCalled();
    });

    it('on 409 user.last_admin shows an error toast and does not remove the row', async () => {
      const error = new HttpErrorResponse({ status: 409, error: { errorCode: 'user.last_admin' } });
      remove.mockReturnValue(throwError(() => error));
      const { component } = await createComponent();
      const row = appUser();

      component.onActionClick({ actionId: 'delete', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });
      confirmCalls[0].accept?.();

      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Letztes Admin-Konto kann nicht gelöscht werden' }),
      );
      expect(component.users()).toEqual([row]);
    });
  });

  describe('cancel', () => {
    it('closes the dialog and clears the editing state and serverErrors', async () => {
      const { component } = await createComponent();
      const row = appUser();
      component.onActionClick({ actionId: 'edit', row: { ...row, roleLabel: 'Admin', mustChangePasswordLabel: '—' } });

      component.onDialogCancel();

      expect(component.dialogVisible()).toBe(false);
      expect(component.dialogInitialValue()).toBeNull();
      expect(component.serverErrors()).toBeNull();
    });
  });
});
