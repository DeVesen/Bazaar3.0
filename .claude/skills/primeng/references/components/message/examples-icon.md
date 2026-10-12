# Angular Message Component — Icon

## Icon

The icon of a message is specified with the icon property or the icon template.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="max-w-sm mx-auto space-y-4">
            <p-message severity="warn" icon="pi pi-receipt">Your subscription is about to expire.</p-message>
            <p-message severity="info">
                <ng-template #icon>
                    <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                </ng-template>
                <span class="ms-2">How may I help you?</span>
            </p-message>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, MessageModule]
})
export class MessageIconDemo {}
```
