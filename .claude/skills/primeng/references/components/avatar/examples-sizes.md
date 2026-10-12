# Angular Avatar Component — Sizes

## Sizes

Use the size property to change the size of an avatar.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex items-center justify-center gap-4">
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" size="large" />
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" size="xlarge" />
            </div>
            <div class="flex items-center justify-center gap-4">
                <p-avatar label="AB" shape="circle" />
                <p-avatar label="AB" shape="circle" size="large" />
                <p-avatar label="AB" shape="circle" size="xlarge" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule]
})
export class AvatarSizeDemo {}
```
