import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  template: `<p>Anmeldung</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {}
