# Angular Avatar Component — Badge

## Badge

A Badge can be used to display a badge on an Avatar.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
    template: `
        <div class="flex items-center justify-center gap-8">
            <p-overlay-badge value="2" badgeSize="small" severity="success">
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" size="large" shape="circle" />
            </p-overlay-badge>
            <p-overlay-badge severity="danger">
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/walter.jpg" size="large" />
            </p-overlay-badge>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, OverlayBadgeModule]
})
export class AvatarBadgeDemo {}
```
