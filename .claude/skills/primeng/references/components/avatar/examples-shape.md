# Angular Avatar Component — Shape

## Shape

Avatar comes in two different styles specified with the shape property, square is the default and circle is the alternative.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
    template: `
        <div class="flex items-center justify-center gap-4">
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/walter.jpg" shape="circle" size="large" />
            <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/walter.jpg" shape="square" size="large" />
        </div>
    `,
    standalone: true,
    imports: [AvatarModule]
})
export class AvatarShapeDemo {}
```
