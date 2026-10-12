# Angular AutoComplete Component — Clear-icon

## Clear-icon

When showClear is enabled, a clear icon is displayed to reset the value.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';

interface ProductCategory {
    label: string;
    value: string;
    count: number;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete
                [(ngModel)]="selectedCategory"
                [suggestions]="filteredCategories"
                (completeMethod)="search($event)"
                optionLabel="label"
                [showClear]="true"
                placeholder="Search categories..."
                inputStyleClass="w-full md:w-56"
                scrollHeight="14rem"
            >
                <ng-template let-category #item>
                    <div class="flex items-center justify-between w-full">
                        <span>{{ category.label }}</span>
                        <p-tag [value]="category.count.toString()" severity="secondary" [rounded]="true" />
                    </div>
                </ng-template>
            </p-autocomplete>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, TagModule, FormsModule]
})
export class AutoCompleteClearIconDemo {
    selectedCategory: ProductCategory | undefined;

    filteredCategories: ProductCategory[] = [];

    productCategories: ProductCategory[] = [
        { label: 'Electronics', value: 'electronics', count: 1247 },
        { label: 'Clothing', value: 'clothing', count: 856 },
        { label: 'Garden', value: 'home', count: 634 },
        { label: 'Sports', value: 'sports', count: 421 },
        { label: 'Books', value: 'books', count: 2103 },
        { label: 'Toys', value: 'toys', count: 312 }
    ];

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();

        this.filteredCategories = query ? this.productCategories.filter((cat) => cat.label.toLowerCase().includes(query)) : [...this.productCategories];
    }
}
```
