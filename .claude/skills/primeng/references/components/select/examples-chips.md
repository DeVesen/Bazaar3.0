# Angular Select Component — Chips

## Chips

Selected items displayed as chips using a custom #selectedItem template in multiple mode.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';

interface Member {
    name: string;
    code: string;
    avatar: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="members" [(ngModel)]="selected" [multiple]="true" optionLabel="name" optionValue="code" [showClear]="true" placeholder="Select Members" class="w-full">
                <ng-template let-member #item>
                    <div class="flex items-center gap-2">
                        <img [src]="member.avatar" [alt]="member.name" class="w-7 h-7 rounded-full" />
                        <span>{{ member.name }}</span>
                    </div>
                </ng-template>
                <ng-template #selectedItem let-selectedOption>
                    <div class="flex flex-wrap gap-1">
                        @for (code of selected; track code) {
                            <p-chip
                                [label]="getFirstName(code)"
                                [image]="getAvatar(code)"
                                [removable]="true"
                                (onRemove)="removeItem($event, code)"
                                [pt]="{ root: { class: 'py-0!' }, label: { class: 'text-xs!' }, image: { class: 'w-5! h-5!' } }"
                            />
                        }
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [ChipModule, SelectModule, FormsModule]
})
export class SelectChipDemo {
    members: Member[] = [
        { name: 'Amy Elsner', code: 'AE', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png' },
        { name: 'Anna Fali', code: 'AF', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png' },
        { name: 'Asiya Javayant', code: 'AJ', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png' },
        { name: 'Bernardo Dominic', code: 'BD', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/bernardodominic.png' },
        { name: 'Elwin Sharvill', code: 'ES', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/elwinsharvill.png' },
        { name: 'Ioni Bowcher', code: 'IB', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png' },
        { name: 'Ivan Magalhaes', code: 'IM', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/ivanmagalhaes.png' },
        { name: 'Stephen Shaw', code: 'SS', avatar: 'https://primefaces.org/cdn/primevue/images/avatar/stephenshaw.png' }
    ];

    selected: string[] = [];

    getFirstName(code: string): string {
        const member = this.members.find((m) => m.code === code);

        return member ? member.name.split(' ')[0] : code;
    }

    getAvatar(code: string): string {
        return this.members.find((m) => m.code === code)?.avatar ?? '';
    }

    removeItem(event: MouseEvent, code: string) {
        event.stopPropagation();
        this.selected = this.selected.filter((c) => c !== code);
    }
}
```
