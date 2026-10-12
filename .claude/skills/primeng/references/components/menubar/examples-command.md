# Angular Menubar Component — Command

## Command

The command property defines the callback to run when an item is activated by click or a key event.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <p-menubar [model]="items" />
    `,
    standalone: true,
    imports: [MenubarModule],
    providers: [MessageService]
})
export class MenubarCommandDemo implements OnInit {
    items: MenuItem[] | undefined;

    private messageService = inject(MessageService);

    ngOnInit() {
        this.items = [
            {
                label: 'File',
                icon: 'pi pi-file',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus',
                        command: () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File created', life: 3000 });
                        }
                    },
                    {
                        label: 'Print',
                        icon: 'pi pi-print',
                        command: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No printer connected', life: 3000 });
                        }
                    }
                ]
            },
            {
                label: 'Search',
                icon: 'pi pi-search',
                command: () => {
                    this.messageService.add({ severity: 'warn', summary: 'Search Results', detail: 'No results found', life: 3000 });
                }
            },
            {
                separator: true
            },
            {
                label: 'Sync',
                icon: 'pi pi-cloud',
                items: [
                    {
                        label: 'Import',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.messageService.add({
                                severity: 'info',
                                summary: 'Downloads',
                                detail: 'Downloaded from cloud',
                                life: 3000
                            });
                        }
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.messageService.add({ severity: 'info', summary: 'Shared', detail: 'Exported to cloud', life: 3000 });
                        }
                    }
                ]
            }
        ];
    }
}
```
