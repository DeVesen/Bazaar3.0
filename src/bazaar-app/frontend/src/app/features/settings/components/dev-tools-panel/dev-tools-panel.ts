import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../../core/auth/auth.service';
import { DevToolsApi } from '../../data/dev-tools-api';

const CONFIRM_PHRASE = 'RESET';

/**
 * Dev/lokal-only "Datenbank zurücksetzen" — komplett unsichtbar in Production, weil
 * `GET /api/admin/dev-tools/status` dort gar nicht erst existiert (404 → `isDevelopment` bleibt
 * `false`, siehe `DevToolsApi`). Löscht die komplette DB inkl. Admin-Konto, daher Tipp-Bestätigung
 * statt einfachem Ja/Nein-Dialog, und danach Logout + Reload zurück zum Setup-Wizard.
 */
@Component({
  selector: 'app-dev-tools-panel',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './dev-tools-panel.html',
  styleUrl: './dev-tools-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolsPanel {
  private readonly devToolsApi = inject(DevToolsApi);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly visible = signal(false);
  readonly confirmText = signal('');
  readonly resetting = signal(false);

  readonly canReset = computed(() => this.confirmText() === CONFIRM_PHRASE && !this.resetting());

  constructor() {
    this.devToolsApi.isDevelopment().subscribe((isDevelopment) => this.visible.set(isDevelopment));
  }

  resetDatabase(): void {
    if (!this.canReset()) return;
    this.resetting.set(true);
    this.devToolsApi.resetDatabase().subscribe({
      next: () => {
        this.authService.logout();
        window.location.reload();
      },
      error: () => {
        this.resetting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Zurücksetzen fehlgeschlagen' });
      },
    });
  }
}
