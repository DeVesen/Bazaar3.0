# Angular Rating Component — Beispiele

## Basic

Two-way value binding is defined using ngModel .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" [allowHalf]="true" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingBasicDemo {
    value: number = 3.5;
}
```

## Controlled

Rating value can be controlled programmatically.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-col items-center justify-center gap-6">
            <p-rating [(ngModel)]="value" [allowHalf]="true" />
            <div class="flex items-center gap-2">
                <button pButton (click)="value = 2.5" severity="secondary" variant="outlined" size="small">2.5 Star</button>
                <button pButton (click)="value = 3" severity="secondary" variant="outlined" size="small">3 Star</button>
                <button pButton (click)="value = 3.5" severity="secondary" variant="outlined" size="small">3.5 Star</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [RatingModule, ButtonModule, FormsModule]
})
export class RatingControlledDemo {
    value: number = 4;
}
```

## Disabled

When disabled is present, a visual hint is applied to indicate that the Knob cannot be interacted with.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingDisabledDemo {
    value: number = 3;
}
```

## Emoji

Custom content can be used for rating icons using templates.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" [allowHalf]="false" [stars]="5">
                <ng-template #onicon let-index>
                    <span class="text-4xl select-none transition-all">{{ emojis[index - 1] }}</span>
                </ng-template>
                <ng-template #officon let-index>
                    <span class="text-4xl select-none transition-all grayscale">{{ emojis[index - 1] }}</span>
                </ng-template>
            </p-rating>
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingEmojiDemo {
    value: number = 3;

    emojis: string[] = ['😡', '😕', '😐', '🙂', '😍'];
}
```

## Half Stars

Enable allowHalf property to select half stars.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-col gap-6 items-center justify-center">
            <div class="flex flex-col gap-2">
                <label pLabel>Full Star</label>
                <p-rating [(ngModel)]="value1" />
            </div>
            <div class="flex flex-col gap-2">
                <label pLabel>Half Star</label>
                <p-rating [(ngModel)]="value2" [allowHalf]="true" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [RatingModule, LabelModule, FormsModule]
})
export class RatingHalfDemo {
    value1: number = 3;

    value2: number = 3;
}
```

## Number of Stars

Number of stars to display is defined with stars property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" [stars]="10" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingNumberOfStarsDemo {
    value: number = 5;
}
```

## ReadOnly

When readonly present, value cannot be edited.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" [readonly]="true" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingReadonlyDemo {
    value: number = 3;
}
```

## Template

Templating allows customizing the content where the icon instance is available as the implicit variable.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex flex-col items-center justify-center gap-6">
            <p-rating [(ngModel)]="value1" [allowHalf]="true">
                <ng-template #onicon>
                    <span class="text-surface-950 dark:text-surface-0 font-medium text-4xl select-none">A</span>
                </ng-template>
                <ng-template #officon>
                    <span class="text-surface-300 dark:text-surface-700 font-medium text-4xl select-none">A</span>
                </ng-template>
            </p-rating>
            <p-rating [(ngModel)]="value2">
                <ng-template #onicon>
                    <span class="size-7">
                        <img src="https://primefaces.org/cdn/primevue/images/rating/custom-onicon.png" class="size-7" />
                    </span>
                </ng-template>
                <ng-template #officon>
                    <span class="size-7">
                        <img src="https://primefaces.org/cdn/primevue/images/rating/custom-officon.png" class="size-7" />
                    </span>
                </ng-template>
            </p-rating>
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingTemplateDemo {
    value1: number = 3;

    value2: number = 3;
}
```

## Vertical

Rating can be displayed vertically by setting the orientation property to vertical .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" orientation="vertical" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingVerticalDemo {
    value: number = 3;
}
```

## Withoutcancel

A cancel icon is displayed to reset the value by default, set cancel as false to remove this option.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
    template: `
        <div class="flex justify-center">
            <p-rating [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [RatingModule, FormsModule]
})
export class RatingWithoutCancelDemo {
    value!: number;
}
```
