# Angular Tree Component — Node

## Node

Tree nodes can be customized with the #node template.

```typescript
import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="nodes()" class="w-full md:w-120">
            <ng-template #node let-node>
                @if (node.type === 'url') {
                    <a [href]="node.data" target="_blank" rel="noopener noreferrer" class="text-surface-700 dark:text-surface-100 hover:text-primary">{{ node.label }}</a>
                } @else {
                    <b>{{ node.label }}</b>
                }
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [TreeModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeDemo implements OnInit {
    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodes.set([
            {
                key: '0',
                label: 'Introduction',
                children: [
                    { key: '0-0', label: 'What is Angular', data: 'https://angular.io', type: 'url' },
                    { key: '0-1', label: 'Getting Started', data: 'https://angular.io/guide/setup-local', type: 'url' },
                    { key: '0-2', label: 'Learn and Explore', data: 'https://angular.io/guide/architecture', type: 'url' },
                    { key: '0-3', label: 'Take a Look', data: 'https://angular.io/start', type: 'url' }
                ]
            },
            {
                key: '1',
                label: 'Components In-Depth',
                children: [
                    { key: '1-0', label: 'Component Registration', data: 'https://angular.io/guide/component-interaction', type: 'url' },
                    { key: '1-1', label: 'User Input', data: 'https://angular.io/guide/user-input', type: 'url' },
                    { key: '1-2', label: 'Hooks', data: 'https://angular.io/guide/lifecycle-hooks', type: 'url' },
                    { key: '1-3', label: 'Attribute Directives', data: 'https://angular.io/guide/attribute-directives', type: 'url' }
                ]
            }
        ]);
    }
}
```
