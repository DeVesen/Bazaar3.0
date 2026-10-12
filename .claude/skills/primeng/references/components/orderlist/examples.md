# Angular OrderList Component — Beispiele

## Basic

Selection-based reordering with move buttons. Click to select items, then use the buttons to move them up, down, to top, or to bottom.

```typescript
import { Component } from '@angular/core';
import { OrderListModule } from 'primeng/orderlist';

interface Movie {
    title: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-orderlist [value]="movies()" [responsive]="true" breakpoint="575px">
                <ng-template #item let-option let-index="index">
                    <div class="flex items-center gap-3 w-full min-w-0">
                        <span class="opacity-70 text-sm tabular-nums w-4 text-right shrink-0">{{ index + 1 }}</span>
                        <span class="text-sm truncate">{{ option.title }}</span>
                    </div>
                </ng-template>
            </p-orderlist>
        </div>
    `,
    standalone: true,
    imports: [OrderListModule]
})
export class OrderListBasicDemo {
    movies = signal<Movie[]>([
        { title: 'The Shawshank Redemption' },
        { title: 'Inception' },
        { title: 'Interstellar' },
        { title: 'The Dark Knight' },
        { title: 'Pulp Fiction' },
        { title: 'Baby Driver' },
        { title: 'Whiplash' },
        { title: 'Eternal Sunshine of the Spotless Mind' },
        { title: 'La La Land' },
        { title: 'Parasite' }
    ]);
}
```

## Checkbox

Combine with Checkbox for a visual multi-select experience alongside drag-and-drop reordering.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { OrderListModule } from 'primeng/orderlist';

interface Movie {
    title: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-orderlist [value]="movies()" [dragdrop]="true" [responsive]="true" breakpoint="575px" scrollHeight="20rem">
                <ng-template #item let-option let-selected="selected">
                    <div class="flex items-center gap-2 w-full min-w-0">
                        <p-checkbox [binary]="true" [ngModel]="selected" [readonly]="true" [tabindex]="-1" />
                        <span class="truncate">{{ option.title }}</span>
                    </div>
                </ng-template>
            </p-orderlist>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, OrderListModule, FormsModule]
})
export class OrderListCheckboxDemo {
    movies = signal<Movie[]>([
        { title: 'The Shawshank Redemption' },
        { title: 'Inception' },
        { title: 'Interstellar' },
        { title: 'The Dark Knight' },
        { title: 'Pulp Fiction' },
        { title: 'Baby Driver' },
        { title: 'Whiplash' },
        { title: 'Eternal Sunshine of the Spotless Mind' },
        { title: 'La La Land' },
        { title: 'Parasite' }
    ]);
}
```

## Dragdrop

Enable drag-and-drop reordering by setting dragdrop property to true. Items can be grabbed and dragged to a new position.

```typescript
import { Component } from '@angular/core';
import { OrderListModule } from 'primeng/orderlist';

interface Movie {
    title: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-orderlist [value]="movies()" [dragdrop]="true" [responsive]="true" breakpoint="575px" scrollHeight="20rem">
                <ng-template #item let-option>
                    <span class="truncate">{{ option.title }}</span>
                </ng-template>
            </p-orderlist>
        </div>
    `,
    standalone: true,
    imports: [OrderListModule]
})
export class OrderListDragDropDemo {
    movies = signal<Movie[]>([
        { title: 'The Shawshank Redemption' },
        { title: 'Inception' },
        { title: 'Interstellar' },
        { title: 'The Dark Knight' },
        { title: 'Pulp Fiction' },
        { title: 'Baby Driver' },
        { title: 'Whiplash' },
        { title: 'Eternal Sunshine of the Spotless Mind' },
        { title: 'La La Land' },
        { title: 'Parasite' }
    ]);
}
```

## Filter

Filter value is checked against the property of an object configured with the filterBy property.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { OrderListModule } from 'primeng/orderlist';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="sm:flex sm:justify-center">
            <p-orderlist [value]="products()" filterBy="name" filterPlaceholder="Filter by name" [responsive]="true" breakpoint="575px" scrollHeight="20rem" class="sm:min-w-96">
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
            </p-orderlist>
        </div>
    `,
    standalone: true,
    imports: [OrderListModule],
    providers: [ProductService]
})
export class OrderListFilterDemo implements OnInit {
    private productService = inject(ProductService);

    products = signal<Product[]>([]);

    ngOnInit() {
        this.productService.getProductsSmall().then((cars) => {
            this.products.set(cars);
        });
    }
}
```

## Template

For custom content support define an item template that gets the item instance as a parameter. In addition header template is provided for further customization.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { OrderListModule } from 'primeng/orderlist';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="sm:flex sm:justify-center">
            <p-orderlist [value]="products()" dataKey="id" [responsive]="true" breakpoint="575px" scrollHeight="20rem">
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
            </p-orderlist>
        </div>
    `,
    standalone: true,
    imports: [OrderListModule],
    providers: [ProductService]
})
export class OrderListTemplateDemo implements OnInit {
    private productService = inject(ProductService);

    products = signal<Product[]>([]);

    ngOnInit() {
        this.productService.getProductsSmall().then((cars) => {
            this.products.set(cars);
        });
    }
}
```
