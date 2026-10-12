# Angular Tree Component — Events

## Events

An event is provided for each type of user interaction such as expand, collapse and selection.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode, MessageService } from 'primeng/api';

@Component({
    template: `
        <p-tree
            [value]="files()"
            class="w-full md:w-120"
            selectionMode="single"
            [(selection)]="selectedFile"
            (onNodeExpand)="nodeExpand($event)"
            (onNodeCollapse)="nodeCollapse($event)"
            (onNodeSelect)="nodeSelect($event)"
            (onNodeUnselect)="nodeUnselect($event)"
        />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService, MessageService]
})
export class TreeEventDemo implements OnInit {
    private nodeService = inject(NodeService);

    private messageService = inject(MessageService);

    files = signal<TreeNode[]>(undefined);

    selectedFile!: TreeNode;

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }

    nodeExpand(event: any) {
        this.messageService.add({ severity: 'success', summary: 'Node Expanded', detail: event.node.label });
    }

    nodeCollapse(event: any) {
        this.messageService.add({ severity: 'warn', summary: 'Node Collapsed', detail: event.node.label });
    }

    nodeSelect(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Node Selected', detail: event.node.label });
    }

    nodeUnselect(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Node Unselected', detail: event.node.label });
    }
}
```
