# Angular Drawer Component — Template

## Template

Drawer is customizable by header , content , footer templates.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { User } from '@primeicons/angular/user';
import { SignOut } from '@primeicons/angular/sign-out';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <div class="flex justify-center">
            <p-drawer [(visible)]="visible" [closable]="false">
                <ng-template #header>
                    <div class="flex items-center gap-2">
                        <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                        <span class="font-bold">Amy Elsner</span>
                    </div>
                </ng-template>
                <p class="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed …(lange Zeile gekürzt)
                    consequat.
                </p>
                <ng-template #footer>
                    <div class="flex items-center gap-2">
                        <button type="button" pButton class="w-full" outlined>
                            <svg data-p-icon="user" />
                            Account
                        </button>
                        <button type="button" pButton class="w-full" severity="danger" text>
                            <svg data-p-icon="sign-out" />
                            Logout
                        </button>
                    </div>
                </ng-template>
            </p-drawer>
            <button type="button" pButton iconOnly (click)="visible = true">
                <svg data-p-icon="plus" />
            </button>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, DrawerModule, ButtonModule, User, SignOut, Plus]
})
export class DrawerTemplateDemo {
    visible: boolean = false;
}
```
