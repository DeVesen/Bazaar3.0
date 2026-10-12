# Angular Message Component — Basic

## Basic

An inline message for informational, success, warning, or error feedback.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <p-message severity="info" icon="pi pi-sparkles" [closable]="true">Upgrade now and save %5.</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageBasicDemo {}
```
