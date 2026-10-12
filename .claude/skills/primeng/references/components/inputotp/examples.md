# Angular Otp Input Component — Beispiele

## Basic

A one-time password input split into individual digit fields.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpBasicDemo {
    value: any;
}
```

## Controlled

InputOtp can be used as a controlled component with ngModel .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-col items-center gap-6">
            <p-inputotp [(ngModel)]="value" />
            <div class="flex items-center gap-4">
                <span class="text-sm text-muted-color">
                    Value: <strong class="text-color">{{ value || '' }}</strong>
                </span>
                <button pButton severity="secondary" size="small" (click)="value = ''">Reset</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, ButtonModule, FormsModule]
})
export class InputOtpControlledDemo {
    value: any = '';
}
```

## Disabled

When disabled is present, the component becomes non-interactive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpDisabledDemo {
    value: any;
}
```

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value" variant="filled" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpFilledDemo {
    value: any;
}
```

## Integer Only

When integerOnly is present, only integers can be accepted as input.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value" [integerOnly]="true" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpIntegerOnlyDemo {
    value: any;
}
```

## Mask

Enable the mask option to hide the values in the input fields.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value" [mask]="true" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpMaskDemo {
    value: any;
}
```

## Sample

A sample UI implementation with templating and additional elements.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col items-center">
                <div class="font-bold text-xl mb-2">Authenticate Your Account</div>
                <p class="text-sm text-muted-color block mb-8">Please enter the code sent to your phone.</p>
                <p-inputotp [(ngModel)]="value" [length]="6">
                    <ng-template #input let-token let-events="events" let-index="index">
                        <input type="text" [maxLength]="1" (input)="events.input($event)" (keydown)="events.keydown($event)" [attr.value]="token" class="custom-otp-input" />
                        @if (index === 3) {
                            <div class="px-4">
                                <i class="pi pi-minus"></i>
                            </div>
                        }
                    </ng-template>
                </p-inputotp>
                <div class="flex justify-between mt-8 self-stretch">
                    <button type="button" pButton [link]="true" class="p-0">Resend Code</button>
                    <button type="button" pButton>Submit Code</button>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .p-inputotp {
                gap: 0;
            }

            .custom-otp-input {
                width: 48px;
                height: 48px;
                font-size: 24px;
                appearance: none;
                text-align: center;
                transition: all 0.2s;
                border-radius: 0;
                border: 1px solid var(--p-inputtext-border-color);
                background: transparent;
                outline-offset: -2px;
                outline-color: transparent;
                border-right: 0 none;
                transition: outline-color 0.3s;
                color: var(--p-inputtext-color);
            }

            .custom-otp-input:focus {
                outline: 2px solid var(--p-focus-ring-color);
            }

            .custom-otp-input:first-child,
            .custom-otp-input:nth-child(5) {
                border-top-left-radius: 12px;
                border-bottom-left-radius: 12px;
            }

            .custom-otp-input:nth-child(3),
            .custom-otp-input:last-child {
                border-top-right-radius: 12px;
                border-bottom-right-radius: 12px;
                border-right-width: 1px;
                border-right-style: solid;
                border-color: var(--p-inputtext-border-color);
            }
        `
    ],
    standalone: true,
    imports: [InputOtpModule, ButtonModule, FormsModule]
})
export class InputOtpSampleDemo {
    value: any;
}
```

## Sizes

InputOtp provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-inputotp [(ngModel)]="value1" size="small" />
            <p-inputotp [(ngModel)]="value2" />
            <p-inputotp [(ngModel)]="value3" size="large" />
        </div>
    `,
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpSizesDemo {
    value1: any;

    value2: any;

    value3: any;
}
```

## Template

Define a template with your own UI elements with bindings to the provided events and attributes to replace the default design.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputotp [(ngModel)]="value">
                <ng-template #input let-token let-events="events">
                    <input class="custom-otp-input" (keydown)="events.keydown($event)" (input)="events.input($event)" type="text" [attr.value]="token" [maxLength]="1" />
                </ng-template>
            </p-inputotp>
        </div>
    `,
    styles: [
        `
            .custom-otp-input {
                width: 40px;
                font-size: 36px;
                border: 0 none;
                appearance: none;
                text-align: center;
                transition: all 0.2s;
                background: transparent;
                border-bottom: 2px solid var(--p-inputtext-border-color);
                border-radius: 0px;
            }

            .custom-otp-input:focus {
                outline: 0 none;
                border-bottom-color: var(--p-primary-color);
            }
        `
    ],
    standalone: true,
    imports: [InputOtpModule, FormsModule]
})
export class InputOtpTemplateDemo {
    value: any;
}
```
