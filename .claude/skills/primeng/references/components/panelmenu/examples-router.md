# Angular PanelMenu Component — Router

## Router

Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { PanelMenu, PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-panelmenu [model]="items" class="w-full md:w-80" />
        </div>
    `,
    standalone: true,
    imports: [PanelMenuModule],
    providers: [MessageService]
})
export class PanelMenuRouterDemo implements OnInit {
    private messageService = inject(MessageService);
    private router = inject(Router);

    items: MenuItem[];

    ngOnInit() {
        this.items = [
            {
                label: 'Router',
                icon: 'pi pi-palette',
                items: [
                    {
                        label: 'Installation',
                        icon: 'pi pi-eraser',
                        routerLink: '/installation'
                    },
                    {
                        label: 'Configuration',
                        icon: 'pi pi-heart',
                        routerLink: '/configuration'
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
                        icon: 'pi pi-star',
                        url: 'https://angular.io/'
                    },
                    {
                        label: 'Vite.js',
                        icon: 'pi pi-bookmark',
                        url: 'https://vitejs.dev/'
                    }
                ]
            }
        ];
    }
}
```
