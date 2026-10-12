# Angular Message Component — Dynamic

## Dynamic

Multiple messages can be displayed using the standard for block.

```typescript
import { Component, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-col items-center justify-center gap-4">
            <div class="flex gap-2">
                <button type="button" pButton (click)="addMessages()">Add Messages</button>
                <button type="button" pButton severity="secondary" (click)="clearMessages()">Clear Messages</button>
            </div>
            <div class="flex flex-col">
                @for (message of messages(); track message.severity; let first = $first) {
                    <p-message [severity]="message.severity" [class]="{ 'mt-4': !first }" [closable]="message?.closable">{{ message.content }}</p-message>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ButtonModule]
})
export class MessageDynamicDemo {
    messages = signal<any[]>([]);

    clearMessages() {
        this.messages.set([]);
    }

    addMessages() {
        this.messages.set([
            { severity: 'info', content: 'Dynamic Info Message' },
            { severity: 'success', content: 'Dynamic Success Message' },
            { severity: 'warn', content: 'Dynamic Warn Message' }
        ]);
    }
}
```
