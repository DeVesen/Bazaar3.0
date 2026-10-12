# Angular Menu Component — Router

## Router

Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menu [model]="items" />
        </div>
    `,
    standalone: true,
    imports: [MenuModule]
})
export class MenuRouterDemo implements OnInit {
    private router = inject(Router);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Navigate',
                items: [
                    {
                        label: 'Router Link',
                        icon: 'pi pi-palette',
                        routerLink: '/theming'
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
                        url: 'https://angular.dev/'
                    }
                ]
            }
        ];
    }
}
```
