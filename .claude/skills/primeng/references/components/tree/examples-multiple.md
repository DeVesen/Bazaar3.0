# Angular Tree Component — Multiple

## Multiple

More than one node is selectable by setting selectionMode to multiple . By default in multiple selection mode, metaKey press (e.g. ⌘ ) is necessary to add to existing selections however this can be configured with disabling the metaKeySelection property. Note that in touch enabled devices, Tree always ignores metaKey. In multiple selection mode, value binding should be a key-value pair where key is the node key and value is a boolean to indicate selection.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Tree, TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <div class="flex items-center mb-6 gap-2">
            <p-toggleswitch inputId="input-metakey" [(ngModel)]="metaKeySelection" />
            <label for="input-metakey">MetaKey</label>
        </div>
        <p-tree [metaKeySelection]="metaKeySelection" [value]="files()" class="w-full md:w-120" selectionMode="multiple" [(selection)]="selectedFiles" />
    `,
    standalone: true,
    imports: [ToggleSwitchModule, TreeModule, FormsModule],
    providers: [NodeService]
})
export class TreeMultipleDemo implements OnInit {
    private nodeService = inject(NodeService);

    metaKeySelection: boolean = false;

    files = signal<TreeNode[]>(undefined);

    selectedFiles!: TreeNode[];

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
```
