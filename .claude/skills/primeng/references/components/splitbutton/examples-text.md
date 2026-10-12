# Angular SplitButton Component — Text

## Text

Text buttons are displayed as textual elements.

```typescript
import { Component, inject } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4">
            <p-splitbutton label="Primary" [model]="items" (onClick)="save('info')" text />
            <p-splitbutton label="Secondary" [model]="items" (onClick)="save('info')" text severity="secondary" />
            <p-splitbutton label="Success" [model]="items" (onClick)="save('info')" text severity="success" />
            <p-splitbutton label="Info" [model]="items" (onClick)="save('info')" text severity="info" />
            <p-splitbutton label="Warning" [model]="items" (onClick)="save('info')" text severity="warn" />
            <p-splitbutton label="Help" [model]="items" (onClick)="save('info')" text severity="help" />
            <p-splitbutton label="Danger" [model]="items" (onClick)="save('info')" text severity="danger" />
            <p-splitbutton label="Contrast" [model]="items" (onClick)="save('info')" text severity="contrast" />
        </div>
    `,
    standalone: true,
    imports: [SplitButtonModule],
    providers: [MessageService]
})
export class SplitButtonTextDemo {
    private messageService = inject(MessageService);

    items: MenuItem[];

    constructor() {
        this.items = [
            {
                label: 'Update',
                command: () => {
                    this.update();
                }
            },
            {
                label: 'Delete',
                command: () => {
                    this.delete();
                }
            },
            { label: 'Angular.dev', url: 'https://angular.dev' },
            { separator: true },
            { label: 'Upload', routerLink: ['/fileupload'] }
        ];
    }

    save(severity: string) {
        this.messageService.add({ severity: severity, summary: 'Success', detail: 'Data Saved' });
    }

    update() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Updated' });
    }

    delete() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Deleted' });
    }
}
```
