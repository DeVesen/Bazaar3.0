import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Tabs, TabsModule } from 'primeng/tabs';
import { map } from 'rxjs';
import { SettingsForm } from '../../components/settings-form/settings-form';
import { PrintTextsForm } from '../../components/print-texts-form/print-texts-form';
import { ImportPanel } from '../../components/import-panel/import-panel';
import { UserManagement } from '../../components/user-management/user-management';
import { DevToolsPanel } from '../../components/dev-tools-panel/dev-tools-panel';
import { Page } from '../../../../shared/components/page/page';
import { DiscardableChanges, SETTINGS_TABS, SettingsTab, resolveSettingsTab } from './settings-tabs';

const TAB_QUERY_PARAM = 'tab';
const LEAVE_TAB_CONFIRM_KEY = 'leaveSettingsTab';

/**
 * Einstellungsseite mit Tab-Leiste (docs/forge/2026-10-18-einstellungen-tabs/spec.md). Der aktive
 * Tab steht im Query-Parameter `tab`; ein Wechsel ersetzt den History-Eintrag (`replaceUrl`), damit
 * „Zurück" die Seite verlässt statt Tabs abzuklappern. Alle Panels sind nicht lazy: jeder Bereich
 * lädt beim Öffnen und behält seinen Zustand über Tab-Wechsel.
 *
 * Kein `@if (isAdmin())` — die Route `/settings` trägt `adminGuard` (app.routes.ts), keiner der
 * Bereiche prüft die Rolle erneut. `DevToolsPanel` blendet sich außerhalb von Development selbst aus.
 */
@Component({
  selector: 'app-settings-page',
  imports: [TabsModule, ConfirmDialogModule, SettingsForm, PrintTextsForm, ImportPanel, UserManagement, DevToolsPanel, Page],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly tabsRef = viewChild.required(Tabs);
  private readonly settingsFormRef = viewChild.required(SettingsForm);
  private readonly printTextsFormRef = viewChild.required(PrintTextsForm);
  private readonly importPanelRef = viewChild.required(ImportPanel);

  readonly tabs = SETTINGS_TABS;
  readonly leaveTabConfirmKey = LEAVE_TAB_CONFIRM_KEY;
  readonly activeTab = toSignal(
    this.route.queryParamMap.pipe(map((params) => resolveSettingsTab(params.get(TAB_QUERY_PARAM)))),
    { requireSync: true },
  );

  onTabChange(value: string | number | undefined): void {
    const target = resolveSettingsTab(value === undefined ? null : String(value));
    if (target === this.activeTab()) return;

    const leaving = this.discardableOf(this.activeTab());
    if (leaving?.hasUnsavedChanges()) {
      this.askBeforeLeaving(leaving, target);
      return;
    }
    this.navigateTo(target);
  }

  /**
   * `p-tabs` übernimmt einen Klick sofort in sein eigenes `value`-Model; ohne Zurücksetzen stünde
   * während der Rückfrage schon der neue Tab da. Erst „Verwerfen" wechselt wirklich.
   */
  private askBeforeLeaving(leaving: DiscardableChanges, target: SettingsTab): void {
    this.tabsRef().value.set(this.activeTab());
    this.confirmationService.confirm({
      key: LEAVE_TAB_CONFIRM_KEY,
      header: 'Ungespeicherte Änderungen',
      message: 'In diesem Tab gibt es ungespeicherte Änderungen. Beim Wechsel gehen sie verloren.',
      acceptLabel: 'Verwerfen',
      rejectLabel: 'Bleiben',
      accept: () => this.discardAndNavigate(leaving, target),
    });
  }

  private discardAndNavigate(leaving: DiscardableChanges, target: SettingsTab): void {
    leaving.discardChanges();
    this.navigateTo(target);
  }

  private discardableOf(tab: SettingsTab): DiscardableChanges | null {
    const discardables: Record<SettingsTab, DiscardableChanges | null> = {
      general: this.settingsFormRef(),
      users: null,
      print: this.printTextsFormRef(),
      misc: this.importPanelRef(),
    };
    return discardables[tab];
  }

  private navigateTo(tab: SettingsTab): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [TAB_QUERY_PARAM]: tab },
      replaceUrl: true,
    });
  }
}
