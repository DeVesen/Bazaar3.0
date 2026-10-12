# Angular TreeSelect Component — Clear Icon

## Clear Icon

When showClear is enabled, a clear icon is displayed to clear the value.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect [(ngModel)]="selectedNodes" [options]="nodes" placeholder="Select Item" class="md:w-80 w-full" [showClear]="true" />
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectClearIconDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
