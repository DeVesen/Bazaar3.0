# Angular KeyFilter Component — Beispiele

## Presets

KeyFilter provides various presets configured with the pKeyFilter property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-auto">
                <label pLabel for="integer" class="font-bold! block mb-2"> Integer </label>
                <input pInputText id="integer" [ngModel]="integer" (ngModelChange)="integer = $event" pKeyFilter="int" class="w-full" />
            </div>
            <div class="flex-auto">
                <label pLabel for="number" class="font-bold! block mb-2"> Number </label>
                <input pInputText id="number" [ngModel]="number" (ngModelChange)="number = $event" pKeyFilter="num" class="w-full" />
            </div>
            <div class="flex-auto">
                <label pLabel for="money" class="font-bold! block mb-2"> Money </label>
                <input pInputText id="money" [ngModel]="money" (ngModelChange)="money = $event" pKeyFilter="money" class="w-full" />
            </div>
        </div>
        <div class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel for="hex" class="font-bold! block mb-2"> Hex </label>
                <input pInputText id="hex" [ngModel]="hex" (ngModelChange)="hex = $event" pKeyFilter="hex" class="w-full" />
            </div>
            <div class="flex-auto">
                <label pLabel for="alphabetic" class="font-bold! block mb-2"> Alphabetic </label>
                <input pInputText id="alphabetic" [ngModel]="alphabetic" (ngModelChange)="alphabetic = $event" pKeyFilter="alpha" class="w-full" />
            </div>
            <div class="flex-auto">
                <label pLabel for="alphanumeric" class="font-bold! block mb-2"> Alphanumeric </label>
                <input pInputText id="alphanumeric" [ngModel]="alphanumeric" (ngModelChange)="alphanumeric = $event" pKeyFilter="alphanum" class="w-full" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, KeyFilterModule, LabelModule, FormsModule]
})
export class KeyFilterPresetsDemo {
    integer: string | undefined;

    number: string | undefined;

    money: string | undefined;

    hex: string | undefined;

    alphabetic: string | undefined;

    alphanumeric: string | undefined;
}
```

## Regex

In addition to the presets, a regular expression can be configured for customization.

```typescript
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel for="blockspace" class="text-sm font-bold! block mb-2"> Block Space </label>
                <input pInputText id="blockspace" [pKeyFilter]="blockSpace" class="w-full" />
            </div>
            <div class="flex-auto">
                <label pLabel for="block" class="text-sm font-bold! block! mb-2"> Block < > * ! </label>
                <input pInputText id="block" [pKeyFilter]="blockChars" class="w-full" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, KeyFilterModule, LabelModule]
})
export class KeyFilterRegexDemo {
    blockSpace: RegExp = /^[^\s]+$/;

    blockChars: RegExp = /^[^<>*!]+$/;
}
```

## Regexword

Validation against the whole input is available with the pValidateOnly option enabled so that the keys are allowed only when the resulting value matches the pattern.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div>
                <label pLabel for="numkeys" class="font-bold! block mb-2">Block Numeric (allow "+" only once at start)</label>
                <input pInputText id="numkeys" [(ngModel)]="text" [pKeyFilter]="blockNumeric" [pValidateOnly]="true" fluid />
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, KeyFilterModule, LabelModule, FormsModule]
})
export class KeyFilterRegexWordDemo {
    text: string | undefined;

    blockNumeric: RegExp = /^[+]?(\d{1,12})?$/;
}
```
