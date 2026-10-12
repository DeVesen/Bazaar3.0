# Angular Ifta Label Component — Beispiele

## Basic

IftaLabel is used by wrapping the input and its label.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <input pInputText id="username" [(ngModel)]="value" autocomplete="off" />
                <label for="username">Username</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputTextModule, FormsModule]
})
export class IftaLabelBasicDemo {
    value: string | undefined;
}
```

## Invalid

When the form element is invalid, the label is also highlighted.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <input pInputText id="username" [(ngModel)]="value" [invalid]="!value" autocomplete="off" />
                <label for="username">Username</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputTextModule, FormsModule]
})
export class IftaLabelInvalidDemo {
    value: string | undefined;
}
```
