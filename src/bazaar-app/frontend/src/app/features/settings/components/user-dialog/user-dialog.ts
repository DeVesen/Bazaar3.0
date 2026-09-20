import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BooleanInput } from '../../../../shared/components/boolean-input/boolean-input';

const MIN_PASSWORD_LENGTH = 8;

export type UserRole = 'admin' | 'cashier';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Kassenpersonal', value: 'cashier' },
];

/** Pre-fill for edit mode — component spec §3: no username field in edit mode (AC-3). */
export interface UserDialogInitialValue {
  role: UserRole;
}

/**
 * Emitted on save. `initialPassword` is set (create mode) XOR `newPassword` is set-or-null (edit
 * mode) — the caller (`UserManagement`) knows which mode is active and calls the matching
 * `UsersApi` method; `newPassword` is `null` in edit mode when "Neues Passwort setzen" was left
 * unchecked, so `UsersApi.update()`'s partial-body logic omits it from the request.
 */
export interface UserDialogResult {
  username: string | null;
  role: UserRole;
  initialPassword: string | null;
  newPassword: string | null;
}

/** Field-level messages for a `400` validation response — mirrors `TypPopupServerErrors`. */
export interface UserDialogServerErrors {
  username?: string;
  role?: string;
  initialPassword?: string;
  newPassword?: string;
}

/**
 * Create/edit dialog for `user-management` (docs/requirements/bazaar-app/components/
 * user-management.md §3, Round-27 Task C). Mirrors `TypPopup`'s structure (`p-dialog`,
 * `visible`/`visibleChange`, `save`/`cancel`, an `effect()` resetting fields when `visible`
 * flips true from `initialValue`).
 *
 * Judgement call (see task-C-report.md): the "Rollenwechsel wirkt erst beim nächsten Login"
 * hint (AC-5) is shown only in edit mode. A brand-new user has no prior login/session whose
 * role could differ from what's being set, so "takes effect at next login" has nothing to
 * contrast with in create mode — the hint is only meaningful once a role can actually *change*
 * for an existing account. AC-5's wording doesn't scope it to a mode, so showing it in both
 * would also satisfy the letter of the AC; this reading was chosen as the more informative one.
 */
@Component({
  selector: 'app-user-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputPasswordModule,
    InputTextModule,
    SelectModule,
    BooleanInput,
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialog {
  readonly visible = input.required<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialValue = input<UserDialogInitialValue | null>(null);
  readonly saving = input<boolean>(false);
  readonly serverErrors = input<UserDialogServerErrors | null>(null);

  readonly visibleChange = output<boolean>();
  readonly save = output<UserDialogResult>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly roleOptions = ROLE_OPTIONS;

  readonly username = signal('');
  readonly role = signal<UserRole | null>(null);
  readonly initialPassword = signal('');
  readonly initialPasswordMask = signal(true);
  readonly setNewPassword = signal(false);
  readonly newPassword = signal('');
  readonly newPasswordMask = signal(true);

  readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Neuer Benutzer' : 'Benutzer bearbeiten',
  );

  readonly isCreate = computed(() => this.mode() === 'create');

  /** Whether the "Wird beim ersten Login zum Ändern verlangt." hint (AC-4) applies right now —
   * whenever a password the admin sets will actually be sent: always in create mode, and in
   * edit mode only once "Neues Passwort setzen" is checked. */
  readonly showForcedChangeHint = computed(() => this.isCreate() || this.setNewPassword());

  readonly canSave = computed(() => {
    if (this.saving() || this.role() === null) return false;
    if (this.isCreate()) {
      return this.username().trim().length > 0 && this.initialPassword().length >= MIN_PASSWORD_LENGTH;
    }
    return !this.setNewPassword() || this.newPassword().length >= MIN_PASSWORD_LENGTH;
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const initial = this.initialValue();
        this.username.set('');
        this.role.set(initial?.role ?? null);
        this.initialPassword.set('');
        this.initialPasswordMask.set(true);
        this.setNewPassword.set(false);
        this.newPassword.set('');
        this.newPasswordMask.set(true);
      }
    });
  }

  onSave(): void {
    if (!this.canSave()) return;
    const role = this.role();
    if (role === null) return;

    this.save.emit({
      username: this.isCreate() ? this.username().trim() : null,
      role,
      initialPassword: this.isCreate() ? this.initialPassword() : null,
      newPassword: !this.isCreate() && this.setNewPassword() ? this.newPassword() : null,
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }
}
