# Angular SplitButton Component — Sizes

## Sizes

SplitButton provides small and large sizes as alternatives to the standard.

```typescript
import { Component, inject } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-center gap-4">
            <p-splitbutton label="Small" [model]="items" (onClick)="save('info')" size="small" />
            <p-splitbutton label="Normal" [model]="items" (onClick)="save('info')" />
            <p-splitbutton label="Large" [model]="items" (onClick)="save('info')" size="large" />
        </div>
    `,
    standalone: true,
    imports: [SplitButtonModule],
    providers: [MessageService]
})
export class SplitButtonSizesDemo {
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
