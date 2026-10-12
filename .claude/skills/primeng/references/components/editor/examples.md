# Angular Editor Component — Beispiele

## Basic

A model can be bound using the standard ngModel directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
    template: `
        <p-editor [(ngModel)]="text" [style]="{ height: '320px' }" />
    `,
    standalone: true,
    imports: [EditorModule, FormsModule]
})
export class EditorBasicDemo {
    text: string | undefined;
}
```

## Customtoolbar

Editor provides a default toolbar with common options, to customize it define your elements inside the header element. Refer to Quill documentation for available controls.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
    template: `
        <p-editor [(ngModel)]="text" [style]="{ height: '320px' }">
            <ng-template #header>
                <span class="ql-formats">
                    <button type="button" class="ql-bold" aria-label="Bold"></button>
                    <button type="button" class="ql-italic" aria-label="Italic"></button>
                    <button type="button" class="ql-underline" aria-label="Underline"></button>
                </span>
            </ng-template>
        </p-editor>
    `,
    standalone: true,
    imports: [EditorModule, FormsModule]
})
export class EditorCustomToolbarDemo {
    text: string = '<div>Hello World!</div><div>PrimeNG <b>Editor</b> Rocks</div><div><br></div>';
}
```

## Quill

Editor uses Quill editor underneath so it needs to be installed as a dependency.

## ReadOnly

When readonly is present, the value cannot be edited.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
    template: `
        <p-editor [(ngModel)]="text" [readonly]="true" [style]="{ height: '320px' }" />
    `,
    standalone: true,
    imports: [EditorModule, FormsModule]
})
export class EditorReadonlyDemo {
    text: string = 'Always bet on Prime!';
}
```
