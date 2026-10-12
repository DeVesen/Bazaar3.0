# Angular Toast Component — Action

## Action

An interactive button can be added to the toast content with a custom template, for example to let the user confirm an action.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Check } from '@primeicons/angular/check';

@Component({
    template: `
        <p-toast key="action">
            <ng-template let-message let-closeFn="closeFn" #message>
                @if (message.severity === 'success') {
                    <svg data-p-icon="check"></svg>
                }
                <div class="p-toast-message-text">
                    <div class="p-toast-summary">{{ message.summary }}</div>
                    <div class="p-toast-detail">{{ message.detail }}</div>
                    @if (message.severity !== 'success') {
                        <button type="button" pButton size="small" class="mt-3 self-start" (click)="enableCamera(closeFn)">Enable camera</button>
                    }
                </div>
            </ng-template>
        </p-toast>
        <div class="flex justify-center">
            <button type="button" pButton outlined (click)="show()">Create toast with action</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule, Check],
    providers: [MessageService]
})
export class ToastActionDemo {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({
            key: 'action',
            summary: 'Allow camera access',
            detail: 'We need access to your camera to scan QR codes.'
        });
    }

    enableCamera(closeFn: (event?: Event) => void) {
        closeFn();
        this.messageService.add({
            key: 'action',
            severity: 'success',
            summary: 'Camera access granted',
            detail: 'You can now scan QR codes.'
        });
    }
}
```
