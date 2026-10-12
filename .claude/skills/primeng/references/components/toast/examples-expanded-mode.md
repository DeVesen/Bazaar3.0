# Angular Toast Component — Expanded Mode

## Expanded Mode

Setting mode to expanded always renders the stack expanded; the default stacked mode stacks toasts collapsed and expands them on hover. Auto-dismiss timers still pause while the toasts are hovered.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast key="expanded" mode="expanded" stackVisibleLimit="7" />
        <div class="flex justify-center">
            <button type="button" pButton outlined (click)="show()">Create toast</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastExpandedModeDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ key: 'expanded', summary: 'Successfully completed', detail: 'The task was completed successfully. You can now view the details.' });
    }
}
```
