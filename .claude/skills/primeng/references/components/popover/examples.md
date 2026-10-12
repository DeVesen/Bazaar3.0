# Angular Popover Component — Beispiele

## Basic

Popover is accessed via its reference and visibility is controlled using toggle , show and hide methods with an event of the target.

```typescript
import { Component } from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton severity="secondary" variant="outlined" (click)="op.toggle($event)">Show Popover</button>
            <p-popover #op>
                <div class="max-w-72 w-full">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-sm">Create a New Workspace</span>
                    </div>
                    <p class="text-sm text-muted-color mt-2 mb-0!">Name your workspace to get started. You can always change this later.</p>
                    <input pInputText placeholder="Workspace Name" class="mt-3 w-full" />
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-xs text-surface-500 dark:text-surface-400">Lowercase letters and dashes only</span>
                        <div class="flex items-center gap-2">
                            <button type="button" pButton severity="secondary" variant="outlined" size="small" (click)="op.hide()">Cancel</button>
                            <button type="button" pButton size="small" (click)="op.hide()">Create</button>
                        </div>
                    </div>
                </div>
            </p-popover>
        </div>
    `,
    standalone: true,
    imports: [PopoverModule, ButtonModule, InputTextModule]
})
export class PopoverBasicDemo {}
```

## Controlled

Popover visibility can be controlled from outside by accessing the component with a template reference variable and calling its show , hide and toggle methods. Pass the trigger element as the second argument to keep the overlay anchored to it.

```typescript
import { Component } from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex gap-4 justify-center items-center">
            <button type="button" pButton (click)="op.toggle($event, trigger)">Show Popover</button>
            <button #trigger type="button" pButton severity="secondary" variant="outlined" (click)="op.toggle($event)">Popover Trigger</button>
            <p-popover #op>
                <div class="max-w-72 w-full">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-sm">Create a New Workspace</span>
                    </div>
                    <p class="text-sm text-muted-color mt-2 mb-0!">Name your workspace to get started. You can always change this later.</p>
                    <input pInputText placeholder="Workspace Name" class="mt-3 w-full" />
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-xs text-surface-500 dark:text-surface-400">Lowercase letters and dashes only</span>
                        <div class="flex items-center gap-2">
                            <button type="button" pButton severity="secondary" variant="outlined" size="small" (click)="op.hide()">Cancel</button>
                            <button type="button" pButton size="small" (click)="op.hide()">Create</button>
                        </div>
                    </div>
                </div>
            </p-popover>
        </div>
    `,
    standalone: true,
    imports: [PopoverModule, ButtonModule, InputTextModule]
})
export class PopoverControlledDemo {}
```
