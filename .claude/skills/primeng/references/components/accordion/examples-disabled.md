# Angular Accordion Component — Disabled

## Disabled

Set disabled on an AccordionPanel to prevent user interaction with that panel.

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="w-full max-w-md space-y-8">
                <p-accordion>
                    <p-accordion-panel value="0" [disabled]="true">
                        <p-accordion-header>How do I reset my password?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">You can reset your password by clicking the "Forgot password?" link on the login page. We'll send a password reset link to your registered email address.</p>
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="1" [disabled]="true">
                        <p-accordion-header>Do you offer team accounts?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Yes. Our Team and Business plans are designed for collaboration. You can invite team members, assign roles, and manage permissions easily from your dashboard.</p>
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>
                <p-accordion>
                    <p-accordion-panel value="0">
                        <p-accordion-header>What happens if I exceed my usage limit?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">If you go over your plan limi …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="1" [disabled]="true">
                        <p-accordion-header>Is there a mobile app available?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Yes, we offer both iOS and Android apps so you can manage your account and stay connected on the go.</p>
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>
            </div>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule]
})
export class AccordionDisabledDemo {}
```
