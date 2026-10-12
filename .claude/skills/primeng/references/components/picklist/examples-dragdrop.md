# Angular PickList Component — Dragdrop

## Dragdrop

Enable drag-and-drop by setting dragdrop to true. Items can be dragged within a list to reorder, or dragged across lists to transfer.

```typescript
import { Component } from '@angular/core';
import { PickListModule } from 'primeng/picklist';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <p-picklist [source]="sourcePeople" [target]="targetPeople" [dragdrop]="true" [responsive]="true" breakpoint="1400px">
            <ng-template #sourceHeader>
                <label pLabel class="ml-1.5">Available Members</label>
            </ng-template>
            <ng-template #targetHeader>
                <label pLabel class="ml-1.5">Team Members</label>
            </ng-template>
            <ng-template let-item #item>
                {{ item.name }}
            </ng-template>
            <ng-template #emptymessagesource>
                <div class="flex items-center justify-center min-h-40 p-6 text-surface-500 dark:text-surface-400">No available members</div>
            </ng-template>
            <ng-template #emptymessagetarget>
                <div class="flex items-center justify-center min-h-40 p-6 text-surface-500 dark:text-surface-400">Drag members here</div>
            </ng-template>
        </p-picklist>
    `,
    standalone: true,
    imports: [PickListModule, LabelModule]
})
export class PickListDragDropDemo {
    sourcePeople = [
        { name: 'Amy Elsner' },
        { name: 'Asiya Javayant' },
        { name: 'Onyama Limba' },
        { name: 'Anna Fali' },
        { name: 'Bernardo Dominic' },
        { name: 'Elwin Sharvill' },
        { name: 'Ioni Bowcher' },
        { name: 'Stephen Shaw' },
        { name: 'Ivan Magalhaes' },
        { name: 'Xuxue Feng' }
    ];
}
```
