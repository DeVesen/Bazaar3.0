# Angular Select Component — Custom Option

## Custom Option

Custom content can be placed inside options using the item template.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { SelectModule } from 'primeng/select';
import { Product } from '@/domain/product';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    statusClass: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="teamMembers" [(ngModel)]="assignee" optionLabel="name" placeholder="Select team member..." class="w-full md:w-56">
                <ng-template #selectedItem let-selectedOption>
                    <div class="flex items-center gap-2">
                        <span [class]="'inline-block w-2 h-2 rounded-full ' + selectedOption.statusClass"></span>
                        <span>{{ selectedOption.name }}</span>
                    </div>
                </ng-template>
                <ng-template let-member #item>
                    <div class="flex items-center gap-3 py-1">
                        <div class="relative">
                            <p-avatar [label]="member.avatar" shape="circle" class="w-8 h-8" />
                            <span [class]="'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-0 dark:border-surface-900 ' + member.statusClass"></span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-medium">{{ member.name }}</span>
                            <span class="text-xs text-surface-500">{{ member.role }}</span>
                        </div>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, SelectModule, FormsModule]
})
export class SelectOptionDemo {
    teamMembers: TeamMember[] = [
        { id: 1, name: 'Sarah Chen', role: 'Engineering Lead', avatar: 'SC', statusClass: 'bg-amber-400' },
        { id: 2, name: 'Alex Rivera', role: 'Senior Developer', avatar: 'AR', statusClass: 'bg-green-400' },
        { id: 3, name: 'Jordan Kim', role: 'UX Designer', avatar: 'JK', statusClass: 'bg-amber-400' },
        { id: 4, name: 'Taylor Morgan', role: 'Product Manager', avatar: 'TM', statusClass: 'bg-zinc-400' },
        { id: 5, name: 'Morgan Lee', role: 'DevOps Engineer', avatar: 'ML', statusClass: 'bg-green-400' },
        { id: 6, name: 'Casey Jones', role: 'QA Engineer', avatar: 'CJ', statusClass: 'bg-red-400' }
    ];

    assignee: TeamMember | undefined;
}
```
