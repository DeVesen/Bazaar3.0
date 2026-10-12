# Angular TreeTable Component — Basic

## Basic

TreeTable requires a collection of TreeNode instances as a value with ttRow rows and the toggler placed on the column that should expand or collapse a node.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-treetable [value]="nodes" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 34%">Name</th>
                    <th style="width: 33%">Size</th>
                    <th style="width: 33%">Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td>
                        <div class="inline-flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            <span>{{ rowData.name }}</span>
                        </div>
                    </td>
                    <td>{{ rowData.size }}</td>
                    <td>{{ rowData.type }}</td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TreeTableModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableBasicDemo implements OnInit {
    nodes!: TreeNode[];

    ngOnInit() {
        this.nodes = [
            {
                key: '0',
                data: { name: 'Documents', size: '75kb', type: 'Folder' },
                children: [
                    {
                        key: '0-0',
                        data: { name: 'Work', size: '55kb', type: 'Folder' },
                        children: [
                            { key: '0-0-0', data: { name: 'Expenses.doc', size: '30kb', type: 'Document' } },
                            { key: '0-0-1', data: { name: 'Resume.doc', size: '25kb', type: 'Document' } }
                        ]
                    },
                    {
                        key: '0-1',
                        data: { name: 'Home', size: '20kb', type: 'Folder' },
                        children: [{ key: '0-1-0', data: { name: 'Invoices.txt', size: '20kb', type: 'Text' } }]
                    }
                ]
            },
            {
                key: '1',
                data: { name: 'Pictures', size: '150kb', type: 'Folder' },
                children: [
                    { key: '1-0', data: { name: 'barcelona.jpg', size: '90kb', type: 'Picture' } },
                    { key: '1-1', data: { name: 'primeui.png', size: '30kb', type: 'Picture' } },
                    { key: '1-2', data: { name: 'optimus.jpg', size: '30kb', type: 'Picture' } }
                ]
            },
            {
                key: '2',
                data: { name: 'Movies', size: '1500kb', type: 'Folder' },
                children: [
                    {
                        key: '2-0',
                        data: { name: 'Al Pacino', size: '1000kb', type: 'Folder' },
                        children: [
                            { key: '2-0-0', data: { name: 'Scarface', size: '500kb', type: 'Video' } },
                            { key: '2-0-1', data: { name: 'Serpico', size: '500kb', type: 'Video' } }
                        ]
                    },
                    {
                        key: '2-1',
                        data: { name: 'Robert De Niro', size: '500kb', type: 'Folder' },
                        children: [
                            { key: '2-1-0', data: { name: 'Goodfellas', size: '250kb', type: 'Video' } },
                            { key: '2-1-1', data: { name: 'Untouchables', size: '250kb', type: 'Video' } }
                        ]
                    }
                ]
            }
        ];
    }
}
```
