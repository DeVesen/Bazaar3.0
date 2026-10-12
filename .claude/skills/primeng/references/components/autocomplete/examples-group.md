# Angular AutoComplete Component — Group

## Group

Options can be grouped by category using the group property with optionGroupLabel and optionGroupChildren .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LabelModule } from 'primeng/label';

interface Technology {
    label: string;
    value: string;
}

interface TechCategory {
    label: string;
    code: string;
    items: Technology[];
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete
                [(ngModel)]="selectedTech"
                [group]="true"
                [suggestions]="filteredGroups"
                (completeMethod)="search($event)"
                optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                placeholder="Search technologies..."
                inputStyleClass="w-full md:w-56"
                scrollHeight="14rem"
            />
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, LabelModule, FormsModule]
})
export class AutoCompleteGroupDemo {
    selectedTech: any;

    filteredGroups: TechCategory[] = [];

    techStack: TechCategory[] = [
        {
            label: 'Frontend',
            code: 'FE',
            items: [
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' }
            ]
        },
        {
            label: 'Backend',
            code: 'BE',
            items: [
                { label: 'Node.js', value: 'nodejs' },
                { label: 'Python', value: 'python' },
                { label: 'Java', value: 'java' },
                { label: 'Go', value: 'go' }
            ]
        },
        {
            label: 'Database',
            code: 'DB',
            items: [
                { label: 'PostgreSQL', value: 'postgresql' },
                { label: 'MongoDB', value: 'mongodb' },
                { label: 'Redis', value: 'redis' },
                { label: 'MySQL', value: 'mysql' }
            ]
        }
    ];

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        const filtered: TechCategory[] = [];

        for (const category of this.techStack) {
            const filteredItems = query ? category.items.filter((item) => item.label.toLowerCase().includes(query)) : category.items;

            if (filteredItems.length) {
                filtered.push({ ...category, items: filteredItems });
            }
        }

        this.filteredGroups = filtered;
    }
}
```
