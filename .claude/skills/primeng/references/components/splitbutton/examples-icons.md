# Angular SplitButton Component — Icons

## Icons

The buttons and menuitems have support to display icons.

```typescript
import { Component, inject } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-splitbutton label="Save" icon="pi pi-check" dropdownIcon="pi pi-cog" [model]="items" />
        </div>
    `,
    standalone: true,
    imports: [SplitButtonModule],
    providers: [MessageService]
})
export class SplitButtonIconsDemo {
    private messageService = inject(MessageService);

    items: MenuItem[];

    constructor() {
        this.items = [
            {
                label: 'Update',
                icon: 'pi pi-refresh',
                command: () => {
                    this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
                }
            },
            {
                label: 'Delete',
                icon: 'pi pi-times',
                command: () => {
                    this.messageService.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
                }
            },
            {
                separator: true
            },
            {
                label: 'Quit',
                icon: 'pi pi-power-off',
                command: () => {
                    window.open('https://angular.io/', '_blank');
                }
            }
        ];
    }
}
```
