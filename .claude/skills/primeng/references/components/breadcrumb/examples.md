# Angular Breadcrumb Component — Beispiele

## Basic

Shows the current location within a navigational hierarchy.

```typescript
import { Component } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-breadcrumb [model]="items" [home]="home" />
        </div>
    `,
    standalone: true,
    imports: [BreadcrumbModule]
})
export class BreadcrumbBasicDemo {
    items: MenuItem[] = [{ label: 'Products' }, { icon: 'pi pi-bolt', label: 'Electronics' }, { label: 'Laptops' }, { label: 'Dell' }];

    home: MenuItem = { icon: 'pi pi-home' };
}
```

## Custom Separator

A breadcrumb allows customization of the separator between items using the separator template.

```typescript
import { Component } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-breadcrumb [model]="items" [home]="home">
                <ng-template #separator> / </ng-template>
            </p-breadcrumb>
        </div>
    `,
    standalone: true,
    imports: [BreadcrumbModule]
})
export class BreadcrumbCustomSeparatorDemo {
    items: MenuItem[] = [{ label: 'Products' }, { icon: 'pi pi-bolt', label: 'Electronics' }, { label: 'Laptops' }, { label: 'Dell' }];

    home: MenuItem = { icon: 'pi pi-home' };
}
```

## Ellipsis

An ellipsis can be used to indicate hidden breadcrumb items.

```typescript
import { Component } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <div class="flex justify-center">
            <p-breadcrumb [model]="items" [home]="home">
                <ng-template #item let-item>
                    @if (item.current) {
                        <span class="p-breadcrumb-item-link font-semibold">{{ item.label }}</span>
                    } @else if (item.icon && !item.label) {
                        <a class="p-breadcrumb-item-link cursor-pointer"><svg [pIcon]="item.icon"></svg></a>
                    } @else {
                        <a class="p-breadcrumb-item-link cursor-pointer flex items-center gap-1">
                            @if (item.icon) {
                                <svg [pIcon]="item.icon"></svg>
                            }
                            @if (item.label) {
                                <span>{{ item.label }}</span>
                            }
                        </a>
                    }
                </ng-template>
            </p-breadcrumb>
        </div>
    `,
    standalone: true,
    imports: [BreadcrumbModule, PIcon]
})
export class BreadcrumbEllipsisDemo {
    items: MenuItem[] = [{ icon: 'ellipsis-h' }, { icon: 'bolt', label: 'Electronics' }, { label: 'Laptops' }, { label: 'Dell', current: true }];

    home: MenuItem = { icon: 'home' };
}
```

## Route

A breadcrumb can be used with routing libraries to navigate between pages.

```typescript
import { Component, OnInit } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <div class="flex justify-center">
            <p-breadcrumb [home]="home" [model]="items">
                <ng-template #item let-item>
                    @if (item.current) {
                        <span class="p-breadcrumb-item-link font-semibold">{{ item.label }}</span>
                    } @else if (item.icon && !item.label) {
                        <a class="p-breadcrumb-item-link cursor-pointer" (click)="navigate(item)"><svg [pIcon]="item.icon"></svg></a>
                    } @else {
                        <a class="p-breadcrumb-item-link cursor-pointer" (click)="navigate(item)">{{ item.label }}</a>
                    }
                </ng-template>
            </p-breadcrumb>
        </div>
    `,
    standalone: true,
    imports: [BreadcrumbModule, PIcon]
})
export class BreadcrumbRouterDemo implements OnInit {
    allPages: any[] = [{ label: 'Home', icon: 'home' }, { label: 'Components' }, { label: 'Form' }, { label: 'Input' }, { label: 'InputText' }, { label: 'Variants' }, { label: 'Filled' }, { label: 'Outlined' }];

    home!: MenuItem;

    items!: MenuItem[];

    ngOnInit() {
        this.updateBreadcrumb(this.allPages);
    }

    navigate(item: any) {
        const index = item.icon && !item.label ? 0 : this.allPages.findIndex((p) => p.label === item.label);

        if (index !== -1) {
            this.updateBreadcrumb(this.allPages.slice(0, index + 1));
        }
    }

    updateBreadcrumb(pages: any[]) {
        if (pages.length === 1) {
            this.home = null as any;
            this.items = [{ label: pages[0].label, current: true }] as any[];
        } else {
            this.home = { icon: pages[0].icon } as any;
            this.items = pages.slice(1).map((page, index, arr) => ({
                ...page,
                current: index === arr.length - 1
            })) as any[];
        }
    }
}
```

## Custom Item

Custom content can be placed inside the items using the item template.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <div class="flex justify-center">
            <p-breadcrumb [model]="items" [home]="home">
                <ng-template #item let-item>
                    <a class="p-breadcrumb-item-link flex items-center gap-1 cursor-pointer">
                        @if (item.icon) {
                            <svg [pIcon]="item.icon"></svg>
                        }
                        @if (item.label) {
                            <span>{{ item.label }}</span>
                        }
                        @if (item.badge) {
                            <p-badge [value]="item.badge" shape="circle" />
                        }
                    </a>
                </ng-template>
            </p-breadcrumb>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, BreadcrumbModule, PIcon]
})
export class BreadcrumbTemplateDemo {
    items: MenuItem[] = [{ label: 'Products' }, { icon: 'bolt', label: 'Electronics' }, { icon: 'desktop', label: 'Computers' }, { label: 'Laptops', badge: '5' }, { label: 'Dell' }];

    home: MenuItem = { icon: 'home', label: 'Home' };
}
```
