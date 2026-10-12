# Angular TreeTable Component — Edit

## Edit

Incell editing is enabled by defining input elements with treeTableCellEditor .

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <p-treetable [value]="files" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td ttEditableColumn>
                        <div class="flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            @switch (rowData.type) {
                                @case ('Folder') {
                                    <svg data-p-icon="folder" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @case ('Picture') {
                                    <svg data-p-icon="image" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @default {
                                    <svg data-p-icon="file" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                            }
                            <p-treetable-cell-editor class="flex-1">
                                <ng-template #input>
                                    <input pInputText type="text" [(ngModel)]="rowData.name" pSize="small" class="w-full" />
                                </ng-template>
                                <ng-template #output>
                                    <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData.name }}</span>
                                </ng-template>
                            </p-treetable-cell-editor>
                        </div>
                    </td>
                    <td ttEditableColumn>
                        <p-treetable-cell-editor>
                            <ng-template #input>
                                <input pInputText type="text" [(ngModel)]="rowData.size" pSize="small" class="w-full" />
                            </ng-template>
                            <ng-template #output>
                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData.size }}</span>
                            </ng-template>
                        </p-treetable-cell-editor>
                    </td>
                    <td ttEditableColumn>
                        <p-treetable-cell-editor>
                            <ng-template #input>
                                <input pInputText type="text" [(ngModel)]="rowData.type" pSize="small" class="w-full" />
                            </ng-template>
                            <ng-template #output>
                                <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                            </ng-template>
                        </p-treetable-cell-editor>
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, InputTextModule, FormsModule, Folder, Image, File],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableEditDemo implements OnInit {
    files!: TreeNode[];

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
            }
        ];
    }

    getSeverity(type: string): 'info' | 'warn' | 'success' | 'secondary' {
        switch (type) {
            case 'Folder':
                return 'warn';
            case 'Document':
                return 'info';
            case 'Picture':
                return 'success';
            default:
                return 'secondary';
        }
    }
}
```
