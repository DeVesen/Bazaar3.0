import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsForm } from '../../components/settings-form/settings-form';

@Component({
  selector: 'app-settings-page',
  imports: [SettingsForm],
  template: `<app-settings-form />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
