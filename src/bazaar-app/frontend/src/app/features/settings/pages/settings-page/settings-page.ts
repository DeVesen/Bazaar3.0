import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsForm } from '../../components/settings-form/settings-form';
import { ImportPanel } from '../../components/import-panel/import-panel';
import { UserManagement } from '../../components/user-management/user-management';
import { DevToolsPanel } from '../../components/dev-tools-panel/dev-tools-panel';
import { Page } from '../../../../shared/components/page/page';

// Round-27 Task C: no `@if (isAdmin())` guard here — the whole `/settings` route already
// carries `adminGuard` (app.routes.ts), and neither `SettingsForm` nor `ImportPanel` re-checks
// role internally, so `UserManagement` follows the same convention instead of duplicating the
// gate a third time. `DevToolsPanel` hides itself (dev/local only) via its own status check.
@Component({
  selector: 'app-settings-page',
  imports: [SettingsForm, ImportPanel, UserManagement, DevToolsPanel, Page],
  template: `
    <app-page title="Einstellungen">
      <app-settings-form /><app-import-panel /><app-user-management /><app-dev-tools-panel />
    </app-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
