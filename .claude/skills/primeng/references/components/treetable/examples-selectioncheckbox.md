# Angular TreeTable Component — Selectioncheckbox

## Selectioncheckbox

Checkbox column with propagating selection — toggling a parent selects all descendants, partial state renders as indeterminate.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <p-treetable [value]="files" selectionMode="checkbox" [(selectionKeys)]="selectionKeys" (selectionKeysChange)="onSelectionChange()" dataKey="key" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>
                        <div class="flex items-center gap-2">
                            <p-treetable-header-checkbox class="flex" />
                            <span>Name</span>
                        </div>
                    </th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode" [ttSelectableRow]="rowNode">
                    <td>
                        <div class="flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            <p-treetable-checkbox [value]="rowNode" />
                            @switch (rowData.type) {
                                @case ('Folder') {
                                    <svg data-p-icon="folder" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @case ('Picture') {
                                    <svg data-p-icon="image" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @case ('Video') {
                                    <svg data-p-icon="video" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @default {
                                    <svg data-p-icon="file" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                            }
                            <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData.name }}</span>
                        </div>
                    </td>
                    <td>
                        <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData.size }}</span>
                    </td>
                    <td>
                        <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, Folder, Image, Video, File],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableSelectionCheckboxDemo implements OnInit {
    files!: TreeNode[];

    selectionKeys: { [key: string]: any } = {};

    selectedLabel: string = 'None';

    ngOnInit() {
        this.files = [
            {
                key: '0',
                expanded: true,
                data: { name: 'Documents', size: '75kb', type: 'Folder' },
                children: [
                    {
                        key: '0-0',
                        expanded: true,
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

    onSelectionChange() {
        const keys = Object.keys(this.selectionKeys).filter((k) => this.selectionKeys[k]?.checked);

        this.selectedLabel = keys.length ? keys.join(', ') : 'None';
    }

    getSeverity(type: string): 'info' | 'warn' | 'success' | 'secondary' {
        switch (type) {
            case 'Folder':
                return 'warn';
            case 'Document':
                return 'info';
            case 'Picture':
            case 'Video':
                return 'success';
            default:
                return 'secondary';
        }
    }
}
```
