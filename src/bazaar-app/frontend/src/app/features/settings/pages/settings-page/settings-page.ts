import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  template: `<p>Einstellungen</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
