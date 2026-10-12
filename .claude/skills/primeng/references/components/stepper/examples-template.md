# Angular Stepper Component — Template

## Template

Stepper provides various templating options to customize the default UI design.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <p-stepper [(value)]="activeStep" class="basis-160 min-w-0">
                <p-step-list>
                    <p-step [value]="1" class="flex flex-row flex-auto gap-2">
                        <ng-template #content let-activateCallback="activateCallback" let-value="value">
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" (click)="activateCallback()">
                                <span
                                    class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center"
                                    [ngClass]="{
                                        'bg-primary text-primary-contrast border-primary': value <= activeStep,
                                        'border-surface': value > activeStep
                                    }"
                                >
                                    <i class="pi pi-user"></i>
                                </span>
                            </button>
                        </ng-template>
                    </p-step>
                    <p-step [value]="2" class="flex flex-row flex-auto gap-2">
                        <ng-template #content let-activateCallback="activateCallback" let-value="value">
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" (click)="activateCallback()">
                                <span
                                    class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center"
                                    [ngClass]="{
                                        'bg-primary text-primary-contrast border-primary': value <= activeStep,
                                        'border-surface': value > activeStep
                                    }"
                                >
                                    <i class="pi pi-star"></i>
                                </span>
                            </button>
                        </ng-template>
                    </p-step>
                    <p-step [value]="3" class="flex flex-row flex-auto gap-2">
                        <ng-template #content let-activateCallback="activateCallback" let-value="value">
                            <button class="bg-transparent border-0 inline-flex flex-col gap-2" (click)="activateCallback()">
                                <span
                                    class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center"
                                    [ngClass]="{
                                        'bg-primary text-primary-contrast border-primary': value <= activeStep,
                                        'border-surface': value > activeStep
                                    }"
                                >
                                    <i class="pi pi-id-card"></i>
                                </span>
                            </button>
                        </ng-template>
                    </p-step>
                </p-step-list>
                <p-step-panels>
                    <p-step-panel [value]="1">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 20rem">
                                <div class="text-center mt-4 mb-4 text-lg font-semibold">Create your account</div>
                                <div class="field">
                                    <input [(ngModel)]="name" pInputText id="input" type="text" placeholder="Name" fluid />
                                </div>
                                <div class="field">
                                    <input [(ngModel)]="email" pInputText id="email" type="email" placeholder="Email" fluid />
                                </div>
                                <div class="field">
                                    <p-password [(ngModel)]="password" placeholder="Password" fluid />
                                </div>
                            </div>
                            <div class="flex pt-5 justify-end">
                                <button type="button" pButton (click)="activateCallback(2)">Next <i class="pi pi-arrow-right"></i></button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                    <p-step-panel [value]="2">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
                                <div class="text-center mt-4 mb-4 text-lg font-semibold">Choose your interests</div>
                                <div class="flex flex-wrap justify-center gap-4">
                                    <p-togglebutton [(ngModel)]="option1" onLabel="Nature" offLabel="Nature" />
                                    <p-togglebutton [(ngModel)]="option2" onLabel="Art" offLabel="Art" />
                                    <!-- +8 gleichartige Zeilen -->
                                </div>
                            </div>
                            <div class="flex pt-5 justify-between">
                                <button type="button" pButton severity="secondary" (click)="activateCallback(1)"><i class="pi pi-arrow-left"></i> Back</button>
                                <button type="button" pButton (click)="activateCallback(3)">Next <i class="pi pi-arrow-right"></i></button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                    <p-step-panel [value]="3">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col items-center gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
                                <div class="text-center mt-4 mb-4 text-lg font-semibold">Account created successfully</div>
                                <div class="text-center">
                                    <img alt="logo" src="https://primefaces.org/cdn/primeng/images/stepper/content.svg" />
                                </div>
                            </div>
                            <div class="flex pt-5 justify-start">
                                <button type="button" pButton severity="secondary" (click)="activateCallback(2)"><i class="pi pi-arrow-left"></i> Back</button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                </p-step-panels>
            </p-stepper>
        </div>
    `,
    standalone: true,
    imports: [PasswordModule, StepperModule, ToggleButtonModule, ButtonModule, InputTextModule, FormsModule]
})
export class StepperTemplateDemo {
    activeStep: number = 1;

    name: string | undefined = null;

    email: string | undefined = null;

    password: string | undefined = null;

    option1: boolean | undefined = false;

    option2: boolean | undefined = false;

    option3: boolean | undefined = false;

    option4: boolean | undefined = false;

    option5: boolean | undefined = false;

    option6: boolean | undefined = false;

    option7: boolean | undefined = false;

    option8: boolean | undefined = false;

    option9: boolean | undefined = false;

    option10: boolean | undefined = false;
}
```
