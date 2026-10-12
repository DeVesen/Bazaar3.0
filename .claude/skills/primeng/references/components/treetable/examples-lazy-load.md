# Angular TreeTable Component — Lazy Load

## Lazy Load

Children can be loaded on demand using onNodeExpand callback to implement lazy loading.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-treetable [value]="files" (onNodeExpand)="onNodeExpand($event)" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td>
                        <div class="flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            <span>{{ rowData.name }}</span>
                        </div>
                    </td>
                    <td>{{ rowData.size }}</td>
                    <td>{{ rowData.type }}</td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TreeTableModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableLazyLoadDemo implements OnInit {
    files!: TreeNode[];

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.files = [
            { key: '0', data: { name: 'Applications', size: '100kb', type: 'Folder' }, leaf: false },
            { key: '1', data: { name: 'Cloud', size: '20kb', type: 'Folder' }, leaf: false },
            { key: '2', data: { name: 'Desktop', size: '150kb', type: 'Folder' }, leaf: false },
            { key: '3', data: { name: 'Documents', size: '75kb', type: 'Folder' }, leaf: false }
        ];
    }

    onNodeExpand(event: any) {
        const node = event.node;

        if (node.children) return;

        node.loading = true;
        this.files = [...this.files];
        this.cd.markForCheck();

        setTimeout(() => {
            node.children = Array.from({ length: 3 }, (_, i) => ({
                key: `${node.key}-${i}`,
                data: { name: `File ${node.key}.${i + 1}`, size: `${(i + 1) * 10}kb`, type: 'Document' },
                leaf: true
            }));
            node.loading = false;
            this.files = [...this.files];
            this.cd.markForCheck();
        }, 600);
    }
}
```
