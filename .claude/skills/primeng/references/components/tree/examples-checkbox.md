# Angular Tree Component — Checkbox

## Checkbox

Selection of multiple nodes via checkboxes is enabled by configuring selectionMode as checkbox .

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="files()" selectionMode="checkbox" class="w-full md:w-120" [(selection)]="selectedFiles" />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService]
})
export class TreeCheckboxDemo implements OnInit {
    private nodeService = inject(NodeService);

    files = signal<TreeNode[]>(undefined);

    selectedFiles!: TreeNode[];

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
```
