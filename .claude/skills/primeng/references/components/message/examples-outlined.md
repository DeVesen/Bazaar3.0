# Angular Message Component — Outlined

## Outlined

Configure the variant value as outlined for messages with borders and no background.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <p-message severity="success" variant="outlined">Success Message</p-message>
            <p-message severity="info" variant="outlined">Info Message</p-message>
            <p-message severity="warn" variant="outlined">Warn Message</p-message>
            <p-message severity="error" variant="outlined">Error Message</p-message>
            <p-message severity="secondary" variant="outlined">Secondary Message</p-message>
            <p-message severity="contrast" variant="outlined">Contrast Message</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageOutlinedDemo {}
```
