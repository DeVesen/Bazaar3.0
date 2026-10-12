# Angular InputText Component — Beispiele

## Basic

InputText is used as a controlled input with ngModel property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <input type="text" pInputText [(ngModel)]="value" placeholder="Enter text" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextBasicDemo {
    value: string;
}
```

## Clear Icon

Combine InputText with IconField to display a clear icon that resets the value when clicked.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iconfield>
                <input pInputText [(ngModel)]="value" class="w-56" placeholder="Type something" />
                @if (value) {
                    <p-inputicon (click)="value = ''" style="cursor: pointer">
                        <svg data-p-icon="times"></svg>
                    </p-inputicon>
                }
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule, Times]
})
export class InputTextCleariconDemo {
    value: string = '';
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText disabled placeholder="Disabled" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule]
})
export class InputTextDisabledDemo {}
```

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <input type="text" pInputText [(ngModel)]="value" variant="filled" placeholder="Enter text" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextFilledDemo {
    value: string;
}
```

## Float Label

FloatLabel visually integrates a label with its form element. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <input pInputText id="over_label" [(ngModel)]="value1" autocomplete="off" />
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <input pInputText id="in_label" [(ngModel)]="value2" autocomplete="off" />
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="on_label" [(ngModel)]="value3" autocomplete="off" />
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputTextModule, FormsModule]
})
export class InputTextFloatLabelDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <input type="text" pInputText [(ngModel)]="value" fluid />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextFluidDemo {
    value: string;
}
```

## Help Text

An advisory text can be defined with the semantic small tag.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col gap-2">
                <label pLabel for="username">Username</label>
                <input pInputText id="username" aria-describedby="username-help" [(ngModel)]="value" />
                <small id="username-help" class="text-sm">Enter your username to reset your password.</small>
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, LabelModule, FormsModule]
})
export class InputTextHelpTextDemo {
    value: string | undefined;
}
```

## Icons

Icons can be placed inside an input element by wrapping both the input and the icon with an element that has either .p-input-icon-left or p-input-icon-right class.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input type="text" pInputText [(ngModel)]="value" />
            </span>
            <span class="p-input-icon-right">
                <i class="pi pi-spin pi-spinner"></i>
                <input type="text" pInputText [(ngModel)]="value2" />
            </span>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextIconsDemo {
    value: string | undefined;

    value2: string | undefined;
}
```

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

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
export class InputTextIftaLabelDemo {
    value: string | undefined;
}
```

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <input pInputText [(ngModel)]="value1" [invalid]="!value1" placeholder="Enter text" />
            <input pInputText [(ngModel)]="value2" [invalid]="!value2" variant="filled" placeholder="Enter text" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextInvalidDemo {
    value1: string | undefined;

    value2: string | undefined;
}
```

## Keyfilter

InputText has built-in key filtering support to block certain keys, refer to keyfilter page for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText pKeyFilter="int" placeholder="Integers" [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, KeyFilterModule, FormsModule]
})
export class InputTextKeyFilterDemo {
    value: number | undefined;
}
```

## Sizes

InputText provides small and large sizes as alternatives to the standard.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <input pInputText [(ngModel)]="value1" type="text" pSize="small" placeholder="Small" />
            <input pInputText [(ngModel)]="value2" type="text" placeholder="Normal" />
            <input pInputText [(ngModel)]="value3" type="text" pSize="large" placeholder="Large" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, FormsModule]
})
export class InputTextSizesDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
