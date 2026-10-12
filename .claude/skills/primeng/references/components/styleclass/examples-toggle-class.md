# Angular StyleClass Component — Toggle Class

## Toggle Class

StyleClass has two modes, toggleClass to simply add-remove a class and enter/leave animations. The target element to change the styling is defined with the selector property that accepts any valid CSS selector or keywords including &#64;next , prev , parent , grandparent

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    template: `
        <div class="flex flex-col items-center">
            <button type="button" pButton pStyleClass="@next" toggleClass="hidden">Toggle Display</button>
            <input type="text" pInputText class="hidden mt-4" />
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, InputTextModule, StyleClassModule]
})
export class StyleClassToggleClassDemo {}
```

---
