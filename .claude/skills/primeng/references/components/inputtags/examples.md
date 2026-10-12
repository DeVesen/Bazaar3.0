# Angular InputTags Component — Beispiele

## Allow Duplicate

By default, duplicate values are not allowed. Set allowDuplicate to enable adding the same value multiple times.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" [allowDuplicate]="true" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsAllowDuplicateDemo {
    value: string[] = ['a', 'A', 'a'];
}
```

## Basic

InputTags is used to enter multiple tags. Press Enter to add a tag and Backspace to remove the last one.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsBasicDemo {
    value: string[] = ['Angular'];
}
```

## Delimiter

A custom delimiter like a comma can be used in addition to the Enter key to add tags. Enable addOnPaste to split pasted text using the delimiter.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" delimiter="," [addOnPaste]="true" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsDelimiterDemo {
    value: string[] = [];
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" [disabled]="true" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsDisabledDemo {
    value: string[] = ['Angular'];
}
```

## Events

Use onAdd and onRemove callbacks to listen for tag changes.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" (onAdd)="onAddItem($event)" (onRemove)="onRemoveItem($event)" placeholder="Add tags and watch the event log..." fluid />
        <div class="mt-4 text-sm">
            @for (log of logs; track $index) {
                <p>{{ log }}</p>
            }
        </div>
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsEventsDemo {
    value: string[] = ['Angular'];

    logs: string[] = [];

    onAddItem(event: any) {
        this.logs = [`Added: "${event.value}"`, ...this.logs.slice(0, 4)];
    }

    onRemoveItem(event: any) {
        this.logs = [`Removed: "${event.value}" at index ${event.index}`, ...this.logs.slice(0, 4)];
    }
}
```

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" variant="filled" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsFilledDemo {
    value: string[] = ['Angular'];
}
```

## Float Label

A floating label appears on top of the input field when focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-floatlabel>
            <p-inputtags [(ngModel)]="value" inputId="tags" fluid />
            <label for="tags">Technologies</label>
        </p-floatlabel>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputTagsModule, FormsModule]
})
export class InputTagsFloatLabelDemo {
    value: string[] = [];
}
```

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-iftalabel>
            <p-inputtags [(ngModel)]="tags" inputId="it_tags" fluid />
            <label for="it_tags">Technologies</label>
        </p-iftalabel>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputTagsModule, FormsModule]
})
export class InputTagsIftaLabelDemo {
    tags: string[] = [];
}
```

## Invalid

The invalid property is used to indicate an invalid state.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" [invalid]="value.length === 0" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsInvalidDemo {
    value: string[] = [];
}
```

## Max

The maximum number of tags is limited using the max property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" [max]="5" fluid />
    `,
    standalone: true,
    imports: [InputTagsModule, FormsModule]
})
export class InputTagsMaxDemo {
    value: string[] = ['Angular', 'React'];
}
```

## Template

Custom content can be displayed for each tag using the item template.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTagsModule } from 'primeng/inputtags';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <p-inputtags [(ngModel)]="value" fluid>
            <ng-template #item let-item let-i="index" let-onRemove="onRemove">
                <p-tag [rounded]="true">
                    {{ item }}
                    <svg data-p-icon="times" class="cursor-pointer ml-2" style="width: 12px; height: 12px" (click)="onRemove($event, i)"></svg>
                </p-tag>
            </ng-template>
        </p-inputtags>
    `,
    standalone: true,
    imports: [TagModule, InputTagsModule, FormsModule, Times]
})
export class InputTagsTemplateDemo {
    value: string[] = ['JavaScript', 'TypeScript'];
}
```

## Typeahead

When typeahead is enabled, a dropdown with suggestions is displayed as the user types. Use the completeMethod event to provide search results.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTagsModule } from 'primeng/inputtags';
import { LabelModule } from 'primeng/label';
import { InputTagsCompleteEvent } from 'primeng/types/inputtags';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputtags
                [(ngModel)]="values"
                [typeahead]="true"
                [group]="true"
                [allowDuplicate]="true"
                [suggestions]="filteredItems"
                (completeMethod)="search($event)"
                optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                placeholder="Search technologies..."
                class="w-full md:w-56"
            />
        </div>
    `,
    standalone: true,
    imports: [InputTagsModule, LabelModule, FormsModule]
})
export class InputTagsTypeaheadDemo {
    values: any[] = [];

    items = [
        {
            label: 'Frontend',
            items: [{ label: 'React' }, { label: 'Vue' }, { label: 'Angular' }, { label: 'Svelte' }, { label: 'Next.js' }, { label: 'Nuxt' }]
        },
        {
            label: 'Backend',
            items: [{ label: 'Node.js' }, { label: 'Python' }, { label: 'Java' }, { label: 'Go' }, { label: 'Rust' }, { label: 'Ruby' }]
        }
    ];

    filteredItems: any[] = [];

    search(event: InputTagsCompleteEvent) {
        const query = event.query.toLowerCase();

        this.filteredItems = this.items
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.label.toLowerCase().includes(query))
            }))
            .filter((group) => group.items.length > 0);
    }
}
```
