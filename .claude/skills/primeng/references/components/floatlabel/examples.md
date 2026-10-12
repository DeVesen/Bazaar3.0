# Angular Float Label Component — Beispiele

## Basic

FloatLabel is used by wrapping the input and its label.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <p-floatlabel>
                <input id="username" pInputText [(ngModel)]="value" autocomplete="off" />
                <label for="username">Username</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputTextModule, FormsModule]
})
export class FloatLabelBasicDemo {
    value: string | undefined;
}
```

## Invalid

When the form element is invalid, the label is also highlighted.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <input pInputText id="value1" [(ngModel)]="value1" [invalid]="!value1" autocomplete="off" />
                <label for="value1">Username</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <input pInputText id="value2" [(ngModel)]="value2" [invalid]="!value2" autocomplete="off" />
                <label for="value2">Username</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="value3" [(ngModel)]="value3" [invalid]="!value3" autocomplete="off" />
                <label for="value3">Username</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputTextModule, FormsModule]
})
export class FloatLabelInvalidDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```

## Variants

The variant property defines the position of the label. Default value is over , whereas in and on are the alternatives.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel variant="in">
                <input pInputText id="in_label" [(ngModel)]="value1" autocomplete="off" />
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="on_label" [(ngModel)]="value2" autocomplete="off" />
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputTextModule, FormsModule]
})
export class FloatLabelVariantsDemo {
    value1: string | undefined;

    value2: string | undefined;
}
```
