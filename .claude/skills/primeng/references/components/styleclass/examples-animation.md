# Angular StyleClass Component — Animation

## Animation

Classes to apply during enter and leave animations are specified using the enterFromClass , enterActiveClass , enterToClass , leaveFromClass , leaveActiveClass , leaveToClass properties. In addition in case the target is an overlay, hideOnOutsideClick would be handy to hide the target if outside of the popup is clicked, or enable hideOnEscape to close the popup by listening escape key.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    template: `
        <div class="flex items-center justify-center gap-7">
            <div class="flex flex-col items-center">
                <div>
                    <button type="button" pButton pStyleClass=".box1" enterFromClass="my-hidden" enterActiveClass="my-fadein" class="mr-2">FadeIn</button>
                    <button type="button" pButton pStyleClass=".box1" leaveActiveClass="my-fadeout" leaveToClass="my-hidden" severity="secondary">FadeOut</button>
                </div>
                <div class="h-32">
                    <div class="my-hidden animate-duration-500 box1">
                        <div class="flex bg-primary text-primary-contrast items-center justify-center py-3 rounded-md mt-4 font-bold text-sm w-28 h-28">Custom</div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-center">
                <div>
                    <button type="button" pButton pStyleClass=".box2" enterFromClass="hidden" enterActiveClass="animate-slidedown" class="mr-2">SlideDown</button>
                    <button type="button" pButton pStyleClass=".box2" leaveActiveClass="animate-slideup" leaveToClass="hidden" severity="secondary">SlideUp</button>
                </div>
                <div class="h-32">
                    <div class="hidden animate-duration-500 box2 overflow-hidden">
                        <div class="flex bg-primary text-primary-contrast items-center justify-center py-3 rounded-md mt-4 font-bold text-sm w-28 h-28">Content</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                @keyframes my-fadein {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes my-fadeout {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }

                .my-hidden {
                    display: none;
                }

                .my-fadein {
                    animation: my-fadein 150ms linear;
                }

                .my-fadeout {
                    animation: my-fadeout 150ms linear;
                }
            }
        `
    ],
    standalone: true,
    imports: [ButtonModule, StyleClassModule]
})
export class StyleClassAnimationDemo {}
```
