# Angular Button Component — Link

## Link

The link input renders the button as a textual link. The pButton directive can also be applied on anchor elements to style links as buttons, including Angular routerLink .

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center gap-4">
            <button type="button" pButton link>Link</button>
            <a pButton href="https://angular.dev/" target="_blank" rel="noopener noreferrer">External</a>
            <a pButton routerLink="/">Router</a>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonLinkDemo {}
```
