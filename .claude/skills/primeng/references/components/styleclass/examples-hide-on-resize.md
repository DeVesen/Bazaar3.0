# Angular StyleClass Component — Hide On Resize

## Hide On Resize

When hideOnResize is enabled, the leave animation is triggered automatically when resizing occurs. Use the resizeSelector property to specify whether to listen to window resize events or element-specific resize events. Set resizeSelector to "window" (default) or "document" for browser resize, or a CSS selector to observe the target element's dimensions.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <div class="flex flex-col items-center gap-4 w-100">
                <button type="button" pButton pStyleClass=".window-responsive-bo …(lange Zeile gekürzt)
                    Show Window Responsive Content
                </button>
                <div class="window-responsive-box hidden animate-duration-300 border border-lg border-surface">
                    <div class="p-3 flex flex-col gap-2">
                        <h3 class="text-lg font-bold">Window Responsive Panel</h3>
                        <p class="text-sm">This panel will hide when you resize the browser window.</p>
                        <p class="text-sm">Try resizing your browser window to see the effect.</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-center gap-4 w-100">
                <button
                    type="button"
                    pButton
                    pStyleClass=".resizable-container"
                    enterFromClass="hidden"
                    enterActiveClass="animate-fadein"
                    leaveActiveClass="animate-fadeout"
                    leaveToClass="hidden"
                    [hideOnResize]="true"
                    resizeSelector=".resizable-container"
                >
                    Show Resizable Panel
                </button>
                <div class="resizable-container hidden animate-duration-300 border border-lg border-surface w-80 w-max-[25rem] w-min-[15rem] overflow-auto resize">
                    <div class="p-4 h-full flex flex-col gap-2">
                        <h3 class="text-lg font-bold">Resizable Panel</h3>
                        <p class="text-sm">Drag the resize handle in the bottom-right corner to resize this panel.</p>
                        <p class="text-sm">The panel will hide when you resize it.</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, StyleClassModule]
})
export class StyleClassHideOnResizeDemo {}
```
