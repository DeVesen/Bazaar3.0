# Angular ContextMenu Component — Command

## Command

The function to invoke when an item is clicked is defined using the command property.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { TagModule } from 'primeng/tag';
import { MenuItem, MessageService } from 'primeng/api';

interface Users {
    id: number;
    name: string;
    image: string;
    role: string;
}

@Component({
    template: `
        <div class="flex sm:justify-center">
            <ul class="m-0 list-none border border-surface rounded-sm p-4 flex flex-col gap-2 w-full sm:w-96">
                @for (user of users; track user.id) {
                    <li
                        class="p-2 hover:bg-emphasis rounded-sm border border-transparent transition-all duration-200 flex items-center justify-content-between"
                        [class.border-primary!]="selectedUser?.id === user.id"
                        (contextmenu)="onContextMenu($event, user)"
                    >
                        <div class="flex flex-1 items-center gap-2">
                            <img class="w-8 h-8" [alt]="user.name" [src]="'https://primefaces.org/cdn/primeng/images/demo/avatar/' + user.image" />
                            <span class="font-bold text-sm">{{ user.name }}</span>
                        </div>
                        <p-tag [value]="user.role" [severity]="getBadge(user)" />
                    </li>
                }
            </ul>
            <p-contextmenu #cm [model]="items" (onHide)="onHide()" />
        </div>
    `,
    standalone: true,
    imports: [ContextMenuModule, TagModule],
    providers: [MessageService]
})
export class ContextMenuCommandDemo implements OnInit {
    items: MenuItem[] | undefined;

    selectedUser!: Users | null;

    users!: Users[];

    private messageService = inject(MessageService);

    ngOnInit() {
        this.users = [
            { id: 0, name: 'Amy Elsner', image: 'amyelsner.png', role: 'Admin' },
            { id: 1, name: 'Anna Fali', image: 'annafali.png', role: 'Member' },
            { id: 2, name: 'Asiya Javayant', image: 'asiyajavayant.png', role: 'Member' },
            { id: 3, name: 'Bernardo Dominic', image: 'bernardodominic.png', role: 'Guest' },
            { id: 4, name: 'Elwin Sharvill', image: 'elwinsharvill.png', role: 'Member' }
        ];
        this.items = [
            {
                label: 'Roles',
                icon: 'pi pi-users',
                items: [
                    {
                        label: 'Admin',
                        command: () => {
                            if (this.selectedUser) this.selectedUser.role = 'Admin';
                        }
                    },
                    {
                        label: 'Member',
                        command: () => {
                            if (this.selectedUser) this.selectedUser.role = 'Member';
                        }
                    },
                    {
                        label: 'Guest',
                        command: () => {
                            if (this.selectedUser) this.selectedUser.role = 'Guest';
                        }
                    }
                ]
            },
            {
                label: 'Invite',
                icon: 'pi pi-user-plus',
                command: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Invitation sent!',
                        life: 3000
                    });
                }
            }
        ];
    }

    getBadge(user: Users) {
        if (user.role === 'Member') return 'info';
        else if (user.role === 'Guest') return 'warn';
        else return null;
    }

    onContextMenu(event: MouseEvent, user: Users) {
        this.selectedUser = user;
        this.cm.show(event);
    }

    onHide() {
        this.selectedUser = null;
    }
}
```
