# Angular TreeTable Component — Context Menu

## Context Menu

TreeTable has exclusive integration with contextmenu component. In order to attach a menu to a table, add ttContextMenuRow directive to the rows that can be selected with context menu, define a local template variable for the menu and bind it to the contextMenu property of the table. This enables displaying the menu whenever a row is right clicked. A separate contextMenuSelection property is used to get a hold of the right clicked row. For dynamic columns, setting ttContextMenuRowDisabled property as true disables context menu for that particular row.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { NodeService } from '@/service/nodeservice';
import { TreeNode, MenuItem, MessageService } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-treetable [value]="files" [columns]="cols" dataKey="name" [(contextMenuSelection)]="selectedNode" [contextMenu]="cm" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
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
                <tr [ttRow]="rowNode" [ttContextMenuRow]="rowNode">
                    @for (col of columns; let first = $first; track col) {
                        <td>
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
    providers: [NodeService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableContextMenuDemo implements OnInit {
    private nodeService = inject(NodeService);

    private messageService = inject(MessageService);

    files!: TreeNode[];

    selectedNode!: TreeNode;

    cols!: Column[];

    items!: MenuItem[];

    ngOnInit() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
        this.items = [
            { label: 'View', icon: 'pi pi-search', command: () => this.viewFile(this.selectedNode) },
            { label: 'Toggle', icon: 'pi pi-sort', command: () => this.toggleFile(this.selectedNode) }
        ];
    }

    viewFile(node: any) {
        this.messageService.add({ severity: 'info', summary: 'File Selected', detail: node.data.name + ' - ' + node.data.size });
    }

    toggleFile(node: any) {
        node.expanded = !node.expanded;
        this.files = [...this.files];
    }
}
```
