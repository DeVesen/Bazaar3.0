# Angular Dialog Component — Long Content

## Long Content

When content exceeds the available space, the content area scrolls while the header and footer stay fixed.

```typescript
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="visible = true">Inside Scroll</button>
            <p-dialog [(visible)]="visible" [modal]="true" header="Terms of Service" [style]="{ width: '40rem' }">
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-2">
                        <p-tag value="Updated" severity="info" />
                        <span class="text-sm text-surface-500 dark:text-surface-400">Last revised: January 1, 2026</span>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">1. Acceptance of Terms</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">2. Use License</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            Permission is granted to temporarily download one co …(lange Zeile gekürzt)
                            license you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained on this service.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">3. Disclaimer</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            The materials on this service are provided on an 'as …(lange Zeile gekürzt)
                            conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">4. Limitations</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            In no event shall we or our suppliers be liable for  …(lange Zeile gekürzt)
                            materials on this service, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">5. Privacy Policy</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            Your privacy is important to us. Our Privacy Policy  …(lange Zeile gekürzt)
                            in accordance with our Privacy Policy. We are committed to ensuring that your information is secure and handled responsibly.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">6. User Accounts</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            When you create an account with us, you must provide …(lange Zeile gekürzt)
                            your account on our service. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">7. Intellectual Property</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            The service and its original content, features, and  …(lange Zeile gekürzt)
                            domestic and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the company.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">8. Termination</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            We may terminate or suspend your account immediately …(lange Zeile gekürzt)
                            will immediately cease. If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">9. Indemnification</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            You agree to defend, indemnify, and hold harmless th …(lange Zeile gekürzt)
                            obligations, losses, liabilities, costs or debt, and …(lange Zeile gekürzt)
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">10. Governing Law</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            These terms and conditions are governed by and const …(lange Zeile gekürzt)
                            shall be governed by the laws without regard to its conflict of law provisions.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold mt-0 mb-2">11. Changes to Terms</h3>
                        <p class="text-sm leading-relaxed mt-0 mb-0 text-surface-600 dark:text-surface-300">
                            We reserve the right, at our sole discretion, to mod …(lange Zeile gekürzt)
                            constitutes a material change will be determined at  …(lange Zeile gekürzt)
                        </p>
                    </div>
                </div>
                <ng-template #footer>
                    <button type="button" pButton severity="secondary" (click)="visible = false">Decline</button>
                    <button type="button" pButton (click)="visible = false">Accept</button>
                </ng-template>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, TagModule, ButtonModule]
})
export class DialogLongContentDemo {
    visible: boolean = false;
}
```
