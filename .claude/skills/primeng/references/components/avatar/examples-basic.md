# Angular Avatar Component — Basic

## Basic

Displays a user representation using an image, icon, or label initials.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
    template: `
        <div class="flex items-center justify-center gap-4">
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" size="large" shape="circle" />
        </div>
    `,
    standalone: true,
    imports: [AvatarModule]
})
export class AvatarBasicDemo {}
```
