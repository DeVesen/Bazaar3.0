# Angular Select Component — Clear

## Clear

When showClear is enabled, a clear icon is displayed to clear the value.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

interface Category {
    label: string;
    value: string;
    count: number;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="categories" [(ngModel)]="selectedCategory" optionLabel="label" placeholder="Category" class="w-full md:w-56" [showClear]="true">
                <ng-template let-category #item>
                    <div class="flex items-center justify-between w-full">
                        <span>{{ category.label }}</span>
                        <p-tag [value]="'' + category.count" severity="secondary" [rounded]="true" />
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, TagModule, FormsModule]
})
export class SelectClearIconDemo {
    categories: Category[] = [
        { label: 'Electronics', value: 'electronics', count: 1247 },
        { label: 'Clothing', value: 'clothing', count: 856 },
        { label: 'Garden', value: 'home', count: 634 },
        { label: 'Sports', value: 'sports', count: 421 },
        { label: 'Books', value: 'books', count: 2103 },
        { label: 'Toys', value: 'toys', count: 312 }
    ];

    selectedCategory: Category | undefined;
}
```
