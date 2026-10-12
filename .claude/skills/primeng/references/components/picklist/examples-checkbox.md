# Angular PickList Component — Checkbox

## Checkbox

Combine with Checkbox and a select-all header for batch selection alongside drag-and-drop.

```typescript
import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { PickListModule } from 'primeng/picklist';
import { LabelModule } from 'primeng/label';

interface Person {
    name: string;
}

@Component({
    template: `
        <p-picklist #pl [source]="sourcePeople" [target]="targetPeople" [dragdrop]="true" [responsive]="true" breakpoint="1400px">
            <ng-template #sourceHeader>
                <div class="flex flex-col -mx-2 -mb-0.5">
                    <div class="px-2 pb-1.5">
                        <label pLabel class="ml-1.5">Available Members</label>
                    </div>
                    <div class="flex items-center gap-2 px-2 py-1" (click)="$event.stopPropagation()">
                        <p-checkbox [binary]="true" [ngModel]="isAllSourceSelected()" [indeterminate]="isSourceIndeterminate()" (onChange)="toggleAllSource($event.checked)" [tabindex]="-1" />
                    </div>
                </div>
            </ng-template>
            <ng-template #targetHeader>
                <div class="flex flex-col -mx-2 -mb-0.5">
                    <div class="px-2 pb-1.5">
                        <label pLabel class="ml-1.5">Team Members</label>
                    </div>
                    <div class="flex items-center gap-2 px-2 py-1" (click)="$event.stopPropagation()">
                        <p-checkbox [binary]="true" [ngModel]="isAllTargetSelected()" [indeterminate]="isTargetIndeterminate()" (onChange)="toggleAllTarget($event.checked)" [tabindex]="-1" />
                    </div>
                </div>
            </ng-template>
            <ng-template let-item #item let-selected="selected">
                <div class="flex items-center gap-2 w-full min-w-0">
                    <p-checkbox [binary]="true" [ngModel]="selected" [readonly]="true" [tabindex]="-1" />
                    <span class="truncate">{{ item.name }}</span>
                </div>
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
    imports: [CheckboxModule, PickListModule, LabelModule, FormsModule]
})
export class PickListCheckboxDemo {
    pickList = viewChild<PickList>('pl');

    sourcePeople: Person[] = [
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

    targetPeople: Person[] = [];

    isAllSourceSelected(): boolean {
        const pl = this.pickList();

        return !!pl && this.sourcePeople.length > 0 && pl.selectedItemsSource.length === this.sourcePeople.length;
    }

    isSourceIndeterminate(): boolean {
        const pl = this.pickList();

        return !!pl && pl.selectedItemsSource.length > 0 && pl.selectedItemsSource.length < this.sourcePeople.length;
    }

    isAllTargetSelected(): boolean {
        const pl = this.pickList();

        return !!pl && this.targetPeople.length > 0 && pl.selectedItemsTarget.length === this.targetPeople.length;
    }

    isTargetIndeterminate(): boolean {
        const pl = this.pickList();

        return !!pl && pl.selectedItemsTarget.length > 0 && pl.selectedItemsTarget.length < this.targetPeople.length;
    }

    toggleAllSource(checked: boolean) {
        const pl = this.pickList();

        if (pl) {
            pl.selectedItemsSource = checked ? [...this.sourcePeople] : [];
        }
    }

    toggleAllTarget(checked: boolean) {
        const pl = this.pickList();

        if (pl) {
            pl.selectedItemsTarget = checked ? [...this.targetPeople] : [];
        }
    }
}
```
