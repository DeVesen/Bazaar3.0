# Angular SplitButton Component — Severity

## Severity

The severity property defines the type of button.

```typescript
import { Component, inject } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4">
            <p-splitbutton label="Save" (onClick)="save()" [model]="items" />
            <p-splitbutton label="Save" (onClick)="save()" [model]="items" severity="secondary" />
            <!-- +6 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [SplitButtonModule],
    providers: [MessageService]
})
export class SplitButtonSeverityDemo {
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

    save() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Saved' });
    }

    update() {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated' });
    }

    delete() {
        this.messageService.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted' });
    }
}
```
