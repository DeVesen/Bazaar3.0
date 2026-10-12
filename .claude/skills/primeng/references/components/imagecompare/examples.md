# Angular ImageCompare Component — Beispiele

## Basic

Images are defined using templating with left and right templates. Use the style or class properties to define the size of the container.

```typescript
import { Component } from '@angular/core';
import { ImageCompareModule } from 'primeng/imagecompare';

@Component({
    template: `
        <div class="flex justify-center">
            <p-imagecompare class="shadow-lg rounded-2xl">
                <ng-template #left>
                    <img src="https://primefaces.org/cdn/primevue/images/compare/island1.jpg" />
                </ng-template>
                <ng-template #right>
                    <img src="https://primefaces.org/cdn/primevue/images/compare/island2.jpg" />
                </ng-template>
            </p-imagecompare>
        </div>
    `,
    standalone: true,
    imports: [ImageCompareModule]
})
export class ImageCompareBasicDemo {}
```

## Responsive

Apply responsive styles to the container element to optimize display per screen size.

```typescript
import { Component } from '@angular/core';
import { ImageCompareModule } from 'primeng/imagecompare';

@Component({
    template: `
        <div class="flex justify-center">
            <p-imagecompare class="sm:w-96! shadow-lg rounded-2xl">
                <ng-template #left>
                    <img src="https://primefaces.org/cdn/primevue/images/compare/island1.jpg" />
                </ng-template>
                <ng-template #right>
                    <img src="https://primefaces.org/cdn/primevue/images/compare/island2.jpg" />
                </ng-template>
            </p-imagecompare>
        </div>
    `,
    standalone: true,
    imports: [ImageCompareModule]
})
export class ImageCompareResponsiveDemo {}
```
