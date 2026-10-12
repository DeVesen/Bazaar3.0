# Angular Select Component — Group

## Group

Options can be grouped when a nested data structures is provided.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SelectItemGroup } from 'primeng/api';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="jobCategories" [(ngModel)]="selectedPosition" placeholder="Select a position..." [group]="true" optionLabel="label" optionValue="value" class="w-full md:w-56" />
        </div>
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectGroupDemo {
    jobCategories: SelectItemGroup[] = [
        {
            label: 'Engineering',
            value: 'eng',
            items: [
                { label: 'Frontend Developer', value: 'frontend' },
                { label: 'Backend Developer', value: 'backend' },
                { label: 'Full Stack Developer', value: 'fullstack' },
                { label: 'DevOps Engineer', value: 'devops' },
                { label: 'QA Engineer', value: 'qa' }
            ]
        },
        {
            label: 'Design',
            value: 'design',
            items: [
                { label: 'UI Designer', value: 'ui' },
                { label: 'UX Designer', value: 'ux' },
                { label: 'Product Designer', value: 'product-design' },
                { label: 'Brand Designer', value: 'brand' }
            ]
        },
        {
            label: 'Product',
            value: 'product',
            items: [
                { label: 'Product Manager', value: 'pm' },
                { label: 'Product Owner', value: 'po' },
                { label: 'Business Analyst', value: 'ba' }
            ]
        },
        {
            label: 'Marketing',
            value: 'marketing',
            items: [
                { label: 'Growth Manager', value: 'growth' },
                { label: 'Content Strategist', value: 'content' },
                { label: 'SEO Specialist', value: 'seo' }
            ]
        }
    ];

    selectedPosition: string | undefined;
}
```
