# Angular Speed Dial Component — Template

## Template

SpeedDial supports full customization of the trigger button and action items using the button and item templates.

```typescript
import { Component, OnInit } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center" style="position: relative; height: 450px">
            <p-speeddial [model]="items" direction="down" [transitionDelay]="50" [style]="{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }" [buttonProps]="{ severity: 'warn', rounded: true }">
                <ng-template #item let-item let-toggleCallback="toggleCallback">
                    <div class="flex gap-3 cursor-pointer rounded-lg" (click)="toggleCallback($event, item)">
                        <span class="flex items-center justify-center w-24 px-6  …(lange Zeile gekürzt)
                            {{ item.label }}
                        </span>
                        <span class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400">
                            <i [class]="item.icon + ' text-xl'"></i>
                        </span>
                    </div>
                </ng-template>
            </p-speeddial>
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule]
})
export class SpeedDialTemplateDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Like',
                icon: 'pi pi-heart'
            },
            {
                label: 'Share',
                icon: 'pi pi-share-alt'
            },
            {
                label: 'Print',
                icon: 'pi pi-print'
            },
            {
                label: 'Save',
                icon: 'pi pi-save'
            },
            {
                label: 'Copy',
                icon: 'pi pi-copy'
            }
        ];
    }
}
```
