# Angular TreeTable Component — Sortremovable

## Sortremovable

The third consecutive click on a sorted column removes the sorting and restores the original order.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-treetable
            #tt
            [value]="files"
            (onSort)="onSort($event)"
            [columns]="cols"
            selectionMode="single"
            [metaKeySelection]="metaKeySelection"
            [(selection)]="selectedNode"
            dataKey="name"
            [scrollable]="true"
            [tableStyle]="{ 'min-width': '50rem' }"
        >
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col.field) {
                        <th [ttSortableColumn]="col.field">
                            {{ col.header }}
                            <p-treetable-sort-icon [field]="col.field" />
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode" [ttSelectableRow]="rowNode">
                    @for (col of columns; track col.field; let i = $index) {
                        <td>
                            @if (i === 0) {
                                <div class="inline-flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode" />
                                    <span>{{ rowData[col.field] }}</span>
                                </div>
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
    imports: [TreeTableModule],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableSortRemovableDemo implements OnInit {
    private nodeService = inject(NodeService);

    metaKeySelection: boolean = true;

    files!: TreeNode[];

    initialValue: TreeNode[];

    selectedNode!: TreeNode;

    cols!: Column[];

    lastSort: SortMeta | null = null;

    ngOnInit() {
        this.nodeService.getFilesystem().then((files) => {
            this.files = files;
            this.initialValue = structuredClone(files);
        });
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
    }

    onSort(event: SortMeta) {
        if (this.lastSort && this.lastSort.field === event.field && this.lastSort.order === -1 && event.order === 1) {
            this.tt._sortField = null;
            this.tt._sortOrder = this.tt.defaultSortOrder();
            this.tt.tableService.onSort(null);

            this.files = structuredClone(this.initialValue);
            this.lastSort = null;
        } else {
            this.lastSort = { field: event.field, order: event.order };
        }
    }
}
```
