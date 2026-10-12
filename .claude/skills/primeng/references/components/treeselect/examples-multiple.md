# Angular TreeSelect Component — Multiple

## Multiple

More than one node is selectable by setting selectionMode to multiple . By default in multiple selection mode, metaKey press (e.g. ⌘ ) is necessary to add to existing selections however this can be configured with disabling the metaKeySelection property. Note that in touch enabled devices, TreeSelect always ignores metaKey. In multiple selection mode, value binding should be a key-value pair where key is the node key and value is a boolean to indicate selection.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect class="w-full md:w-80" [(ngModel)]="selectedNodes" [options]="nodes" [metaKeySelection]="false" selectionMode="multiple" placeholder="Select Item" />
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectMultipleDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    exampleCode = {
        typescript: `{
    '0-0': true,
    '0-1-0': true
}`
    };

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
