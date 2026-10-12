# Angular TreeSelect Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect class="md:w-80 w-full" [(ngModel)]="selectedNodes" [options]="nodes" [disabled]="true" placeholder="TreeSelect" />
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectDisabledDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
