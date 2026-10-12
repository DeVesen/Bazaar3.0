# Angular Message Component — Simple

## Simple

Configure the variant value as simple for messages without borders and backgrounds.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <p-message severity="success" variant="simple">Success Message</p-message>
            <p-message severity="info" variant="simple">Info Message</p-message>
            <p-message severity="warn" variant="simple">Warn Message</p-message>
            <p-message severity="error" variant="simple">Error Message</p-message>
            <p-message severity="secondary" variant="simple">Secondary Message</p-message>
            <p-message severity="contrast" variant="simple">Contrast Message</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageSimpleDemo {}
```
