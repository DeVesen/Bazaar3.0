# Angular Panel Component — Template

## Template

Header and footer sections can be customized using header and footer templates.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { Product } from '@/domain/product';
import { Cog } from '@primeicons/angular/cog';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { User } from '@primeicons/angular/user';
import { Bookmark } from '@primeicons/angular/bookmark';

@Component({
    template: `
        <div class="flex justify-center">
            <p-panel [toggleable]="true" class="max-w-xs w-full" [pt]="{ header: 'p-4!' }">
                <ng-template #header>
                    <div class="flex items-center gap-2">
                        <p-avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
                        <span class="font-bold">Amy Elsner</span>
                    </div>
                </ng-template>
                <ng-template #icons>
                    <button type="button" pButton iconOnly severity="secondary" rounded text>
                        <svg data-p-icon="cog"></svg>
                    </button>
                </ng-template>
                <ng-template #headericons let-collapsed>
                    <svg data-p-icon="chevron-down" [class]="collapsed ? 'transition-transform duration-200' : 'transition-transform duration-200 rotate-180'"></svg>
                </ng-template>
                <ng-template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-2">
                            <button type="button" pButton iconOnly rounded text>
                                <svg data-p-icon="user"></svg>
                            </button>
                            <button type="button" pButton iconOnly severity="secondary" rounded text>
                                <svg data-p-icon="bookmark"></svg>
                            </button>
                        </div>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">Updated 2 hours ago</span>
                    </div>
                </ng-template>
                <p class="m-0 text-sm">
                    Product designer focused on accessible interfaces, scalable  …(lange Zeile gekürzt)
                    platforms. Currently exploring AI-assisted UI tooling, compo …(lange Zeile gekürzt)
                </p>
            </p-panel>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, PanelModule, ButtonModule, Cog, ChevronDown, User, Bookmark]
})
export class PanelTemplateDemo {}
```
