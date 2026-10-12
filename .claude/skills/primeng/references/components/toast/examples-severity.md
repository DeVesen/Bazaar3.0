# Angular Toast Component — Severity

## Severity

The severity option specifies the type of the message. There are four types of messages: success , info , warn and error . The severity of the message is used to display the icon and the color of the toast.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex flex-wrap justify-center gap-2">
            <button type="button" pButton pRipple outlined (click)="showInfo()" severity="info">Info</button>
            <button type="button" pButton pRipple outlined (click)="showSuccess()" severity="success">Success</button>
            <!-- +4 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule, RippleModule],
    providers: [MessageService]
})
export class ToastSeverityDemo {
    private messageService = inject(MessageService);

    showInfo() {
        this.messageService.add({ severity: 'info', summary: 'Heads up', detail: 'There’s something you might want to check.' });
    }

    showSuccess() {
        this.messageService.add({ severity: 'success', summary: 'Saved successfully', detail: 'Your changes have been saved.' });
    }

    showWarn() {
        this.messageService.add({ severity: 'warn', summary: 'Check this', detail: 'Some fields may need your attention.' });
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Something went wrong', detail: 'We couldn’t complete the action. Please try again.' });
    }

    showSecondary() {
        this.messageService.add({ severity: 'secondary', summary: 'For your information', detail: 'This is a secondary toast message.' });
    }

    showContrast() {
        this.messageService.add({ severity: 'contrast', summary: 'High contrast', detail: 'This is a contrast toast message.' });
    }
}
```
