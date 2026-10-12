# Angular Tree Component — Toggle Indicator

## Toggle Indicator

Toggle icons are customized through the togglericon template which receives the expanded state of the node.

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { MinusCircle } from '@primeicons/angular/minus-circle';
import { PlusCircle } from '@primeicons/angular/plus-circle';

@Component({
    template: `
        <p-tree [value]="nodes()" class="w-full md:w-120">
            <ng-template #togglericon let-expanded>
                @if (expanded) {
                    <svg data-p-icon="minus-circle" />
                } @else {
                    <svg data-p-icon="plus-circle" />
                }
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [TreeModule, MinusCircle, PlusCircle],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeToggleIndicatorDemo implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => {
            data[0].expanded = true;
            this.nodes.set(data);
        });
    }
}
```
