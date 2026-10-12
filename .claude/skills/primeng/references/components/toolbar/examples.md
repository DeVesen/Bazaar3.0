# Angular Toolbar Component — Beispiele

## Basic

Combines action buttons and controls in a horizontal bar.

```typescript
import { Component } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Plus } from '@primeicons/angular/plus';
import { Upload } from '@primeicons/angular/upload';

@Component({
    template: `
        <p-toolbar>
            <ng-template #start>
                <button pButton iconOnly class="mr-2" variant="text" severity="secondary"><svg data-p-icon="plus" /></button>
                <button pButton iconOnly class="mr-2" variant="text" severity="secondary"><i class="pi pi-print"></i></button>
                <button pButton iconOnly variant="text" severity="secondary"><svg data-p-icon="upload" /></button>
            </ng-template>
            <ng-template #center>
                <p-iconfield iconPosition="left">
                    <p-inputicon class="pi pi-search" />
                    <input type="text" pInputText placeholder="Search" />
                </p-iconfield>
            </ng-template>
            <ng-template #end>
                <button pButton severity="secondary" variant="outlined" size="small">Cancel</button>
                <button pButton size="small" class="ml-2">Save</button>
            </ng-template>
        </p-toolbar>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, ToolbarModule, ButtonModule, InputTextModule, Plus, Upload]
})
export class ToolbarBasicDemo {}
```

## Custom

A customized toolbar with navigation bar functionality.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { Search } from '@primeicons/angular/search';

@Component({
    template: `
        <p-toolbar [pt]="{ start: { class: 'flex-wrap' } }" [style]="{ 'border-radius': '3rem', padding: '0.75rem 1rem 0.75rem 1.5rem', background: 'var(--p-surface-900)', border: 'none' }">
            <ng-template #start>
                <div class="flex items-center gap-1">
                    <i class="pi pi-prime text-xl" style="color: var(--p-primary-400)"></i>
                    <span class="font-bold text-lg ml-2" style="color: var(--p-surface-0)">Brand</span>
                </div>
                <div class="ml-6 flex flex-wrap gap-1">
                    <button pButton variant="text" size="small" class="text-surface-0! hover:bg-surface-700!">Products</button>
                    <button pButton variant="text" size="small" class="text-surface-0! hover:bg-surface-700!">Solutions</button>
                    <button pButton variant="text" size="small" class="text-surface-0! hover:bg-surface-700!">Resources</button>
                    <button pButton variant="text" size="small" class="text-surface-0! hover:bg-surface-700!">Pricing</button>
                </div>
            </ng-template>
            <ng-template #end>
                <div class="flex items-center gap-2">
                    <button pButton variant="text" size="small" iconOnly aria-label="Search" class="text-surface-0! hover:bg-surface-700!"><svg data-p-icon="search" /></button>
                    <button pButton severity="contrast" size="small">Get Started</button>
                    <p-avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
                </div>
            </ng-template>
        </p-toolbar>
    `,
    standalone: true,
    imports: [AvatarModule, ToolbarModule, ButtonModule, Search]
})
export class ToolbarCustomDemo {}
```
