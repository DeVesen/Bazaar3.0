# Angular Scroll Panel Component — Beispiele

## Basic

ScrollPanel is defined using dimensions for the scrollable viewport.

```typescript
import { Component } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    template: `
        <p-scrollpanel [style]="{ width: '100%', height: '150px' }">
            <p class="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  …(lange Zeile gekürzt)
                consequat. Duis aute irure dolor in reprehenderit in voluptate v …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem a …(lange Zeile gekürzt)
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit …(lange Zeile gekürzt)
            </p>
            <p class="m-0 text-sm">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui b …(lange Zeile gekürzt)
                officia deserunt mollitia animi, id est laborum et dolorum fuga. …(lange Zeile gekürzt)
            </p>
        </p-scrollpanel>
    `,
    standalone: true,
    imports: [ScrollPanelModule]
})
export class ScrollPanelBasicDemo {}
```

## Custom

Scrollbar visuals can be styled for a unified look across different platforms.

```typescript
import { Component } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    template: `
        <p-scrollpanel [style]="{ width: '100%', height: '200px' }">
            <p class="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  …(lange Zeile gekürzt)
                consequat. Duis aute irure dolor in reprehenderit in voluptate v …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem a …(lange Zeile gekürzt)
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui b …(lange Zeile gekürzt)
                officia deserunt mollitia animi, id est laborum et dolorum fuga. …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  …(lange Zeile gekürzt)
                consequat. Duis aute irure dolor in reprehenderit in voluptate v …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem a …(lange Zeile gekürzt)
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit …(lange Zeile gekürzt)
            </p>
            <p class="text-sm">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui b …(lange Zeile gekürzt)
                officia deserunt mollitia animi, id est laborum et dolorum fuga. …(lange Zeile gekürzt)
            </p>
        </p-scrollpanel>
    `,
    styles: [
        `
            :host ::ng-deep {
                .p-scrollpanel {
                    &.custombar {
                        .p-scrollpanel-bar {
                            background-color: var(--p-primary-color);
                        }
                    }
                }
            }
        `
    ],
    standalone: true,
    imports: [ScrollPanelModule]
})
export class ScrollPanelCustomDemo {}
```
