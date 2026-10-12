# Angular Avatar Component — Image

## Image

Use the image property to display an image as an Avatar.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
    template: `
        <div class="flex items-center justify-center gap-4">
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" size="large" shape="circle" />
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" size="large" shape="circle" />
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" size="large" shape="circle" />
        </div>
    `,
    standalone: true,
    imports: [AvatarModule]
})
export class AvatarImageDemo {}
```
