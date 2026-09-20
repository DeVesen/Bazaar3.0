import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActionClickEvent, ActionColumnConfig, ColumnConfig, Table } from '../../../../shared/components/table/table';
import {
  UserDialog,
  UserDialogInitialValue,
  UserDialogResult,
  UserDialogServerErrors,
} from '../user-dialog/user-dialog';
import { AppUser, UsersApi } from '../../data/users-api';

const EMPTY_TEXT = 'Noch keine Benutzer.';
const ROLE_LABELS: Record<AppUser['role'], string> = {
  admin: 'Admin',
  cashier: 'Kassenpersonal',
};
const PENDING_CHANGE_LABEL = 'Wechsel offen';

interface ValidationProblemBody {
  errors?: Record<string, string[]>;
}

interface ProblemDetailsBody {
  errorCode?: string;
}

/** Row shape actually handed to `<app-table>` — adds the German display label for `role`
 * (UI text, not API contract, see task-C-brief.md) without mutating `AppUser` itself. */
interface UserRow extends AppUser {
  roleLabel: string;
  mustChangePasswordLabel: string;
}

/**
 * `user-management` (docs/requirements/bazaar-app/components/user-management.md, Round-27
 * Task C). Self-contained smart component mirroring `SellerTypesPage`'s shape — no dedicated
 * store, `UsersApi` is called directly (same pattern as `SettingsForm`/`ImportPanel`, the other
 * `settings/` components).
 *
 * Admin-only gating: the whole `/settings` route already carries `adminGuard`
 * (`app.routes.ts`), and neither sibling component (`SettingsForm`, `ImportPanel`) re-checks
 * `RoleService.isAdmin` internally — this component follows the same convention and does not
 * duplicate the gate.
 *
 * Table-vs-p-table judgement call (see task-C-brief.md "Ruling"): reuses the shared `Table`
 * component like `SellerTypesPage` does, rather than hand-rolling `p-table` markup — its
 * `type: 'text'`/`type: 'badge'` column config already covers everything this screen needs.
 * Not paginated per AC-1: passes `[paginator]="false"` explicitly rather than relying on the
 * row-count threshold, since a future large-enough test fixture must never accidentally
 * paginate this screen.
 */
@Component({
  selector: 'app-user-management',
  imports: [Table, UserDialog, ConfirmDialogModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagement {
  private readonly usersApi = inject(UsersApi);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly users = signal<AppUser[]>([]);
  readonly loading = signal(false);
  readonly emptyText = EMPTY_TEXT;

  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly editingUser = signal<AppUser | null>(null);
  readonly saving = signal(false);
  readonly serverErrors = signal<UserDialogServerErrors | null>(null);

  readonly columns: ColumnConfig[] = [
    { field: 'username', header: 'Benutzername', type: 'text', filterable: false },
    { field: 'roleLabel', header: 'Rolle', type: 'text', filterable: false },
    {
      field: 'mustChangePasswordLabel',
      header: 'Status',
      type: 'badge',
      filterable: false,
      // Component spec's ASCII mock (§1) shows the "no pending change" case as plain "—" text,
      // not a badge — see task-C-brief.md. `Table`'s badge column has no built-in way to render
      // a plain-text fallback per row, so the "—" case still renders as a (neutral) badge; this
      // is a minor visual deviation from the mock, called out here rather than hand-rolling a
      // raw `p-table` just for this one cell.
      badgeSeverity: (value) => (value === PENDING_CHANGE_LABEL ? 'warn' : 'secondary'),
    },
  ];

  readonly actionColumn: ActionColumnConfig = {
    buttons: [
      { actionId: 'edit', icon: 'pi pi-pencil', tooltip: 'Bearbeiten' },
      { actionId: 'delete', icon: 'pi pi-trash', tooltip: 'Löschen' },
    ],
  };

  readonly rows = computed<UserRow[]>(() =>
    this.users().map((user) => ({
      ...user,
      roleLabel: ROLE_LABELS[user.role],
      mustChangePasswordLabel: user.mustChangePassword ? PENDING_CHANGE_LABEL : '—',
    })),
  );

  readonly dialogInitialValue = computed<UserDialogInitialValue | null>(() => {
    const user = this.editingUser();
    return user ? { role: user.role } : null;
  });

  constructor() {
    this.load();
  }

  onRowAdd(): void {
    this.editingUser.set(null);
    this.dialogMode.set('create');
    this.serverErrors.set(null);
    this.dialogVisible.set(true);
  }

  onActionClick(event: ActionClickEvent<UserRow>): void {
    const user: AppUser = event.row;
    if (event.actionId === 'edit') {
      this.editingUser.set(user);
      this.dialogMode.set('edit');
      this.serverErrors.set(null);
      this.dialogVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(user);
    }
  }

  onDialogSave(result: UserDialogResult): void {
    const editing = this.editingUser();
    this.saving.set(true);

    const onSuccess = (): void => {
      this.saving.set(false);
      this.dialogVisible.set(false);
      this.editingUser.set(null);
      this.serverErrors.set(null);
      this.messageService.add({ severity: 'success', summary: '✓ Benutzer gespeichert' });
      this.load();
    };
    const onError = (error: unknown): void => {
      this.saving.set(false);

      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.serverErrors.set(this.fieldErrorsOf(error));
        return;
      }
      if (!editing && this.errorCodeOf(error) === 'user.username_taken') {
        this.messageService.add({
          severity: 'error',
          summary: 'Benutzername bereits vergeben',
        });
        return;
      }
      if (editing && this.errorCodeOf(error) === 'user.last_admin') {
        this.messageService.add({
          severity: 'error',
          summary: 'Letztem Admin kann die Rolle nicht entzogen werden',
        });
        return;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Benutzer konnte nicht gespeichert werden',
      });
    };

    if (editing) {
      this.usersApi
        .update(editing.id, result.role, result.newPassword)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.usersApi
        .create(result.username ?? '', result.role, result.initialPassword ?? '')
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  onDialogCancel(): void {
    this.dialogVisible.set(false);
    this.editingUser.set(null);
    this.serverErrors.set(null);
  }

  private confirmDelete(user: AppUser): void {
    this.confirmationService.confirm({
      key: 'deleteUser',
      header: 'Benutzer löschen',
      message: `Benutzer „${user.username}" wird endgültig gelöscht. Fortfahren?`,
      accept: () => this.deleteUser(user),
    });
  }

  private deleteUser(user: AppUser): void {
    this.usersApi.remove(user.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        if (this.errorCodeOf(error) === 'user.last_admin') {
          this.messageService.add({
            severity: 'error',
            summary: 'Letztes Admin-Konto kann nicht gelöscht werden',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Benutzer konnte nicht gelöscht werden',
        });
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.usersApi.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Benutzerliste konnte nicht geladen werden',
        });
      },
    });
  }

  private errorCodeOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.errorCode;
  }

  private fieldErrorsOf(error: HttpErrorResponse): UserDialogServerErrors {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    const firstMessage = (key: string): string | undefined => errors[key]?.[0];
    return {
      username: firstMessage('username'),
      role: firstMessage('role'),
      initialPassword: firstMessage('initialPassword'),
      newPassword: firstMessage('newPassword'),
    };
  }
}
