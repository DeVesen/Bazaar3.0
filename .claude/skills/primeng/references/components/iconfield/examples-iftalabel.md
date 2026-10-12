# Angular IconField Component — Iftalabel

## Iftalabel

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Envelope } from '@primeicons/angular/envelope';
import { Check } from '@primeicons/angular/check';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <p-iconfield>
                    <p-inputicon>
                        <svg data-p-icon="envelope" />
                    </p-inputicon>
                    <input pInputText id="email" [(ngModel)]="value" autocomplete="off" variant="filled" />
                    <p-inputicon>
                        <svg data-p-icon="check" />
                    </p-inputicon>
                </p-iconfield>
                <label for="email">Email</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, IftaLabelModule, InputIconModule, InputTextModule, FormsModule, Envelope, Check]
})
export class IconFieldIftaLabelDemo {
    value: string | undefined;
}
```
