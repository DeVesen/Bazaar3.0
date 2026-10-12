# Angular Table Component — Emptystate

## Emptystate

Custom empty state when no data is available, using the emptymessage template.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Product } from '@/domain/product';
import { Inbox } from '@primeicons/angular/inbox';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <p-table [value]="[]" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="4">
                        <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                            <div class="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <svg data-p-icon="inbox" [size]="28" class="text-surface-400 dark:text-surface-500" />
                            </div>
                            <div>
                                <p class="m-0 font-semibold text-surface-900 dark:text-surface-0">No products yet</p>
                                <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">Add your first product to see it listed here.</p>
                            </div>
                            <button type="button" pButton size="small">
                                <svg data-p-icon="plus" />
                                Add product
                            </button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, ButtonModule, Inbox, Plus],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableEmptyStateDemo {}
```
