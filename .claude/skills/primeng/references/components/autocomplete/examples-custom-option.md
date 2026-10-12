# Angular AutoComplete Component — Custom-option

## Custom-option

Customize option content with the item template.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { Product } from '@/domain/product';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'away' | 'offline';
    statusClass: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete [(ngModel)]="selectedMember" [suggestions]="filtered …(lange Zeile gekürzt)
                <ng-template let-member #item>
                    <div class="flex items-center gap-3 py-1">
                        <div class="relative">
                            <p-avatar [label]="member.avatar" shape="circle" class="w-8 h-8" />
                            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-0 dark:border-surface-900 {{ member.statusClass }}"></span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-medium">{{ member.name }}</span>
                            <span class="text-xs text-surface-500 dark:text-surface-400">{{ member.role }}</span>
                        </div>
                    </div>
                </ng-template>
            </p-autocomplete>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, AvatarModule, FormsModule]
})
export class AutoCompleteCustomOptionDemo {
    selectedMember: TeamMember | undefined;

    filteredMembers: TeamMember[] = [];

    teamMembers: TeamMember[] = [
        { id: 1, name: 'Sarah Chen', role: 'Engineering Lead', avatar: 'SC', status: 'online', statusClass: 'bg-green-400' },
        { id: 2, name: 'Alex Rivera', role: 'Senior Developer', avatar: 'AR', status: 'online', statusClass: 'bg-green-400' },
        { id: 3, name: 'Jordan Kim', role: 'UX Designer', avatar: 'JK', status: 'away', statusClass: 'bg-amber-400' },
        { id: 4, name: 'Taylor Morgan', role: 'Product Manager', avatar: 'TM', status: 'offline', statusClass: 'bg-zinc-400' },
        { id: 5, name: 'Morgan Lee', role: 'DevOps Engineer', avatar: 'ML', status: 'online', statusClass: 'bg-green-400' },
        { id: 6, name: 'Casey Jones', role: 'QA Engineer', avatar: 'CJ', status: 'away', statusClass: 'bg-amber-400' }
    ];

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();

        this.filteredMembers = query ? this.teamMembers.filter((m) => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query)) : [...this.teamMembers];
    }
}
```
