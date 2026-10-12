# Angular TreeTable Component — Template

## Template

Paginator UI is customized using the paginatorleft and paginatorright templates. Each element can also be customized further with your own UI to replace the default one, refer to the Paginator component for more information about the advanced customization options.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Refresh } from '@primeicons/angular/refresh';
import { Download } from '@primeicons/angular/download';

@Component({
    template: `
        <p-treetable [value]="files" [paginator]="true" [rows]="5" [rowsPerPageOptions]="[5, 10, 25, 50]" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 34%">Name</th>
                    <th style="width: 33%">Size</th>
                    <th style="width: 33%">Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td>
                        <div class="inline-flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            <span>{{ rowData.name }}</span>
                        </div>
                    </td>
                    <td>{{ rowData.size }}</td>
                    <td>
                        <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #paginatorleft>
                <button pButton type="button" iconOnly text>
                    <svg data-p-icon="refresh" />
                </button>
            </ng-template>
            <ng-template #paginatorright>
                <button pButton type="button" iconOnly text>
                    <svg data-p-icon="download" />
                </button>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, ButtonModule, Refresh, Download],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTablePaginatorTemplateDemo implements OnInit {
    files!: TreeNode[];

    ngOnInit() {
        const files: TreeNode[] = [];
        for (let i = 0; i < 50; i++) {
            files.push({
                key: `${i}`,
                data: {
                    name: 'Item ' + i,
                    size: Math.floor(Math.random() * 1000) + 1 + 'kb',
                    type: 'Type ' + i
                },
                children: [
                    {
                        key: `${i} - 0`,
                        data: {
                            name: 'Item ' + i + ' - 0',
                            size: Math.floor(Math.random() * 1000) + 1 + 'kb',
                            type: 'Type ' + i
                        }
                    }
                ]
            });
        }
        this.files = files;
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
