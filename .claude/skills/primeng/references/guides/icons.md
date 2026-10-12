# Angular Icon Library - PrimeNG

PrimeIcons is the default icon library of PrimeNG with over 250 premium icons developed by PrimeTek. PrimeIcons library is optional as PrimeNG components can use any icon with templating.

## Basic

Each icon is a standalone Angular component rendered as an inline SVG, displayed by importing it from &#64;primeicons/angular and using it with the data-p-icon attribute.

```typescript
import { Component } from '@angular/core';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';
import { Search } from '@primeicons/angular/search';
import { User } from '@primeicons/angular/user';

@Component({
    selector: 'icons-basic-demo',
    template: \
```

## Color

Icon color is defined with the color property which is inherited from the parent with currentColor by default.

## Download

&#64;primeicons/angular is available at npm, run the following command to download it to your project.

```bash
npm install @primeicons/angular
```

## Figma

PrimeIcons library is now available on Figma Community . By adding them as a library, you can easily use these icons in your designs.

## Import

Each icon is a standalone Angular component. Import them individually for optimal tree-shaking, or use the named exports from the package root, then add them to the imports array of your standalone component.

```typescript
// Tree-shakeable, per-icon imports (recommended)
import { Search } from '@primeicons/angular/search';
import { User } from '@primeicons/angular/user';

// Named imports from the package root
import { Search, User, Check } from '@primeicons/angular';
```

## List

Here is the full list of PrimeIcons. Click an icon to copy its import statement. More icons will be added periodically and you may also request new icons at the issue tracker.

## Programmatic

An icon can be rendered programmatically by binding its name to the pIcon attribute, so the displayed icon can be changed at runtime from a variable.

```typescript
import { Component, signal } from '@angular/core';
import { PIcon } from '@primeicons/angular/p-icon';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'icons-programmatic-demo',
    template: \
```

## Size

Size of an icon is controlled with the size property that accepts a number in pixels or any CSS length value.

## Spin

Use the spin property to apply a rotation animation to an icon. Alternatively, a spin animation utility such as animate-spin from Tailwind can also be used.

---
