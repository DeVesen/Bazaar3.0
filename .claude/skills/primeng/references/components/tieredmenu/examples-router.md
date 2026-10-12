# Angular TieredMenu Component — Router

## Router

Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-tieredmenu [model]="items" />
        </div>
    `,
    standalone: true,
    imports: [TieredMenuModule]
})
export class TieredMenuRouterDemo implements OnInit {
    private router = inject(Router);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Router',
                icon: 'pi pi-palette',
                items: [
                    {
                        label: 'Theming',
                        routerLink: '/theming'
                    },
                    {
                        label: 'UI Kit',
                        routerLink: '/uikit'
                    }
                ]
            },
            {
                label: 'Programmatic',
                icon: 'pi pi-link',
                command: () => {
                    this.router.navigate(['/installation']);
                }
            },
            {
                label: 'External',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'Angular',
                        url: 'https://angular.dev/'
                    },
                    {
                        label: 'Vite.js',
                        url: 'https://vitejs.dev/'
                    }
                ]
            }
        ];
    }
}
```
