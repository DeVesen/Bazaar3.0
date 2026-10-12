# Angular ConfirmPopup Component — Basic

## Basic

ConfirmPopup is defined using p-confirmpopup tag and an instance of ConfirmationService is required to display it bycalling confirm method.

```typescript
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center gap-2">
            <button type="button" pButton (click)="confirm1($event)" [outlined]="true">Save</button>
            <button type="button" pButton (click)="confirm2($event)" severity="danger" [outlined]="true">Delete</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmPopupBasicDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirm1(event: Event) {
        this.confirmationService.confirm({
            target: event.currentTarget as EventTarget,
            message: 'Are you sure you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Save'
            },
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    confirm2(event: Event) {
        this.confirmationService.confirm({
            target: event.currentTarget as EventTarget,
            message: 'Do you want to delete this record?',
            icon: 'pi pi-info-circle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }
}
```
