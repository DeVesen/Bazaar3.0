# Angular Menu Component — Basic

## Basic

Items are grouped with the items property where each group displays a label header, while a flat separator entry divides the sections.

```typescript
import { Component, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menu #menu [model]="items" [popup]="true" styleClass="w-40" />
            <button pButton [outlined]="true" severity="secondary" (click)="menu.toggle($event)">Account</button>
        </div>
    `,
    standalone: true,
    imports: [MenuModule, ButtonModule]
})
export class MenuBasicDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'My Account',
                items: [{ label: 'Profile' }, { label: 'Billing' }, { label: 'Settings' }]
            },
            { separator: true },
            {
                label: 'Security',
                items: [{ label: 'Change Password' }, { label: 'Two-Factor Auth' }]
            },
            { separator: true },
            { label: 'Invite Members' },
            { label: 'Support' },
            { separator: true },
            { label: 'Sign out' }
        ];
    }
}
```
