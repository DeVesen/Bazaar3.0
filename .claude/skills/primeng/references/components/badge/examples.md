# Angular Badge Component — Beispiele

## Basic

A small overlay on another element to indicate a count or status.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';

@Component({
    template: `
        <div class="flex justify-center">
            <p-badge value="Badge" />
        </div>
    `,
    standalone: true,
    imports: [BadgeModule]
})
export class BadgeBasicDemo {}
```

## Button

Buttons have built-in support for badges to display a badge inline.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ButtonModule } from 'primeng/button';
import { Users } from '@primeicons/angular/users';
import { Bell } from '@primeicons/angular/bell';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4">
            <button type="button" pButton>Emails<p-badge value="8" severity="secondary" /></button>
            <button type="button" pButton variant="outlined"><svg data-p-icon="users"></svg>Messages<p-badge value="2" severity="contrast" /></button>
            <p-overlay-badge severity="info" styleClass="animate-pulse">
                <button type="button" pButton variant="outlined" iconOnly><svg data-p-icon="bell"></svg></button>
            </p-overlay-badge>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, OverlayBadgeModule, ButtonModule, Users, Bell]
})
export class BadgeButtonDemo {}
```

## Overlay

A badge can be added to any element by encapsulating the content with the OverlayBadge component.

```typescript
import { Component } from '@angular/core';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Bell } from '@primeicons/angular/bell';
import { Calendar } from '@primeicons/angular/calendar';
import { Envelope } from '@primeicons/angular/envelope';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-6">
            <p-overlaybadge value="2">
                <svg data-p-icon="bell" [size]="24"></svg>
            </p-overlaybadge>
            <p-overlaybadge value="4" severity="danger">
                <svg data-p-icon="calendar" [size]="24"></svg>
            </p-overlaybadge>
            <p-overlaybadge severity="danger">
                <svg data-p-icon="envelope" [size]="24"></svg>
            </p-overlaybadge>
        </div>
    `,
    standalone: true,
    imports: [OverlayBadgeModule, Bell, Calendar, Envelope]
})
export class BadgeOverlayDemo {}
```

## Severity

The severity property defines the visual style of a badge.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2">
            <p-badge value="Default" />
            <p-badge value="Secondary" severity="secondary" />
            <p-badge value="Success" severity="success" />
            <p-badge value="Info" severity="info" />
            <p-badge value="Warning" severity="warn" />
            <p-badge value="Danger" severity="danger" />
            <p-badge value="Contrast" severity="contrast" />
        </div>
    `,
    standalone: true,
    imports: [BadgeModule]
})
export class BadgeSeverityDemo {}
```

## Size

Use the badgeSize property to change the size of a badge.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-center gap-2">
            <p-badge value="Small" badgeSize="small" />
            <p-badge value="Default" />
            <p-badge value="Large" badgeSize="large" />
            <p-badge value="XLarge" badgeSize="xlarge" />
        </div>
    `,
    standalone: true,
    imports: [BadgeModule]
})
export class BadgeSizeDemo {}
```
