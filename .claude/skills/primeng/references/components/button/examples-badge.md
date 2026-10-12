# Angular Button Component — Badge

## Badge

Badge component can be used to display a badge inside a button. OverlayBadge is used to display a badge on a button.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ButtonModule } from 'primeng/button';
import { Users } from '@primeicons/angular/users';
import { Bell } from '@primeicons/angular/bell';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4">
            <button pButton>Emails <p-badge severity="secondary" shape="circle" value="2" /></button>
            <button pButton variant="outlined"><svg data-p-icon="users"></svg> Messages <p-badge severity="contrast" shape="circle" value="2" /></button>
            <p-overlay-badge>
                <button pButton variant="outlined" iconOnly><svg data-p-icon="bell"></svg></button>
                <p-badge severity="info" class="animate-pulse" />
            </p-overlay-badge>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, OverlayBadgeModule, ButtonModule, Users, Bell]
})
export class ButtonBadgeDemo {}
```
