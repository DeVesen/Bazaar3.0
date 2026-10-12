# Angular Speed Dial Component — Transition Delay

## Transition Delay

The transitionDelay property specifies the delay in milliseconds between each action item's appearance animation.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-between" style="position: relative; height: 240px;">
            <p-speeddial [model]="items" direction="up" [transitionDelay]="0" [style]="{ position: 'absolute', left: 0, bottom: 0 }" [buttonProps]="{ severity: 'secondary', rounded: true }" />
            <p-speeddial [model]="items" direction="up" [transitionDelay]="80" [style]="{ position: 'absolute', left: 'calc(50% - 2rem)', bottom: 0 }" [buttonProps]="{ severity: 'success', rounded: true }" />
            <p-speeddial [model]="items" direction="up" [transitionDelay]="150" [style]="{ position: 'absolute', right: 0, bottom: 0 }" [buttonProps]="{ severity: 'info', rounded: true }" />
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule],
    providers: [MessageService]
})
export class SpeedDialTransitionDelayDemo implements OnInit {
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
