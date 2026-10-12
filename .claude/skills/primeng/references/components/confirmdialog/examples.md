# Angular ConfirmDialog Component — Beispiele

## Basic

ConfirmDialog is defined using p-confirmdialog tag and an instance of ConfirmationService is required to display it bycalling confirm method.

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
export class ConfirmDialogBasicDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirm1(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
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
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
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

    confirm2(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this record?',
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
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
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }
}
```

## Headless

Headless mode allows you to customize the entire user interface instead of the default elements.

```typescript
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="confirm()">Save</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmDialogHeadlessDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirm() {
        this.confirmationService.confirm({
            header: 'Are you sure?',
            message: 'Please confirm to proceed.',
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
            },
            reject: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }
}
```

## Position

The position property of the confirm options is used to display a Dialog at all edges and corners of the screen.

```typescript
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2 mb-4">
            <button type="button" pButton (click)="confirmPosition('left')" severity="secondary" class="min-w-40">Left</button>
            <button type="button" pButton (click)="confirmPosition('right')" severity="secondary" class="min-w-40">Right</button>
        </div>
        <div class="flex flex-wrap justify-center gap-2 mb-4">
            <button type="button" pButton (click)="confirmPosition('topleft')" severity="secondary" class="min-w-40">TopLeft</button>
            <button type="button" pButton (click)="confirmPosition('top')" severity="secondary" class="min-w-40">Top</button>
            <button type="button" pButton (click)="confirmPosition('topright')" severity="secondary" class="min-w-40">TopRight</button>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
            <button type="button" pButton (click)="confirmPosition('bottomleft')" severity="secondary" class="min-w-40">BottomLeft</button>
            <button type="button" pButton (click)="confirmPosition('bottom')" severity="secondary" class="min-w-40">Bottom</button>
            <button type="button" pButton (click)="confirmPosition('bottomright')" severity="secondary" class="min-w-40">BottomRight</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmDialogPositionDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirmPosition(position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright') {
        this.position = position;

        this.confirmationService.confirm({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-info-circle',
            rejectButtonStyleClass: 'p-button-text',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                text: true
            },
            acceptButtonProps: {
                label: 'Save',
                text: true
            },
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Request submitted' });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'Process incomplete',
                    life: 3000
                });
            },
            key: 'positionDialog'
        });
    }
}
```

## Template

Properties of the dialog are defined in two ways, message , icon , header properties can either be defined using confirm method or declaratively on p-confirmDialog ng-template by header , message , icon and footer templates. If these values are unlikely to change then declarative approach would be useful, still properties defined in a ng-template can be overridden with confirm method call. In addition, buttons at footer section can be customized by passing your own UI, important note to make confirmation work with a custom UI is defining a local ng-template variable for the dialog and assign accept()-reject() methods to your own buttons.

```typescript
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="confirm()">Save</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule],
    providers: [ConfirmationService, MessageService]
})
export class ConfirmDialogTemplateDemo {
    private confirmationService = inject(ConfirmationService);

    private messageService = inject(MessageService);

    confirm() {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Please confirm to proceed moving forward.',
            icon: 'pi pi-exclamation-circle',
            rejectButtonProps: {
                label: 'Cancel',
                icon: 'pi pi-times',
                variant: 'outlined',
                size: 'small'
            },
            acceptButtonProps: {
                label: 'Save',
                icon: 'pi pi-check',
                size: 'small'
            },
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }
}
```
