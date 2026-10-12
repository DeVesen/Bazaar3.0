# Angular IconField Component — Sizes

## Sizes

IconField is compatible with the size setting of the input field.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Search } from '@primeicons/angular/search';
import { User } from '@primeicons/angular/user';
import { Lock } from '@primeicons/angular/lock';
import { Spinner } from '@primeicons/angular/spinner';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-iconfield>
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input pInputText [(ngModel)]="value1" placeholder="Small" pSize="small" />
            </p-iconfield>
            <p-iconfield>
                <input pInputText [(ngModel)]="value2" placeholder="Normal" />
                <p-inputicon>
                    <svg data-p-icon="user" />
                </p-inputicon>
            </p-iconfield>
            <p-iconfield>
                <p-inputicon>
                    <svg data-p-icon="lock" />
                </p-inputicon>
                <input pInputText [(ngModel)]="value3" placeholder="Large" pSize="large" />
                <p-inputicon>
                    <svg data-p-icon="spinner" class="animate-spin" />
                </p-inputicon>
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule, Search, User, Lock, Spinner]
})
export class IconFieldSizesDemo {
    value1: any = null;

    value2: any = null;

    value3: any = null;
}
```
