# Angular Drag and Drop Component — DataTable

## DataTable

Drag and Drop to Table

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DragDropModule } from 'primeng/dragdrop';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="grid grid-cols-12 gap-4 grid-nogutter">
            <div class="col-span-12 md:col-span-6 drag-column">
                @for (product of availableProducts; track product.id) {
                    <div>
                        <div class="product-item" pDraggable="products" (onDragStart)="dragStart(product)" (onDragEnd)="dragEnd()">
                            <div class="image-container">
                                <img src="https://primefaces.org/cdn/primeng/images/demo/product/{{ product.image }}" [alt]="product.name" class="product-image" />
                            </div>
                            <div class="product-list-detail">
                                <h5 class="mb-2">{{ product.name }}</h5>
                                <i class="pi pi-tag product-category-icon"></i>
                                <span class="product-category">{{ product.category }}</span>
                            </div>
                            <div class="product-list-action">
                                <h6 class="mb-2">{{ product.price }}</h6>
                                <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div class="col-span-12 md:col-span-6 drop-column" pDroppable="products" (onDrop)="drop()">
                <p-table [value]="selectedProducts">
                    <ng-template #header>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Price</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
                            <td>{{ product.id }}</td>
                            <td>{{ product.category }}</td>
                            <td>{{ product.name }}</td>
                            <td>{{ product.price }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    standalone: true,
    imports: [TableModule, TagModule, DragDropModule],
    providers: [ProductService]
})
export class DragDropDataTableDemo implements OnInit {
    private productService = inject(ProductService);

    availableProducts: Product[] | undefined;

    selectedProducts: Product[] | undefined;

    draggedProduct: Product | undefined | null;

    ngOnInit() {
        this.selectedProducts = [];
        this.productService.getProductsSmall().then((products) => (this.availableProducts = products));
    }

    dragStart(product: Product) {
        this.draggedProduct = product;
    }

    drop() {
        if (this.draggedProduct) {
            let draggedProductIndex = this.findIndex(this.draggedProduct);

            this.selectedProducts = [...(this.selectedProducts as Product[]), this.draggedProduct];
            this.availableProducts = this.availableProducts?.filter((val, i) => i != draggedProductIndex);
            this.draggedProduct = null;
        }
    }

    dragEnd() {
        this.draggedProduct = null;
    }

    findIndex(product: Product) {
        let index = -1;

        for (let i = 0; i < (this.availableProducts as Product[]).length; i++) {
            if (product.id === (this.availableProducts as Product[])[i].id) {
                index = i;
                break;
            }
        }

        return index;
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
