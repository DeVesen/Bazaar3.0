# Angular DataView Component — Sorting

## Sorting

Built-in sorting is controlled by bindings sortField and sortOrder properties from a custom UI.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-dataview #dv [value]="products()" [sortField]="sortField" [sortOrder]="sortOrder">
            <ng-template #header>
                <div class="flex justify-center pb-4">
                    <p-selectbutton [options]="sortOptions" [(ngModel)]="sortKey" optionLabel="label" optionValue="value" (onChange)="onSortChange($event)" />
                </div>
            </ng-template>
            <ng-template #list let-items>
                <div class="grid grid-cols-12 gap-4 grid-nogutter">
                    @for (item of items; track item.id; let first = $first) {
                        <div class="col-span-12">
                            <div class="flex flex-col sm:flex-row sm:items-center p-5 gap-4" [ngClass]="{ 'border-t border-surface-200 dark:border-surface-700': !first }">
                                <div class="md:w-40 relative">
                                    <img class="block xl:block mx-auto rounded-border w-full" width="300" height="200" [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + item.image" [alt]="item.name" />
                                    <p-tag [value]="item.inventoryStatus" [severity]="getSeverity(item)" class="dark:bg-surface-900! absolute" [style.left.px]="4" [style.top.px]="4" />
                                </div>
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-5">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                        <div>
                                            <span class="font-medium text-secondary text-sm">{{ item.category }}</span>
                                            <div class="font-medium text-surface-900 dark:text-surface-0 mt-1">{{ item.name }}</div>
                                        </div>
                                        <div class="bg-surface-100 dark:bg-surface-700 p-1" style="border-radius: 30px">
                                            <div
                                                class="bg-surface-0 dark:bg-surface-900 flex items-center gap-2 justify-center py-0.5 px-1.5"
                                                style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                                            >
                                                <span class="text-surface-900 dark:text-surface-0 font-medium text-xs">{{ item.rating }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:items-end gap-7">
                                        <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ '$' + item.price }}</span>
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <button type="button" pButton [outlined]="true"><i class="pi pi-heart"></i></button>
                                            <button type="button" pButton class= …(lange Zeile gekürzt)
                                        </div>
                                    </div>
                                        <!-- +3 gleichartige Zeilen -->
                    }
                </div>
            </ng-template>
        </p-dataview>
    `,
    standalone: true,
    imports: [DataViewModule, SelectButtonModule, TagModule, ButtonModule, FormsModule],
    providers: [ProductService]
})
export class DataViewSortingDemo implements OnInit {
    private productService = inject(ProductService);

    sortOptions = [
        { label: 'Price High to Low', value: 'hightolow' },
        { label: 'Price Low to High', value: 'lowtohigh' }
    ];

    sortOrder!: number;

    sortField!: string;

    sortKey!: string;

    products = signal<any>([]);

    ngOnInit() {
        this.productService.getProducts().then((data) => this.products.set(data.slice(0, 5)));
    }

    onSortChange(event: any) {
        const value = event.value;

        if (value === 'hightolow') {
            this.sortOrder = -1;
            this.sortField = 'price';
        } else if (value === 'lowtohigh') {
            this.sortOrder = 1;
            this.sortField = 'price';
        }
    }

    getSeverity(product: Product) {
        switch (product.inventoryStatus) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warn';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return null;
        }
    }
}
```
