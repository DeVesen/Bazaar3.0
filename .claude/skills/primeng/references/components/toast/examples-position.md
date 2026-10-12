# Angular Toast Component — Position

## Position

Location of the toast is customized with the position property. Valid values are top-left , top-center , top-right , bottom-left , bottom-center , bottom-right and center .

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast position="top-left" key="top-left" />
        <p-toast position="top-center" key="top-center" />
        <p-toast position="top-right" key="top-right" />
        <p-toast position="bottom-left" key="bottom-left" />
        <p-toast position="bottom-center" key="bottom-center" />
        <p-toast position="bottom-right" key="bottom-right" />
        <p-toast position="center" key="center" />
        <div class="flex justify-center">
            <div class="flex flex-wrap gap-2">
                <button type="button" pButton pRipple outlined (click)="createToast('top-left')">Top Left</button>
                <button type="button" pButton pRipple outlined (click)="createToast('top-center')">Top Center</button>
                <!-- +5 gleichartige Zeilen -->
            </div>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule, RippleModule],
    providers: [MessageService]
})
export class ToastPositionDemo {
    private messageService = inject(MessageService);

    createToast(key: string) {
        this.messageService.add({
            summary: 'Successfully completed',
            detail: 'The task was completed successfully. You can now view the details.',
            key
        });
    }
}
```
