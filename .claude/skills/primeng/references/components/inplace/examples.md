# Angular Inplace Component — Beispiele

## Basic

Inplace component requires display and content templates to define the content of each state.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InplaceModule } from 'primeng/inplace';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="max-w-3xs mx-auto w-full">
            <div class="font-mono uppercase text-xs opacity-50 pl-2 mb-1">Name</div>
            <p-inplace [pt]="{ display: 'w-full' }">
                <ng-template #display>
                    <span class="w-full text-sm">John Doe</span>
                </ng-template>
                <ng-template #content let-closeCallback="closeCallback">
                    <p-inputgroup>
                        <input pInputText [(ngModel)]="name" placeholder="Enter name" class="flex-1" fluid [pAutoFocus]="true" />
                        <p-inputgroup-addon>
                            <button pButton text severity="success">
                                <svg data-p-icon="check"></svg>
                            </button>
                        </p-inputgroup-addon>
                        <p-inputgroup-addon>
                            <button pButton text severity="danger" (click)="closeCallback($event)">
                                <svg data-p-icon="times"></svg>
                            </button>
                        </p-inputgroup-addon>
                    </p-inputgroup>
                </ng-template>
            </p-inplace>
        </div>
    `,
    standalone: true,
    imports: [InplaceModule, InputGroupModule, InputGroupAddonModule, ButtonModule, InputTextModule, AutoFocusModule, FormsModule, Check, Times]
})
export class InplaceBasicDemo {
    name: string = '';
}
```

## Controlled

The active state can be controlled programmatically with the active property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InplaceModule } from 'primeng/inplace';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';

@Component({
    template: `
        <div class="max-w-3xs mx-auto w-full">
            <div class="font-mono uppercase text-xs opacity-50 pl-2 mb-1">Name</div>
            <p-inplace #ip [pt]="{ display: 'w-full' }">
                <ng-template #display>
                    <span class="w-full text-sm">John Doe</span>
                </ng-template>
                <ng-template #content>
                    <input pInputText [(ngModel)]="name" placeholder="Enter name" class="flex-1" fluid [pAutoFocus]="true" />
                </ng-template>
            </p-inplace>
            <div class="flex items-center gap-2 mt-2">
                <button pButton class="flex-1" variant="outlined" severity="secondary" (click)="ip.active() ? ip.deactivate() : ip.activate()">{{ ip.active() ? 'Cancel' : 'Edit Name' }}</button>
                @if (ip.active()) {
                    <button pButton class="flex-1" variant="outlined" fluid (click)="ip.deactivate()">Save</button>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [InplaceModule, ButtonModule, InputTextModule, AutoFocusModule, FormsModule]
})
export class InplaceControlledDemo {
    name: string = '';
}
```

## Image

Any content such as an image can be placed inside an Inplace.

```typescript
import { Component } from '@angular/core';
import { InplaceModule } from 'primeng/inplace';
import { Photo } from '@/domain/photo';
import { Image } from '@primeicons/angular/image';

@Component({
    template: `
        <p-inplace>
            <ng-template #display>
                <span class="inline-flex items-center gap-2">
                    <svg data-p-icon="image" style="vertical-align: middle"></svg>
                    <span class="ml-2 text-sm">View Photo</span>
                </span>
            </ng-template>
            <ng-template #content>
                <img class="w-full sm:w-80 shadow-md" src="https://primefaces.org/cdn/primeng/images/demo/galleria/galleria5.jpg" alt="Nature" />
            </ng-template>
        </p-inplace>
    `,
    standalone: true,
    imports: [InplaceModule, Image]
})
export class InplaceImageDemo {}
```

## Input

The closeCallback switches the state back to display mode when called from an event.

```typescript
import { Component } from '@angular/core';
import { InplaceModule } from 'primeng/inplace';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <p-inplace>
            <ng-template #display>
                <span class="text-sm">Click to Edit</span>
            </ng-template>
            <ng-template #content let-closeCallback="closeCallback">
                <span class="inline-flex gap-2">
                    <input type="text" pInputText [pAutoFocus]="true" />
                    <button type="button" pButton (click)="closeCallback($event)" text severity="danger">
                        <svg data-p-icon="times"></svg>
                    </button>
                </span>
            </ng-template>
        </p-inplace>
    `,
    standalone: true,
    imports: [InplaceModule, ButtonModule, InputTextModule, AutoFocusModule, Times]
})
export class InplaceInputDemo {}
```

## Lazy

Using the onActivate event, data can be loaded in a lazy manner before displaying it in a table.

```typescript
import { Component, inject } from '@angular/core';
import { InplaceModule } from 'primeng/inplace';
import { TableModule } from 'primeng/table';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-inplace (onActivate)="loadData()">
            <ng-template #display>
                <span class="text-sm">View Data</span>
            </ng-template>
            <ng-template #content>
                <p-table [value]="products">
                    <ng-template #header>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
                            <td>{{ product.code }}</td>
                            <td>{{ product.name }}</td>
                            <td>{{ product.category }}</td>
                            <td>{{ product.quantity }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </ng-template>
        </p-inplace>
    `,
    standalone: true,
    imports: [InplaceModule, TableModule],
    providers: [ProductService]
})
export class InplaceLazyDemo {
    private productService = inject(ProductService);

    products: Product[] | undefined;

    loadData() {
        this.productService.getProductsMini().then((products) => (this.products = products));
    }
}
```
