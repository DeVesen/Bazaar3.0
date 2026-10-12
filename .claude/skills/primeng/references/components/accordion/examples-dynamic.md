# Angular Accordion Component — Dynamic

## Dynamic

AccordionPanel can be generated dynamically using the standard &#64;for block.

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
    template: `
        <p-accordion [value]="['0']">
            @for (tab of tabs; track tab.title) {
                <p-accordion-panel [value]="tab.value">
                    <p-accordion-header>{{ tab.title }}</p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">{{ tab.content }}</p>
                    </p-accordion-content>
                </p-accordion-panel>
            }
        </p-accordion>
    `,
    standalone: true,
    imports: [AccordionModule]
})
export class AccordionDynamicDemo {
    tabs = [
        { title: 'Title 1', content: 'Content 1', value: '0' },
        { title: 'Title 2', content: 'Content 2', value: '1' },
        { title: 'Title 3', content: 'Content 3', value: '2' }
    ];
}
```
