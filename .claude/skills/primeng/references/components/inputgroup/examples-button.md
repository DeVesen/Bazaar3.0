# Angular InputGroup Component — Button

## Button

Buttons can be placed at either side of an input element.

```typescript
import { Component } from '@angular/core';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Search } from '@primeicons/angular/search';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="space-y-4 max-w-xs mx-auto">
            <p-inputgroup>
                <button type="button" pButton>Search</button>
                <input pInputText placeholder="Keyword" />
                <p-inputgroup-addon class="text-xs">8 results</p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <input pInputText placeholder="Keyword" />
                <p-inputgroup-addon>
                    <button type="button" pButton severity="secondary" variant="text" iconOnly>
                        <svg data-p-icon="search" />
                    </button>
                </p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>
                    <button type="button" pButton severity="secondary" iconOnly>
                        <svg data-p-icon="check" />
                    </button>
                </p-inputgroup-addon>
                <input pInputText placeholder="Vote" />
                <p-inputgroup-addon>
                    <button type="button" pButton severity="secondary" iconOnly>
                        <svg data-p-icon="times" />
                    </button>
                </p-inputgroup-addon>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [InputGroupModule, InputGroupAddonModule, ButtonModule, InputTextModule, Search, Check, Times]
})
export class InputGroupButtonDemo {}
```
