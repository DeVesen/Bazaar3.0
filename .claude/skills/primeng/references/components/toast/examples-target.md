# Angular Toast Component — Target

## Target

A page may have multiple toast components, in case you'd like to target a specific message to a particular toast, use the key property so that toast and the message can match.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast key="toast1" />
        <p-toast key="toast2" />
        <div class="flex justify-center gap-2">
            <button pButton (click)="showToast1()">Show Success</button>
            <button pButton (click)="showToast2()" severity="warn">Show Warning</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastTargetDemo {
    private messageService = inject(MessageService);

    showToast1() {
        this.messageService.clear();
        this.messageService.add({ key: 'toast1', severity: 'success', summary: 'Success', detail: 'key: toast1' });
    }

    showToast2() {
        this.messageService.clear();
        this.messageService.add({ key: 'toast2', severity: 'warn', summary: 'Warning', detail: 'key: toast2' });
    }
}
```
