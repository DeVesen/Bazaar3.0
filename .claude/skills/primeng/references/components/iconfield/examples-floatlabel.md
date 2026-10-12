# Angular IconField Component — Floatlabel

## Floatlabel

FloatLabel visually integrates a label with its form element. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Search } from '@primeicons/angular/search';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <p-iconfield>
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText id="over_label" [(ngModel)]="value1" autocomplete="off" />
                </p-iconfield>
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <p-iconfield>
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText id="in_label" [(ngModel)]="value2" autocomplete="off" variant="filled" />
                </p-iconfield>
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <p-iconfield>
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText id="on_label" [(ngModel)]="value3" autocomplete="off" />
                </p-iconfield>
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, IconFieldModule, InputIconModule, InputTextModule, FormsModule, Search]
})
export class IconFieldFloatLabelDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
