# Getting Started - PrimeNG

Setting up PrimeNG in an Angular CLI project.

## Download

PrimeNG is available for download on the npm registry .

```bash
# Using npm
npm install primeng @primeuix/themes

# Using yarn
yarn add primeng @primeuix/themes

# Using pnpm
pnpm add primeng @primeuix/themes
```

## Provider

Add providePrimeNG to the list of providers in your app.config.ts .

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
    providers: [
        providePrimeNG({
            /* Configuration */
        })
    ]
};
```

## Theme

Configure PrimeNG to use a theme like Aura.

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        providePrimeNG({
            theme: {
                preset: Aura
            }
        })
    ]
};
```

## Verify

Verify your setup by adding a component such as Button. Each component can be imported and registered individually so that you only include what you use for bundle optimization. Import path is available in the documentation of the corresponding component.

```typescript
import { Component } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

@Component({
    selector: 'button-demo',
    template: \
```
