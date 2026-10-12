# Angular Tree Component — Filter

## Filter

Filtering enables searching through the nodes using the built-in filter property.

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="files()" class="w-full md:w-120" [filter]="true" filterPlaceholder="Search" emptyMessage="No options found." [pt]="{ emptyMessage: { class: 'mt-2' } }" />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeFilterDemo implements OnInit {
    files = signal<TreeNode[]>(undefined);

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
```
