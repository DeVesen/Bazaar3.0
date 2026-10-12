# Angular ConfirmPopup Component — Templates

## Templates

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="doc-tablewrapper">
            <table class="doc-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Parameters</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>accepticon</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>rejecticon</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    standalone: true,
    imports: []
})
export class ConfirmPopupTemplatesDemo {}
```
