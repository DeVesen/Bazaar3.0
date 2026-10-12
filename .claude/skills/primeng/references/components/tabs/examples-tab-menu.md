# Angular Tabs Component — Tab Menu

## Tab Menu

A navigation menu is implemented using tabs without the panels where the content of a tab is provided by a route component like router-outlet . For the purpose of this demo, router-outlet is not included.

```typescript
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
    template: `
        <p-tabs value="dashboard">
            <p-tablist>
                @for (tab of tabs; track tab.route) {
                    <p-tab [value]="tab.route" class="flex items-center gap-2! text-inherit">
                        <i [class]="tab.icon"></i>
                        <span>{{ tab.label }}</span>
                    </p-tab>
                }
            </p-tablist>
        </p-tabs>
        <!--<router-outlet></router-outlet>-->
    `,
    standalone: true,
    imports: [TabsModule]
})
export class TabsTabMenuDemo {
    tabs = [
        { route: 'dashboard', label: 'Dashboard', icon: 'pi pi-home' },
        { route: 'transactions', label: 'Transactions', icon: 'pi pi-chart-line' },
        { route: 'products', label: 'Products', icon: 'pi pi-list' },
        { route: 'messages', label: 'Messages', icon: 'pi pi-inbox' }
    ];
}
```
