# Angular IconField Component — Basic

## Basic

An input field with an embedded leading or trailing icon.

```typescript
import { Component } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Search } from '@primeicons/angular/search';
import { Spinner } from '@primeicons/angular/spinner';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <p-iconfield>
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input type="text" pInputText placeholder="Search" />
            </p-iconfield>
            <p-iconfield>
                <input type="text" pInputText variant="filled" />
                <p-inputicon>
                    <svg data-p-icon="spinner" class="animate-spin" />
                </p-inputicon>
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputTextModule, Search, Spinner]
})
export class IconFieldBasicDemo {}
```
