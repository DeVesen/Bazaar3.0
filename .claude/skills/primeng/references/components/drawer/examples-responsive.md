# Angular Drawer Component — Responsive

## Responsive

The responsive mode can be enabled by adding styleClass with responsive utilities.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <p-drawer [(visible)]="visible" header="Responsive Drawer" styleClass="w-full! sm:w-96! md:w-md! lg:w-120!">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="email" class="font-medium text-sm">Email</label>
                        <input pInputText id="email" placeholder="Enter your email" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="password" class="font-medium text-sm">Password</label>
                        <p-password id="password" placeholder="Enter your password" [feedback]="false" styleClass="w-full" inputStyleClass="w-full" />
                    </div>
                    <div class="flex items-center gap-2">
                        <p-checkbox [(ngModel)]="remember" [binary]="true" inputId="remember" />
                        <label for="remember" class="text-sm">Remember me</label>
                    </div>
                    <button type="button" pButton class="w-full">Sign In</button>
                </div>
            </p-drawer>
            <button type="button" pButton (click)="visible = true">Log in</button>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, DrawerModule, PasswordModule, ButtonModule, InputTextModule, FormsModule]
})
export class DrawerResponsiveDemo {
    visible: boolean = false;

    remember: boolean = false;
}
```
