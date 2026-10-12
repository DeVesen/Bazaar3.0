# Angular Button Component — Icons

## Icons

Place an icon as a child of the button. Position is determined by DOM order — put the icon before or after the label.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Home } from '@primeicons/angular/home';
import { User } from '@primeicons/angular/user';
import { Check } from '@primeicons/angular/check';
import { Search } from '@primeicons/angular/search';
import { Refresh } from '@primeicons/angular/refresh';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-wrap gap-4 justify-center">
                <button pButton iconOnly aria-label="Save"><svg data-p-icon="home"></svg></button>
                <button pButton><svg data-p-icon="user"></svg> Profile</button>
                <button pButton>Save <svg data-p-icon="check"></svg></button>
            </div>
            <div class="flex flex-wrap gap-4 justify-center">
                <button pButton class="flex-col"><svg data-p-icon="search"></svg> Search</button>
                <button pButton class="flex-col">Update <svg data-p-icon="refresh"></svg></button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, Home, User, Check, Search, Refresh]
})
export class ButtonIconsDemo {}
```
