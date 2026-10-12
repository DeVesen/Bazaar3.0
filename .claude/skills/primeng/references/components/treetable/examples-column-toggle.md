# Angular TreeTable Component — Column Toggle

## Column Toggle

Show/hide columns dynamically.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Cog } from '@primeicons/angular/cog';
import { Refresh } from '@primeicons/angular/refresh';
import { Bars } from '@primeicons/angular/bars';
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
        <div class="mb-3 flex items-center justify-end">
            <button type="button" pButton variant="outlined" severity="secondary" size="small" (click)="op.toggle($event)">
                <svg data-p-icon="cog" />
                Columns
            </button>
            <p-popover #op styleClass="w-72 p-0!">
                <ng-template #content>
                    <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                        <span class="text-sm font-semibold">Columns</span>
                        <button type="button" pButton variant="text" size="small" severity="secondary" (click)="reset()">
                            <svg data-p-icon="refresh" />
                            Reset
                        </button>
                    </div>
                    <div class="py-2 max-h-80 overflow-auto" cdkDropList (cdkDropListDropped)="drop($event)">
                        @for (col of cols; track col.field) {
                            <div class="flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md cursor-move select-none hover:bg-surface-100 dark:hover:bg-surface-800" cdkDrag>
                                <svg data-p-icon="bars" [size]="14" class="text-surface-400 dark:text-surface-500" />
                                <p-checkbox [(ngModel)]="visibleFields" [value]="col.field" [inputId]="col.field" />
                                <label [for]="col.field" class="text-sm cursor-pointer">{{ col.header }}</label>
                            </div>
                        }
                    </div>
                </ng-template>
            </p-popover>
        </div>
        <p-treetable [value]="files" [columns]="visibleColumns" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col.field) {
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
                            } @else if (col.field === 'key') {
                                <code class="text-xs text-surface-500 dark:text-surface-400">{{ rowData[col.field] }}</code>
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
    imports: [CheckboxModule, PopoverModule, TagModule, TreeTableModule, ButtonModule, FormsModule, Cog, Refresh, Bars, Folder, Image, Video, File],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableColumnToggleDemo implements OnInit {
    files!: TreeNode[];

    cols = [...initialColumns];

    visibleFields = [...defaultVisibleFields];

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getTreeTableNodes().then((files) => {
            this.files = this.enrichNodes(files.slice(0, 5));
            this.files[0].expanded = true;
        });
    }

    get visibleColumns(): Column[] {
        return this.cols.filter((col) => this.visibleFields.includes(col.field));
    }

    enrichNodes(nodes: TreeNode[], level = 0): TreeNode[] {
        return nodes.map((node) => ({
            ...node,
            data: { ...node.data, key: node.key, level, hasChildren: node.children?.length ? 'Yes' : 'No' },
            children: node.children ? this.enrichNodes(node.children, level + 1) : undefined
        }));
    }

    drop(event: CdkDragDrop<Column[]>) {
        moveItemInArray(this.cols, event.previousIndex, event.currentIndex);
    }

    reset() {
        this.cols = [...initialColumns];
        this.visibleFields = [...defaultVisibleFields];
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
