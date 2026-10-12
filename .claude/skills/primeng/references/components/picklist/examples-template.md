# Angular PickList Component — Template

## Template

For custom content support define an item template that gets the item instance as a parameter. In addition sourceheader and targetheader templates are provided for further customization.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { PickListModule } from 'primeng/picklist';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-picklist [source]="sourceProducts()" [target]="targetProducts()" [dra …(lange Zeile gekürzt)
            <ng-template let-option let-selected="selected" #item>
                <div class="flex flex-wrap p-1 items-center gap-4 w-full">
                    <img class="w-12 shrink-0 rounded-sm" src="https://primefaces.org/cdn/primeng/images/demo/product/{{ option.image }}" [alt]="option.name" />
                    <div class="flex-1 flex flex-col">
                        <span class="font-medium text-sm">{{ option.name }}</span>
                        <span [class]="selected ? 'text-sm text-inherit' : 'text-sm text-surface-500 dark:text-surface-400'">{{ option.category }}</span>
                    </div>
                    <span class="font-bold sm:ml-8">{{ '$' + option.price }}</span>
                </div>
            </ng-template>
            <ng-template #emptymessagesource>
                <div class="flex items-center justify-center min-h-40 p-6 text-surface-500 dark:text-surface-400">No products available</div>
            </ng-template>
            <ng-template #emptymessagetarget>
                <div class="flex items-center justify-center min-h-40 p-6 text-surface-500 dark:text-surface-400">Drag products here</div>
            </ng-template>
        </p-picklist>
    `,
    standalone: true,
    imports: [PickListModule],
    providers: [ProductService]
})
export class PickListTemplateDemo implements OnInit {
    private carService = inject(ProductService);

    sourceProducts = signal<Product[]>([]);

    targetProducts = signal<Product[]>([]);

    ngOnInit() {
        this.carService.getProductsSmall().then((products) => {
            this.sourceProducts.set(products);
        });
    }
}
```
