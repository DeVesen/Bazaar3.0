# Angular TreeTable Component — Row Edit

## Row Edit

Row editing toggles the visibility of all editors in the row at once, providing save and cancel actions.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { File } from '@primeicons/angular/file';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';
import { Pencil } from '@primeicons/angular/pencil';

@Component({
    template: `
        <p-treetable [value]="files" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th style="width: 8rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td>
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
                            @if (editingKeys[rowData.key]) {
                                <input pInputText type="text" [(ngModel)]="rowData.name" pSize="small" class="flex-1" />
                            } @else {
                                <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData.name }}</span>
                            }
                        </div>
                    </td>
                    <td>
                        @if (editingKeys[rowData.key]) {
                            <input pInputText type="text" [(ngModel)]="rowData.size" pSize="small" class="w-full" />
                        } @else {
                            {{ rowData.size }}
                        }
                    </td>
                    <td>
                        @if (editingKeys[rowData.key]) {
                            <input pInputText type="text" [(ngModel)]="rowData.type" pSize="small" class="w-full" />
                        } @else {
                            <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                        }
                    </td>
                    <td>
                        <div class="flex gap-1">
                            @if (editingKeys[rowData.key]) {
                                <button pButton text severity="success" size="small" (click)="onSave(rowData)">
                                    <svg data-p-icon="check" />
                                </button>
                                <button pButton text severity="danger" size="small" (click)="onCancel(rowData)">
                                    <svg data-p-icon="times" />
                                </button>
                            } @else {
                                <button pButton text severity="secondary" size="small" (click)="onInit(rowData)">
                                    <svg data-p-icon="pencil" />
                                </button>
                            }
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, ButtonModule, InputTextModule, FormsModule, Folder, Image, File, Check, Times, Pencil],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableRowEditDemo implements OnInit {
    files!: TreeNode[];

    editingKeys: { [key: string]: boolean } = {};

    private drafts: { [key: string]: any } = {};

    ngOnInit() {
        this.files = [
            {
                key: '0',
                expanded: true,
                data: { key: '0', name: 'Documents', size: '75kb', type: 'Folder' },
                children: [
                    {
                        key: '0-0',
                        data: { key: '0-0', name: 'Work', size: '55kb', type: 'Folder' },
                        children: [
                            { key: '0-0-0', data: { key: '0-0-0', name: 'Expenses.doc', size: '30kb', type: 'Document' } },
                            { key: '0-0-1', data: { key: '0-0-1', name: 'Resume.doc', size: '25kb', type: 'Document' } }
                        ]
                    },
                    {
                        key: '0-1',
                        data: { key: '0-1', name: 'Home', size: '20kb', type: 'Folder' },
                        children: [{ key: '0-1-0', data: { key: '0-1-0', name: 'Invoices.txt', size: '20kb', type: 'Text' } }]
                    }
                ]
            },
            {
                key: '1',
                data: { key: '1', name: 'Pictures', size: '150kb', type: 'Folder' },
                children: [
                    { key: '1-0', data: { key: '1-0', name: 'barcelona.jpg', size: '90kb', type: 'Picture' } },
                    { key: '1-1', data: { key: '1-1', name: 'primeui.png', size: '30kb', type: 'Picture' } }
                ]
            }
        ];
    }

    onInit(rowData: any) {
        this.drafts[rowData.key] = { ...rowData };
        this.editingKeys[rowData.key] = true;
    }

    onSave(rowData: any) {
        delete this.drafts[rowData.key];
        delete this.editingKeys[rowData.key];
    }

    onCancel(rowData: any) {
        const draft = this.drafts[rowData.key];

        if (draft) {
            rowData.name = draft.name;
            rowData.size = draft.size;
            rowData.type = draft.type;
        }

        delete this.drafts[rowData.key];
        delete this.editingKeys[rowData.key];
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
