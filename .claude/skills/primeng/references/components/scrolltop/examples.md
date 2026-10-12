# Angular Scroll Top Component — Beispiele

## Basic

ScrollTop listens window scroll by default.

```typescript
import { Component } from '@angular/core';
import { ScrollTopModule } from 'primeng/scrolltop';

@Component({
    template: `
        <div class="flex flex-col items-center">
            <p class="text-sm">Scroll down the page to display the ScrollTo component.</p>
            <i class="pi pi-angle-down animate-fadeout animate-duration-1000 animate-infinite" style="fontsize: 1.75rem; margin-bottom: 26.25rem"></i>
            <p-scrolltop />
        </div>
    `,
    standalone: true,
    imports: [ScrollTopModule]
})
export class ScrollTopBasicDemo {}
```

## Target Element

Setting the target property to parent binds ScrollTop to its parent element that has scrolling content.

```typescript
import { Component } from '@angular/core';
import { ScrollTopModule } from 'primeng/scrolltop';

@Component({
    template: `
        <div class="flex justify-center">
            <div style="width: 250px; height: 200px; overflow: auto">
                <p class="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed …(lange Zeile gekürzt)
                    adipiscing elit ut. Nam libero justo laoreet sit amet. Phare …(lange Zeile gekürzt)
                    augue mauris. Semper feugiat nibh sed pulvinar proin gravida …(lange Zeile gekürzt)
                    nisl purus. Cursus sit amet dictum sit amet. Tristique senec …(lange Zeile gekürzt)
                    viverra accumsan in nisl nisi. Suscipit adipiscing bibendum est ultricies integer. Mattis aliquam faucibus purus in massa tempor nec.
                </p>
                <p-scrolltop target="parent" [threshold]="100" icon="pi pi-arrow-up" [buttonProps]="{ severity: 'contrast', raised: true, rounded: true }" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [ScrollTopModule]
})
export class ScrollTopElementDemo {}
```
