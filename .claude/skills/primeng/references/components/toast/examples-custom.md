# Angular Toast Component — Custom

## Custom

The toast content can be fully customized with a template to render any markup, such as links and action buttons.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast key="custom" [pt]="{ closeButton: { class: 'hidden!' } }">
            <ng-template let-message #message>
                <div class="space-y-2 w-full">
                    <div>
                        <h1 class="text-sm! m-0! font-medium! text-surface-900 dark:text-surface-0 leading-6">
                            Purchase complete!
                            <a class="cursor-pointer underline! hover:opacity-75">View receipt</a>
                        </h1>
                        <p class="text-surface-500 mt-1 text-sm">
                            Your order is being processed. Track all orders or
                            <a class="cursor-pointer underline! hover:opacity-75">learn about returns</a>
                        </p>
                    </div>
                    <div class="flex items-center mt-3 gap-2">
                        <button
                            type="button"
                            (click)="dismiss()"
                            class="font-medium px-2 py-1.5 text-xs rounded-md bo …(lange Zeile gekürzt)
                        >
                            Dismiss
                        </button>
                        <button
                            type="button"
                            (click)="dismiss()"
                            class="font-medium px-2 py-1.5 text-xs rounded-md bo …(lange Zeile gekürzt)
                        >
                            Track all orders
                        </button>
                    </div>
                </div>
            </ng-template>
        </p-toast>
        <div class="flex justify-center">
            <button type="button" pButton outlined (click)="show()">Custom toast</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastCustomDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ key: 'custom', life: 6000, summary: 'Purchase complete', styleClass: 'bg-surface-0! dark:bg-surface-900! border-surface!' });
    }

    dismiss() {
        this.messageService.clear('custom');
    }
}
```
