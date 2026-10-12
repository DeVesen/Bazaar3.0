# Angular Tree Component — Basic

## Basic

Displays hierarchical data with expand and collapse support.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="files()" class="w-full md:w-120" />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService]
})
export class TreeBasicDemo implements OnInit {
    private nodeService = inject(NodeService);

    files = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
```
