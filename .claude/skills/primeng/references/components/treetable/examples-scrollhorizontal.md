# Angular TreeTable Component — Scrollhorizontal

## Scrollhorizontal

Horizontal scrolling is enabled when the total width of columns exceeds table width.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { NodeService } from '@/service/nodeservice';
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
        <p-treetable [value]="files" [columns]="cols" [scrollable]="true" scrollHeight="250px" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #colgroup let-columns>
                <colgroup>
                    @for (col of columns; let first = $first; track col) {
                        <col [style.width]="first ? '350px' : '250px'" />
                    }
                </colgroup>
            </ng-template>
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th>{{ col.header }}</th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode">
                    @for (col of columns; let first = $first; track col) {
                        <td>
                            @if (first) {
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
                                    <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData[col.field] }}</span>
                                </div>
                            } @else if (col.field === 'size') {
                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData[col.field] }}</span>
                            } @else if (col.field === 'type') {
                                <p-tag [value]="rowData[col.field]" [severity]="getSeverity(rowData[col.field])" />
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
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableScrollHorizontalDemo implements OnInit {
    files!: TreeNode[];

    cols!: Column[];

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getTreeTableNodes().then((files) => {
            this.files = this.enrichNodes(files);
            this.files[0].expanded = true;
        });
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: 'key', header: 'Key' },
            { field: 'level', header: 'Level' },
            { field: 'hasChildren', header: 'Has Children' }
        ];
    }

    enrichNodes(nodes: TreeNode[], level = 0): TreeNode[] {
        return nodes.map((node) => ({
            ...node,
            data: { ...node.data, key: node.key, level, hasChildren: node.children?.length ? 'Yes' : 'No' },
            children: node.children ? this.enrichNodes(node.children, level + 1) : undefined
        }));
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
