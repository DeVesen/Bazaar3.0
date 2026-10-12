# Angular TreeTable Component — Scrollfrozencolumns

## Scrollfrozencolumns

A column can be fixed during horizontal scrolling by enabling the frozenColumns property.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-treetable [value]="files" [columns]="scrollableCols" [frozenColumns]="frozenLeftCols" [scrollable]="true" scrollHeight="400px" frozenWidth="300px">
            <ng-template #frozencolgroup>
                <colgroup>
                    <col style="width: 300px" />
                </colgroup>
            </ng-template>
            <ng-template #colgroup let-columns>
                <colgroup>
                    @for (col of columns; track col) {
                        <col style="width: 200px" />
                    }
                </colgroup>
            </ng-template>
            <ng-template #frozenheader>
                <tr>
                    <th>Name</th>
                </tr>
            </ng-template>
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th>{{ col.header }}</th>
                    }
                </tr>
            </ng-template>
            <ng-template #frozenbody let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode" style="height: 44px">
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
                                @case ('Video') {
                                    <svg data-p-icon="video" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                                @default {
                                    <svg data-p-icon="file" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                }
                            }
                            <span [class]="rowData.type === 'Folder' ? 'font-semibold' : ''">{{ rowData.name }}</span>
                        </div>
                    </td>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode" style="height: 44px">
                    @for (col of columns; let last = $last; track col) {
                        <td>
                            @if (col.field === 'size') {
                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData[col.field] }}</span>
                            } @else if (col.field === 'type') {
                                <p-tag [value]="rowData[col.field]" [severity]="getSeverity(rowData[col.field])" />
                            } @else if (col.field === 'actions') {
                                <span class="text-xs text-surface-500 dark:text-surface-400">Open · Share</span>
                            } @else {
                                {{ rowData[col.field] }}
                            }
                        </td>
                    }
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, Folder, Image, Video, File],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableScrollFrozenColumnsDemo implements OnInit {
    files!: TreeNode[];

    frozenLeftCols!: Column[];

    scrollableCols!: Column[];

    ngOnInit() {
        const owners = ['Amy Elsner', 'Anna Fali', 'Bernardo Dominic', 'Ioni Bowcher', 'Stephen Shaw'];
        const types = ['Document', 'Text', 'Picture', 'Video'];
        this.files = Array.from({ length: 10 }, (_, i) => ({
            key: String(i),
            expanded: i < 2,
            data: {
                name: `Folder ${i + 1}`,
                size: '—',
                type: 'Folder',
                owner: owners[i % owners.length],
                modified: `2026-0${(i % 9) + 1}-15`
            },
            children: Array.from({ length: 5 }, (_, j) => {
                const type = types[j % types.length];
                const size = ((i * 37 + j * 113) % 1950) + 50;
                return {
                    key: `${i}-${j}`,
                    data: {
                        name: `${type} ${i + 1}.${j + 1}`,
                        size: `${size}kb`,
                        type,
                        owner: owners[(i + j) % owners.length],
                        modified: `2026-0${((i + j) % 9) + 1}-20`
                    }
                };
            })
        }));
        this.frozenLeftCols = [{ field: 'name', header: 'Name' }];
        this.scrollableCols = [
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: 'owner', header: 'Owner' },
            { field: 'modified', header: 'Modified' },
            { field: 'actions', header: 'Actions' }
        ];
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
