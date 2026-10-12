# Angular SplitButton Component — Basic

## Basic

SplitButton has a default action button and a collection of additional options defined by the model property based on MenuModel API.

```typescript
import { Component, inject } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-splitbutton label="Save" (onClick)="save()" [model]="items" />
        </div>
    `,
    standalone: true,
    imports: [SplitButtonModule],
    providers: [MessageService]
})
export class SplitButtonBasicDemo {
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
