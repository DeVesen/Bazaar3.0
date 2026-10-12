# Angular Toast Component — Basic

## Basic

Toasts are displayed by calling the add and addAll method provided by the messageService . A single toast is specified by the Message interface that defines various properties such as severity , summary and detail .

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <button type="button" pButton outlined (click)="show()">Create toast</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastBasicDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ summary: 'Successfully completed', detail: 'The task was completed successfully. You can now view the details.' });
    }
}
```
