# Angular Speed Dial Component — Basic

## Basic

SpeedDial displays related actions from a single trigger button.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div style="position: relative; height: 240px;">
            <p-speeddial [model]="items" direction="up" [style]="{ position: 'absolute', right: 0, bottom: 0 }" />
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule],
    providers: [MessageService]
})
export class SpeedDialBasicDemo implements OnInit {
    private messageService = inject(MessageService);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                icon: 'pi pi-pencil',
                command: () => this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' })
            },
            {
                icon: 'pi pi-refresh',
                command: () => this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' })
            },
            {
                icon: 'pi pi-trash',
                command: () => this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' })
            },
            {
                icon: 'pi pi-upload'
            },
            {
                icon: 'pi pi-external-link',
                target: '_blank',
                url: 'https://angular.dev'
            }
        ];
    }
}
```
