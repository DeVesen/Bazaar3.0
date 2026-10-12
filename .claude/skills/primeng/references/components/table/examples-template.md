# Angular Table Component — Template

## Template

Custom content at header , body and footer sections are supported via templating.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Refresh } from '@primeicons/angular/refresh';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-table [value]="products" [tableStyle]="{ 'min-width': '60rem' }">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold">Products</span>
                    <button type="button" pButton iconOnly rounded raised><svg data-p-icon="refresh" /></button>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Reviews</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td>{{ product.name }}</td>
                    <td>
                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" class="w-24 rounded-sm" />
                    </td>
                    <td>{{ '$' + product.price }}</td>
                    <td>{{ product.category }}</td>
                    <td><p-rating [(ngModel)]="product.rating" [readonly]="true" /></td>
                    <td>
                        <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #footer>
                <tr>
                    <td colspan="6" class="text-sm">In total there are {{ products ? products.length : 0 }} products.</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [RatingModule, TableModule, TagModule, ButtonModule, FormsModule, Refresh],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableTemplateDemo implements OnInit {
    products!: Product[];

    cols!: Column[];

    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
        });
        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'name', header: 'Name' },
            { field: 'category', header: 'Category' },
            { field: 'quantity', header: 'Quantity' }
        ];
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
        }
    }
}
```
