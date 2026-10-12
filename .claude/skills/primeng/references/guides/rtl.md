# RTL Support

Right-to-left direction support of PrimeNG.

## Configuration

The PrimeNG components natively support Right-to-Left (RTL) text direction through a modern CSS implementation utilizing FlexBox and classes like *-inline-start and *-block-end . Consequently, no JavaScript configuration is necessary; setting the document's text direction to RTL is sufficient to enable this feature. The RTL setting can either be set using the dir attribute or with the direction style property.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="doc-section-description font-bold mb-4">With Markup</div>
        <div class="doc-section-description my-4 font-bold">With CSS</div>
    `,
    standalone: true,
    imports: []
})
export class GuidesRtlConfigurationDemo {
    markupCode: Code = {
        html: `<html dir="rtl">`
    };

    cssCode: Code = {
        scss: `html {
    direction: rtl
}`
    };
}
```

---
