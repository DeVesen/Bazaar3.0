# Angular Toast Component — Sticky

## Sticky

A toast disappears after the time defined by the life option, set sticky option true on the message to override this and not hide the toast automatically.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <div class="flex flex-wrap gap-2">
                <button pButton pRipple outlined (click)="show()">Create toast</button>
                <button pButton pRipple outlined (click)="clear()" severity="secondary">Dismiss toast</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule, RippleModule],
    providers: [MessageService]
})
export class ToastStickyDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ severity: 'info', summary: 'Sticky toast', detail: 'This toast stays until you dismiss it manually.', sticky: true });
    }

    clear() {
        this.messageService.clear();
    }
}
```
