# Angular Message Component — Severity

## Severity

The severity option specifies the type of the message.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="max-w-md mx-auto space-y-4">
            <p-message severity="success" icon="pi pi-check" [closable]="true">Your account is now ready.</p-message>
            <p-message severity="info" icon="pi pi-sparkles" [closable]="true">Upgrade now and save %5.</p-message>
            <p-message severity="warn" icon="pi pi-receipt" [closable]="true">Your subscription is about to expire.</p-message>
            <p-message severity="error" icon="pi pi-exclamation-triangle" [closable]="true">Something went wrong.</p-message>
            <p-message severity="secondary" icon="pi pi-spinner pi-spin" [closable]="true">Processing may take a few moments.</p-message>
            <p-message severity="contrast" icon="pi pi-wifi" [closable]="true">You're currently in offline mode.</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageSeverityDemo {}
```
