# Angular TreeSelect Component — Filter

## Filter

Filtering is enabled by adding the filter property, by default label property of a node is used to compare against the value in the text field, in order to customize which field(s) should be used during search define filterBy property. In addition filterMode specifies the filtering strategy. In lenient mode when the query matches a node, children of the node are not searched further as all descendants of the node are included. On the other hand, in strict mode when the query matches a node, filtering continues on all descendants.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect class="md:w-80 w-full" [(ngModel)]="selectedNodes" [options]="nodes" placeholder="Select Item" [filter]="true" [filterInputAutoFocus]="true" />
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectFilterDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
