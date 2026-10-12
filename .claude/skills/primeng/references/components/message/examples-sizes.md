# Angular Message Component — Sizes

## Sizes

Message provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-message severity="info" size="small" icon="pi pi-sparkles" [closable]="true">Upgrade now and save %5.</p-message>
            <p-message severity="info" icon="pi pi-sparkles" [closable]="true">Upgrade now and save %5.</p-message>
            <p-message severity="info" size="large" icon="pi pi-sparkles" [closable]="true">Upgrade now and save %5.</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageSizesDemo {}
```
