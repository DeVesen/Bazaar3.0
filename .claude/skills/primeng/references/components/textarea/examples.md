# Angular Textarea Component — Beispiele

## AutoResize

When autoResize is enabled, textarea grows instead of displaying a scrollbar.

```typescript
import { Component } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea rows="5" cols="30" pTextarea [autoResize]="true"></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule]
})
export class TextareaAutoResizeDemo {}
```

## Basic

Textarea is applied to an input field with pTextarea directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea rows="5" cols="30" pTextarea [(ngModel)]="value"></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule, FormsModule]
})
export class TextareaBasicDemo {
    value!: string;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea rows="5" cols="30" pTextarea [disabled]="true"></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule]
})
export class TextareaDisabledDemo {}
```

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea [(ngModel)]="value" [variant]="'filled'" rows="5" cols="30" pTextarea></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule, FormsModule]
})
export class TextareaFilledDemo {
    value!: string;
}
```

## Float Label

A floating label appears on top of the input field when focused. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-stretch gap-4">
            <p-floatlabel>
                <textarea pTextarea id="over_label" [(ngModel)]="value1" rows="5" cols="30" style="resize: none" class="h-full"></textarea>
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <textarea pTextarea id="in_label" [(ngModel)]="value2" rows="5" cols="30" style="resize: none" class="h-full"></textarea>
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <textarea pTextarea id="on_label" [(ngModel)]="value3" rows="5" cols="30" style="resize: none" class="h-full"></textarea>
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, TextareaModule, FormsModule]
})
export class TextareaFloatLabelDemo {
    value1: string = '';

    value2: string = '';

    value3: string = '';
}
```

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <textarea rows="5" cols="30" pTextarea [(ngModel)]="value" fluid></textarea>
    `,
    standalone: true,
    imports: [TextareaModule, FormsModule]
})
export class TextareaFluidDemo {
    value!: string;
}
```

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <textarea pTextarea id="description" [(ngModel)]="value" rows="5" cols="30" style="resize: none"></textarea>
                <label for="description">Description</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, TextareaModule, FormsModule]
})
export class TextareaIftaLabelDemo {
    value: string = '';
}
```

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea rows="5" cols="30" pTextarea [(ngModel)]="value" [invalid]="!value" placeholder="Address"></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule, FormsModule]
})
export class TextareaInvalidDemo {
    value!: string;
}
```

## Keyfilter

InputText has built-in key filtering support to block certain keys, refer to keyfilter page for more information.

```typescript
import { Component } from '@angular/core';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <textarea pKeyFilter="int" rows="5" cols="30" pTextarea></textarea>
        </div>
    `,
    standalone: true,
    imports: [KeyFilterModule, TextareaModule]
})
export class TextareaKeyFilterDemo {}
```

## Sizes

Textarea provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <textarea pTextarea [(ngModel)]="value1" pSize="small" placeholder="Small" rows="3"></textarea>
            <textarea pTextarea [(ngModel)]="value2" placeholder="Normal" rows="3"></textarea>
            <textarea pTextarea [(ngModel)]="value3" pSize="large" placeholder="Large" rows="3"></textarea>
        </div>
    `,
    standalone: true,
    imports: [TextareaModule, FormsModule]
})
export class TextareaSizesDemo {
    value1!: string;

    value2!: string;

    value3!: string;
}
```
