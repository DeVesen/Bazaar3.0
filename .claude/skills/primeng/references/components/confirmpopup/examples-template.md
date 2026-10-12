# Angular ConfirmPopup Component — Template

## Template

Content section can be customized using content template.

```typescript
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="confirm($event)">Save</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmPopupTemplateDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirm(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Please confirm to proceed moving forward.',
            icon: 'pi pi-exclamation-circle',
            rejectButtonProps: {
                icon: 'pi pi-times',
                label: 'Cancel',
                outlined: true
            },
            acceptButtonProps: {
                icon: 'pi pi-check',
                label: 'Confirm'
            },
            accept: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'You have accepted',
                    life: 3000
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                    life: 3000
                });
            }
        });
    }
}
```
