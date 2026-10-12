# Angular MultiSelect Component — VirtualScroll

## VirtualScroll

VirtualScrolling is an efficient way of rendering the options by displaying a small subset of data in the viewport at any time. When dealing with huge number of options, it is suggested to enable VirtualScrolling to avoid performance issues. Usage is simple as setting virtualScroll property to true and defining virtualScrollItemSize to specify the height of an item.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    template: `
        <div class="flex justify-center">
            <p-multiselect
                [options]="items"
                [showToggleAll]="true"
                [selectAll]="selectAll"
                [(ngModel)]="selectedItems"
                optionLabel="label"
                [virtualScroll]="true"
                [virtualScrollItemSize]="43"
                placeholder="Select Cities"
                (onSelectAllChange)="onSelectAllChange($event)"
                [maxSelectedLabels]="3"
                class="w-full md:w-80"
                #ms
            >
                <ng-template #headercheckboxicon let-allSelected="checked" let-partialSelected="partialSelected">
                    @if (allSelected) {
                        <i class="pi pi-check"></i>
                    }
                    @if (partialSelected) {
                        <i class="pi pi-minus" [ngStyle]="{ color: 'var(--text-color)' }"></i>
                    }
                </ng-template>
            </p-multiselect>
        </div>
    `,
    standalone: true,
    imports: [MultiSelectModule, FormsModule]
})
export class MultiSelectVirtualScrollDemo {
    items = Array.from({ length: 100000 }, (_, i) => ({ label: `Item #${i}`, value: i }));

    selectedItems!: any[];

    selectAll: boolean = false;

    onSelectAllChange(event) {
        this.selectedItems = event.checked ? [...this.ms.visibleOptions()] : [];
        this.selectAll = event.checked;
    }
}
```
