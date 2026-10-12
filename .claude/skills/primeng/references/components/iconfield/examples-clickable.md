# Angular IconField Component — Clickable

## Clickable

Icons inside InputIcon can be interactive with event handlers like click.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Search } from '@primeicons/angular/search';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <p-iconfield>
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input type="text" pInputText [(ngModel)]="value" placeholder="Search" />
                <p-inputicon>
                    <svg data-p-icon="times" class="cursor-pointer" (click)="value = ''" />
                </p-inputicon>
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule, Search, Times]
})
export class IconFieldClickableDemo {
    value: string = 'PrimeNG';
}
```
