# Angular Toast Component — Clear

## Clear

Clicking the close icon on the toast, removes it manually. Same can also be achieved programmatically using the clear function of the messageService . Calling it without any arguments, removes all displayed messages whereas calling it with a key, removes the messages displayed on a toast having the same key.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast key="myKey" />
        <div class="flex justify-center gap-2">
            <button type="button" pButton (click)="show()">Show</button>
            <button type="button" pButton (click)="clear()" severity="secondary">Clear</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastClearDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ key: 'myKey', severity: 'success', summary: 'Message 1', detail: 'Message Content' });
    }

    clear() {
        this.messageService.clear();
    }
}
```
