import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';

export interface LoginCredentials {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    InputPasswordModule,
    InputTextModule,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  readonly errorMessage = input<string | null>(null);
  readonly submitted = output<LoginCredentials>();

  readonly username = signal('');
  readonly password = signal('');
  readonly mask = signal(true);

  onSubmit(): void {
    this.submitted.emit({ username: this.username(), password: this.password() });
  }
}
