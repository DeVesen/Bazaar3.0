# Angular DataView Component — Layout

## Layout

DataView supports list and grid display modes defined with the layout property. The grid mode is not built-in for flexibility purposes and requires a library with CSS grid features like Tailwind.

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
        <p-dataview #dv [value]="products()" [layout]="layout">
            <ng-template #header>
                <div class="flex justify-end">
                    <p-selectbutton [(ngModel)]="layout" [options]="options" [allowEmpty]="false">
                        <ng-template #item let-item>
                            <i class="pi " [ngClass]="{ 'pi-bars': item === 'list', 'pi-table': item === 'grid' }"></i>
                        </ng-template>
                    </p-selectbutton>
                </div>
            </ng-template>
            <ng-template #list let-items>
                @for (item of items; track item.id; let first = $first) {
                    <div>
                        <div class="flex flex-col sm:flex-row sm:items-center p-5 gap-4" [ngClass]="{ 'border-t border-surface-200 dark:border-surface-700': !first }">
                            <div class="md:w-40 relative">
                                <img class="block xl:block mx-auto rounded-sm w-full" [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + item.image" [alt]="item.name" />
                                <p-tag [value]="item.inventoryStatus" [severity]="getSeverity(item)" class="absolute dark:bg-surface-900!" [style.left.px]="4" [style.top.px]="4" />
                            </div>
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-5">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                    <div>
                                        <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.category }}</span>
                                        <div class="font-medium mt-1">{{ item.name }}</div>
                                    </div>
                                    <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                        <div class="bg-surface-0 flex items-cent …(lange Zeile gekürzt)
                                            <span class="text-surface-900 font-medium text-xs">{{ item.rating }}</span>
                                            <i class="pi pi-star-fill text-yellow-500"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col md:items-end gap-7">
                                    <span class="font-semibold">{{ item.price | currency: 'USD' }}</span>
                                    <div class="flex flex-row-reverse md:flex-row gap-2">
                                        <button pButton [outlined]="true">
                                            <i class="pi pi-heart"></i>
                                        </button>
                                        <button pButton [disabled]="item.inventoryStatus === 'OUTOFSTOCK'" class="flex-auto md:flex-initial whitespace-nowrap">
                                            <i class="pi pi-shopping-cart"></i>
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                                    <!-- +3 gleichartige Zeilen -->
                }
            </ng-template>
            <ng-template #grid let-items>
                <div class="grid grid-cols-12 gap-4">
                    @for (product of items; track product.id) {
                        <div class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-6 p-2">
                            <div class="p-5 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded-sm flex flex-col">
                                <div class="bg-surface-50 flex justify-center rounded-sm p-4">
                                    <div class="relative mx-auto">
                                        <img class="rounded-sm w-full" [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" style="max-width: 300px" />
                                        <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product)" class="absolute dark:bg-surface-900!" [style.left.px]="4" [style.top.px]="4" />
                                    </div>
                                </div>
                                <div class="pt-5">
                                    <div class="flex flex-row justify-between products-start gap-2">
                                        <div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ product.category }}</span>
                                            <div class="font-medium mt-1">{{ product.name }}</div>
                                        </div>
                                        <div class="bg-surface-100 p-1" style="border-radius: 30px; height:100%">
                                            <div class="bg-surface-0 flex produc …(lange Zeile gekürzt)
                                                <span class="text-surface-900 font-medium text-sm">{{ product.rating }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-5 mt-5">
                                        <span class="font-semibold">{{ product.price | currency: 'USD' }}</span>
                                        <div class="flex gap-2">
                                            <button pButton [disabled]="product.inventoryStatus === 'OUTOFSTOCK'" class="flex-auto whitespace-nowrap">
                                                <i class="pi pi-shopping-cart"></i>
                                                Buy Now
                                            </button>
                                            <button pButton outlined>
                                                <i class="pi pi-heart"></i>
                                            </button>
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
export class DataViewLayoutDemo implements OnInit {
    private productService = inject(ProductService);

    products = signal<any>([]);

    options = ['list', 'grid'];

    ngOnInit() {
        this.productService.getProducts().then((data) => {
            this.products.set([...data.slice(0, 12)]);
        });
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
