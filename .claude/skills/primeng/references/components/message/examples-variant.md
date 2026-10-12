# Angular Message Component — Variant

## Variant

Configure the variant value as outlined or simple .

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="space-y-8 max-w-sm mx-auto">
            <div class="space-y-4">
                <h3 class="text-lg font-semibold mb-2">Outlined</h3>
                <p-message severity="success" variant="outlined" icon="pi pi-check" [closable]="true">Your account is now ready.</p-message>
                <p-message severity="info" variant="outlined" icon="pi pi-sparkles" [closable]="true"><a href="" class="decoration-1! underline!">Upgrade</a> now and save %5.</p-message>
                <p-message severity="warn" variant="outlined" icon="pi pi-receipt" [closable]="true">Your subscription is about to expire. <a href="" class="decoration-1! underline!">Renew</a></p-message>
                <p-message severity="error" variant="outlined" icon="pi pi-exclamation-triangle" [closable]="true">Something went wrong. Please <a href="" class="decoration-1! underline!">try again</a>.</p-message>
                <p-message severity="secondary" variant="outlined" icon="pi pi-spinner pi-spin" [closable]="true">Processing may take a few moments.</p-message>
                <p-message severity="contrast" variant="outlined" icon="pi pi-wifi" [closable]="true">You're currently in offline mode.</p-message>
            </div>
            <div class="space-y-4">
                <h3 class="text-lg font-semibold mb-2">Simple</h3>
                <p-message severity="success" variant="simple" icon="pi pi-check" [closable]="true">Your account is now ready.</p-message>
                <p-message severity="info" variant="simple" icon="pi pi-sparkles" [closable]="true"><a href="" class="decoration-1! underline!">Upgrade</a> now and save %5.</p-message>
                <p-message severity="warn" variant="simple" icon="pi pi-receipt" [closable]="true">Your subscription is about to expire. <a href="" class="decoration-1! underline!">Renew</a></p-message>
                <p-message severity="error" variant="simple" icon="pi pi-exclamation-triangle" [closable]="true">Something went wrong. Please <a href="" class="decoration-1! underline!">try again</a>.</p-message>
                <p-message severity="secondary" variant="simple" icon="pi pi-spinner pi-spin" [closable]="true">Processing may take a few moments.</p-message>
                <p-message severity="contrast" variant="simple" icon="pi pi-wifi" [closable]="true">You're currently in offline mode.</p-message>
            </div>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageVariantDemo {}
```
