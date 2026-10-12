# Angular TreeTable Component — Conditional Style

## Conditional Style

Particular rows and cells can be styled based on conditions. The ngClass receives a row data as a parameter to return a style class for a row whereas cells are customized using the body template.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-treetable [value]="files" [columns]="cols" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th>
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode" [ngClass]="{ 'bg-surface-100! dark:bg-surface-800!': rowData.size.endsWith('kb') }">
                    @for (col of columns; let first = $first; track col) {
                        <td [class]="{ 'line-through': col.field === 'size' && rowData.size.endsWith('kb') }">
                            @if (first) {
                                <div class="flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode"></p-treetable-toggler>
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
export class TreeTableConditionalStyleDemo implements OnInit {
    private nodeService = inject(NodeService);

    files!: TreeNode[];

    cols!: Column[];

    ngOnInit() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
    }
}
```
