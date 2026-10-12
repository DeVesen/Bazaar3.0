# Angular Button Component — Basic

## Basic

Apply the pButton directive on a native &lt;button&gt; element with the label text inside.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button pButton>Submit</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonBasicDemo {}
```
