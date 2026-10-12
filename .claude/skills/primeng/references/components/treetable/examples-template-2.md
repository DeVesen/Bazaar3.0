# Angular TreeTable Component — Template

## Template

Custom content at caption , header , body and summary sections are supported via templating.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-treetable [value]="files" [columns]="cols" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #caption><div class="text-xl font-bold">File Viewer</div> </ng-template>
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; let last = $last; track col) {
                        <th [class]="{ 'w-40': last }">
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode">
                    @for (col of columns; let first = $first; let last = $last; track col) {
                        <td>
                            @if (first) {
                                <div class="flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode" />
                                    <span>{{ rowData[col.field] }}</span>
                                </div>
                            } @else if (last) {
                                <div class="flex flex-wrap gap-2">
                                    <button pButton iconOnly rounded="true" severity="secondary"><i class="pi pi-search"></i></button>
                                    <button pButton iconOnly rounded="true" severity="secondary"><i class="pi pi-pencil"></i></button>
                                </div>
                            } @else {
                                <span>{{ rowData[col.field] }}</span>
                            }
                        </td>
                    }
                </tr>
            </ng-template>
            <ng-template #summary>
                <div style="text-align:left">
                    <button pButton severity="warn"><i class="pi pi-refresh"></i> Reload</button>
                </div>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TreeTableModule, ButtonModule],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableTemplateDemo implements OnInit {
    private nodeService = inject(NodeService);

    files!: TreeNode[];

    cols!: Column[];

    ngOnInit() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: '', header: '' }
        ];
    }
}
```
