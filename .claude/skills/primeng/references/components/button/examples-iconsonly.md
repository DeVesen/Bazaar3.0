# Angular Button Component — Iconsonly

## Iconsonly

Set the iconOnly input to render the button as a square icon button without a label slot.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Check } from '@primeicons/angular/check';
import { Bookmark } from '@primeicons/angular/bookmark';
import { Search } from '@primeicons/angular/search';
import { User } from '@primeicons/angular/user';
import { Bell } from '@primeicons/angular/bell';
import { Heart } from '@primeicons/angular/heart';
import { Times } from '@primeicons/angular/times';
import { Star } from '@primeicons/angular/star';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4 mb-6">
            <button pButton iconOnly aria-label="Filter"><svg data-p-icon="check"></svg></button>
            <button pButton iconOnly severity="secondary" aria-label="Bookmark"><svg data-p-icon="bookmark"></svg></button>
            <!-- +6 gleichartige Zeilen -->
        </div>
        <div class="flex justify-center flex-wrap gap-4 mb-6">
            <button pButton iconOnly rounded aria-label="Filter"><svg data-p-icon="check"></svg></button>
            <button pButton iconOnly rounded severity="secondary" aria-label="Bookmark"><svg data-p-icon="bookmark"></svg></button>
            <!-- +6 gleichartige Zeilen -->
        </div>
        <div class="flex justify-center flex-wrap gap-4 mb-6">
            <button pButton iconOnly rounded variant="outlined" aria-label="Filter"><svg data-p-icon="check"></svg></button>
            <button pButton iconOnly rounded variant="outlined" severity="secondary" aria-label="Bookmark"><svg data-p-icon="bookmark"></svg></button>
            <!-- +6 gleichartige Zeilen -->
        </div>
        <div class="flex justify-center flex-wrap gap-4 mb-6">
            <button pButton iconOnly rounded raised aria-label="Filter"><svg data-p-icon="check"></svg></button>
            <button pButton iconOnly rounded raised severity="secondary" aria-label="Bookmark"><svg data-p-icon="bookmark"></svg></button>
            <!-- +6 gleichartige Zeilen -->
        </div>
        <div class="flex justify-center flex-wrap gap-4">
            <button pButton iconOnly rounded variant="text" aria-label="Filter"><svg data-p-icon="check"></svg></button>
            <button pButton iconOnly rounded variant="text" severity="secondary" aria-label="Bookmark"><svg data-p-icon="bookmark"></svg></button>
            <!-- +6 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, Check, Bookmark, Search, User, Bell, Heart, Times, Star]
})
export class ButtonIconsOnlyDemo {}
```
