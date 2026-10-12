# Angular Divider Component — Beispiele

## Basic

Divider is placed between items to separate content.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="max-w-sm w-full text-sm">
                <div class="flex items-center justify-between">
                    <span class="text-color font-medium">Subtotal</span>
                    <span class="text-color">$89.00</span>
                </div>
                <p-divider />
                <div class="flex items-center justify-between">
                    <span class="text-color font-medium">Shipping</span>
                    <span class="text-color">$5.99</span>
                </div>
                <p-divider />
                <div class="flex items-center justify-between">
                    <span class="text-color font-semibold">Total</span>
                    <span class="text-color font-semibold">$94.99</span>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule]
})
export class DividerBasicDemo {}
```

## Content

Children are rendered within the boundaries of the divider where location of the content is configured with the align property. In horizontal layout, alignment options are left , center and right whereas vertical mode supports top , center and bottom .

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="max-w-md w-full">
                <p class="text-sm">Fast setup with a simple onboarding process, no credit card required to get started.</p>
                <p-divider align="left" type="solid">
                    <code class="uppercase text-xs">Getting started</code>
                </p-divider>
                <p class="text-sm">Cancel anytime directly from your account settings, with no questions asked.</p>
                <p-divider align="center" type="dotted">
                    <code class="uppercase text-xs">Flexibility</code>
                </p-divider>
                <p class="text-sm">24/7 support included to help you resolve issues quickly, whenever you need assistance.</p>
                <p-divider align="right" type="dashed">
                    <code class="uppercase text-xs">Support</code>
                </p-divider>
                <p class="text-sm">No long-term commitments or hidden contracts, just transparent and flexible pricing.</p>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule]
})
export class DividerContentDemo {}
```

## Type

Style of the border is configured with the type property that can be solid , dotted or dashed .

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="max-w-md w-full">
                <p class="text-sm">Fast setup, no credit card required</p>
                <p-divider type="solid" />
                <p class="text-sm">Cancel anytime from your account</p>
                <p-divider type="dotted" />
                <p class="text-sm">24/7 support included</p>
                <p-divider type="dashed" />
                <p class="text-sm">No long-term commitments</p>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule]
})
export class DividerTypeDemo {}
```

## Vertical

Vertical divider is enabled by setting the layout property as vertical .

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex w-fit">
                <div>
                    <div class="uppercase font-mono text-xs">Invoice No</div>
                    <div class="font-light">0000123</div>
                </div>
                <p-divider layout="vertical" />
                <div>
                    <div class="uppercase font-mono text-xs">Issued</div>
                    <div class="font-light">01/01/2026</div>
                </div>
                <p-divider layout="vertical" />
                <div>
                    <div class="uppercase font-mono text-xs">Due Date</div>
                    <div class="font-light">02/02/2026</div>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule]
})
export class DividerVerticalDemo {}
```
