# Angular Chip Component — Beispiele

## Basic

Displays compact information with an optional remove action.

```typescript
import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-chip label="GitHub" icon="pi pi-github" />
        </div>
    `,
    standalone: true,
    imports: [ChipModule]
})
export class ChipBasicDemo {}
```

## Icon

A font icon next to the label can be displayed with the icon property. Use removable to add a remove action.

```typescript
import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
    template: `
        <div class="flex items-center justify-center flex-wrap gap-2">
            <p-chip label="Apple" icon="pi pi-apple" />
            <p-chip label="Facebook" icon="pi pi-facebook" />
            <p-chip label="Google" icon="pi pi-google" />
            <p-chip label="Microsoft" icon="pi pi-microsoft" />
            <p-chip label="GitHub" icon="pi pi-github" [removable]="true" />
        </div>
    `,
    standalone: true,
    imports: [ChipModule]
})
export class ChipIconDemo {}
```

## Image

The image property is used to display an image like an avatar.

```typescript
import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
    template: `
        <div class="flex items-center justify-center flex-wrap gap-2">
            <p-chip label="Amy Elsner" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" />
            <p-chip label="Asiya Javayant" image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" />
            <p-chip label="Onyama Limba" image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" />
            <p-chip label="Xuxue Feng" image="https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png" [removable]="true" />
        </div>
    `,
    standalone: true,
    imports: [ChipModule]
})
export class ChipImageDemo {}
```

## Template

Chip also allows displaying custom content inside itself.

```typescript
import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
    template: `
        <div class="flex items-center justify-center flex-wrap gap-2">
            <p-chip label="Apple" icon="pi pi-apple" class="bg-neutral-900! dark:bg-neutral-50! **:text-neutral-50! dark:**:text-neutral-900!" />
            <p-chip label="Facebook" icon="pi pi-facebook" class="bg-blue-50! dark:bg-blue-950! **:text-blue-700! dark:**:text-blue-300!" />
            <p-chip label="Google" icon="pi pi-google" class="bg-red-50! dark:bg-red-950! **:text-red-700! dark:**:text-red-300!" />
            <p-chip label="Microsoft" icon="pi pi-microsoft" class="bg-green-50! dark:bg-green-950! **:text-green-700! dark:**:text-green-300!" />
            <p-chip label="GitHub" icon="pi pi-github" [removable]="true" class="bg-purple-50! dark:bg-purple-950! **:text-purple-700! dark:**:text-purple-300!" />
        </div>
    `,
    standalone: true,
    imports: [ChipModule]
})
export class ChipTemplateDemo {}
```
