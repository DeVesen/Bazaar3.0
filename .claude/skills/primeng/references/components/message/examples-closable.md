# Angular Message Component — Closable

## Closable

Enable closable option to display an icon to remove a message.

```typescript
import { Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
    template: `
        <div class="max-w-xs mx-auto">
            <p-message [closable]="true">This is a closable message.</p-message>
        </div>
    `,
    standalone: true,
    imports: [MessageModule]
})
export class MessageClosableDemo {}
```
