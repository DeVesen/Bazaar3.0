import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsForm } from '../../components/settings-form/settings-form';
import { ImportPanel } from '../../components/import-panel/import-panel';

@Component({
  selector: 'app-settings-page',
  imports: [SettingsForm, ImportPanel],
  template: `<app-settings-form /><app-import-panel />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
