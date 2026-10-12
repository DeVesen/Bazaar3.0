# Angular Avatar Component — AvatarGroup

## AvatarGroup

Grouping is available by wrapping multiple Avatar components inside an AvatarGroup .

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
    template: `
        <div class="flex justify-center">
            <p-avatar-group>
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" shape="circle" />
                <!-- +3 gleichartige Zeilen -->
                <p-avatar label="+2" shape="circle" />
            </p-avatar-group>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, AvatarGroupModule]
})
export class AvatarGroupDemo {}
```
