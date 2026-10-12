# Angular Drag and Drop Component — Drag Handle

## Drag Handle

dragHandle is used to restrict dragging unless mousedown occurs on the specified element. Panel below can only be dragged using its header.

```typescript
import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { DragDropModule } from 'primeng/dragdrop';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div pDraggable dragHandle=".p-panel-header" class="w-60">
            <p-panel header="Drag Header"> Content </p-panel>
        </div>
    `,
    standalone: true,
    imports: [PanelModule, DragDropModule]
})
export class DragDropDragHandleDemo {}
```
