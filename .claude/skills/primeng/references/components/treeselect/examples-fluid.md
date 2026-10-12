# Angular TreeSelect Component — Fluid

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <p-treeselect [(ngModel)]="selectedNodes" [options]="nodes" placeholder="Select Item" fluid />
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectFluidDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
