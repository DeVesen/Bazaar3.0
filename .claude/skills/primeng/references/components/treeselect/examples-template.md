# Angular TreeSelect Component — Template

## Template

TreeSelect offers multiple templates for customization through templating.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect class="md:w-80 w-full" [(ngModel)]="selectedNodes" [options]="nodes" placeholder="Select Item">
                <ng-template #dropdownicon>
                    <i class="pi pi-search"></i>
                </ng-template>
                <ng-template #header>
                    <div class="font-medium px-3 py-2">Available Files</div>
                </ng-template>
                <ng-template #footer>
                    <div class="px-3 pt-1 pb-2 flex justify-between">
                        <button pButton severity="secondary" text size="small"><i class="pi pi-plus"></i> Add New</button>
                        <button pButton severity="danger" text size="small"><i class="pi pi-plus"></i> Remove All</button>
                    </div>
                </ng-template>
            </p-treeselect>
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, ButtonModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectTemplateDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
