# Angular Tree Component — Context Menu

## Context Menu

Tree has exclusive integration with ContextMenu using the contextMenu property along with the contextMenuSelection to manage the selection.

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode, MenuItem, MessageService } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="files()" class="w-full md:w-80" selectionMode="single" [(selection)]="selectedNode" [(contextMenuSelection)]="contextMenuNode" [contextMenu]="cm" />
        <p-contextmenu #cm [model]="items" />
    `,
    standalone: true,
    imports: [ContextMenuModule, TreeModule],
    providers: [NodeService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeContextMenuDemo implements OnInit {
    private nodeService = inject(NodeService);

    private messageService = inject(MessageService);

    files = signal<TreeNode[]>([]);

    selectedNode = model<TreeNode | null>(null);

    contextMenuNode = model<TreeNode | null>(null);

    items!: MenuItem[];

    ngOnInit() {
        this.nodeService.getFiles().then((files) => this.files.set(files));
        this.items = [
            { label: 'View', icon: 'pi pi-search', command: () => this.viewFile(this.contextMenuNode()) },
            { label: 'Toggle', icon: 'pi pi-sort', command: () => this.toggleFile(this.contextMenuNode()) }
        ];
    }

    viewFile(node: TreeNode | null) {
        if (node) {
            this.messageService.add({ severity: 'info', summary: 'File Selected', detail: node.label });
        }
    }

    toggleFile(node: TreeNode | null) {
        if (node) {
            this.files.set(this.updateNodeInTree(this.files(), node.key, { ...node, expanded: !node.expanded }));
        }
    }

    updateNodeInTree(nodes: TreeNode[], key: string | undefined, updatedNode: TreeNode): TreeNode[] {
        return nodes.map((n) => {
            if (n.key === key) {
                return updatedNode;
            }

            if (n.children) {
                return { ...n, children: this.updateNodeInTree(n.children, key, updatedNode) };
            }

            return n;
        });
    }
}
```
