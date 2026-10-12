# Overlay API - PrimeNG — Beispiele

## Appendto

Overlay can be mounted into its location, body or DOM element instance using this option.

## Autozindex

The autoZIndex determines whether to automatically manage layering. Its default value is 'false'.

## Basezindex

The baseZIndex is base zIndex value to use in layering. Its default value is 0.

## Basic

Overlay is a container to display content in an overlay window. All the options mentioned above can be used as props for this component.

```typescript
import { Component } from '@angular/core';
import { OverlayModule } from 'primeng/overlay';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="toggle()">Show Overlay</button>
            <p-overlay [(visible)]="overlayVisible" [responsive]="{ breakpoint:  …(lange Zeile gekürzt)
        </div>
    `,
    standalone: true,
    imports: [OverlayModule, ButtonModule]
})
export class OverlayBasicDemo {
    overlayVisible: boolean = false;

    toggle() {
        this.overlayVisible = !this.overlayVisible;
    }
}
```

## Events

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <section class="py-6">
        </section>
    `,
    standalone: true,
    imports: []
})
export class OverlayEventsDemo {}
```

## Hideonescape

The hideOnEscape determines to hide the overlay when escape key pressed. Accepts boolean, default value is false .

## Mode

It has two valid values; overlay and modal . In overlay mode, a container element is opened like overlaypanel or dropdown's panel. In modal mode, the container element behaves like popup. This behaviour is similar to a dialog component.

## Responsive

It is the option used to determine in which mode it should appear according to the given media or breakpoint .

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <p class="doc-section-description">Valid values of the <i>direction</i> property would be;</p>
        <div class="card">
            <ul>
                <li>center (default)</li>
                <li>top</li>
                <li>top-start</li>
                <li>top-end</li>
                <li>bottom</li>
                <li>bottom-start</li>
                <li>bottom-end</li>
                <li>left</li>
                <li>left-start</li>
                <li>left-end</li>
                <li>right</li>
                <li>right-start</li>
                <li>right-end</li>
            </ul>
        </div>
    `,
    standalone: true,
    imports: []
})
export class OverlayResponsiveDemo {}
```

## Target

The target is used to detect the element that will be used to position the overlay. Valid values would be;

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="card">
            <ul>
                <li>&#64;prev (default)</li>
                <li>&#64;next</li>
                <li>&#64;parent</li>
                <li>&#64;grandparent</li>
                <li>Use <em>CSS selector</em></li>
                <li>Use <em>() =&gt; HTMLElement</em></li>
            </ul>
        </div>
    `,
    standalone: true,
    imports: []
})
export class OverlayTargetDemo {}
```

## Template

Content can be customized with the content template.

```typescript
import { Component } from '@angular/core';
import { OverlayModule } from 'primeng/overlay';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="toggle()">Show Overlay</button>
            <p-overlay [(visible)]="overlayVisible" [responsive]="{ breakpoint:  …(lange Zeile gekürzt)
                <ng-template #content let-option> Content - {{ option.mode }} </ng-template>
            </p-overlay>
        </div>
    `,
    standalone: true,
    imports: [OverlayModule, ButtonModule]
})
export class OverlayTemplateDemo {
    overlayVisible: boolean = false;

    toggle() {
        this.overlayVisible = !this.overlayVisible;
    }
}
```
