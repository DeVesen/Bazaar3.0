# Angular Table Component — Columntoggle

## Columntoggle

Show/hide columns dynamically.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Cog } from '@primeicons/angular/cog';
import { Refresh } from '@primeicons/angular/refresh';
import { Bars } from '@primeicons/angular/bars';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <div class="mb-3 flex items-center justify-end">
            <button type="button" pButton variant="outlined" severity="secondary" size="small" (click)="op.toggle($event)">
                <svg data-p-icon="cog" />
                Columns
            </button>
            <p-popover #op styleClass="w-72" [pt]="{ content: 'p-0!' }">
                <ng-template #content>
                    <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                        <span class="text-sm font-semibold">Columns</span>
                        <button type="button" pButton variant="text" size="small" severity="secondary" (click)="reset()">
                            <svg data-p-icon="refresh" />
                            Reset
                        </button>
                    </div>
                    <div class="column-toggle-drag-list py-2 max-h-80 overflow-auto" cdkDropList (cdkDropListDropped)="drop($event)">
                        @for (col of cols; track col.field) {
                            <div class="flex items-center gap-2 px-3 py-1.5 mx-1 …(lange Zeile gekürzt)
                                <svg data-p-icon="bars" [size]="14" class="text-surface-400 dark:text-surface-500" />
                                <p-checkbox [(ngModel)]="visibleFields" [value]="col.field" [inputId]="col.field" (click)="$event.stopPropagation()" />
                                <label [for]="col.field" class="text-sm cursor-pointer" (click)="$event.stopPropagation()">{{ col.header }}</label>
                            </div>
                        }
                    </div>
                </ng-template>
            </p-popover>
        </div>
        <p-table [columns]="visibleColumns" [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col.field) {
                        <th>{{ col.header }}</th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-product let-columns="columns">
                <tr>
                    @for (col of columns; track col.field) {
                        <td>
                            @switch (col.field) {
                                @case ('name') {
                                    <div class="flex items-center gap-3">
                                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="36" height="36" class="rounded-md shadow" />
                                        <div class="flex flex-col">
                                            <span class="font-medium">{{ product.name }}</span>
                                            <span class="text-xs text-surface-500 dark:text-surface-400">{{ product.code }}</span>
                                        </div>
                                    </div>
                                }
                                @case ('category') {
                                    <p-tag [value]="product.category" severity="secondary" />
                                }
                                @case ('quantity') {
                                    {{ product.quantity }}
                                }
                                @case ('price') {
                                    <span class="font-semibold">{{ '$' + product.price }}</span>
                                }
                                @case ('rating') {
                                    {{ product.rating }}/5
                                }
                                @case ('inventoryStatus') {
                                    <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                                }
                            }
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    styles: [
        `
            .column-toggle-drag-preview {
                background: var(--p-content-background);
                border-radius: var(--p-content-border-radius);
                box-shadow: var(--p-overlay-popover-shadow);
            }
            .column-toggle-drag-list .cdk-drag-placeholder {
                opacity: 0.4;
            }
        `
    ],
    standalone: true,
    imports: [CheckboxModule, PopoverModule, TableModule, TagModule, ButtonModule, FormsModule, Cog, Refresh, Bars],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnToggleDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    cols = [...initialColumns];

    visibleFields = [...defaultVisibleFields];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 6);
        });
    }

    get visibleColumns(): Column[] {
        return this.cols.filter((col) => this.visibleFields.includes(col.field));
    }

    drop(event: CdkDragDrop<Column[]>) {
        moveItemInArray(this.cols, event.previousIndex, event.currentIndex);
    }

    reset() {
        this.cols = [...initialColumns];
        this.visibleFields = [...defaultVisibleFields];
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

    getSeverityLabel(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'In Stock';
            case 'LOWSTOCK':
                return 'Low Stock';
            case 'OUTOFSTOCK':
                return 'Out of Stock';
            default:
                return status;
        }
    }
}
```
