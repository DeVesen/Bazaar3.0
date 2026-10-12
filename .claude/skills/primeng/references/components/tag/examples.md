# Angular Tag Component — Beispiele

## Basic

A small label for categorizing or marking items.

```typescript
import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-tag severity="contrast" value="Highlighted" />
        </div>
    `,
    standalone: true,
    imports: [TagModule]
})
export class TagBasicDemo {}
```

## Icon

Place the icon left or right of the label.

```typescript
import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { User } from '@primeicons/angular/user';
import { Check } from '@primeicons/angular/check';
import { Search } from '@primeicons/angular/search';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Times } from '@primeicons/angular/times';
import { Cog } from '@primeicons/angular/cog';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2">
            <p-tag>
                <svg data-p-icon="user" />
                Primary
            </p-tag>
            <p-tag severity="secondary">
                <svg data-p-icon="user" />
                Secondary
            </p-tag>
            <p-tag severity="success">
                <svg data-p-icon="check" />
                Success
            </p-tag>
            <p-tag severity="info">
                <svg data-p-icon="search" />
                Info
            </p-tag>
            <p-tag severity="warn">
                <svg data-p-icon="exclamation-triangle" />
                Warn
            </p-tag>
            <p-tag severity="danger">
                <svg data-p-icon="times" />
                Danger
            </p-tag>
            <p-tag severity="contrast">
                <svg data-p-icon="cog" />
                Contrast
            </p-tag>
        </div>
    `,
    standalone: true,
    imports: [TagModule, User, Check, Search, ExclamationTriangle, Times, Cog]
})
export class TagIconDemo {}
```

## Pill

Enabling rounded , displays a tag as a pill.

```typescript
import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2">
            <p-tag value="Primary" [rounded]="true" />
            <p-tag severity="secondary" value="Secondary" [rounded]="true" />
            <p-tag severity="success" value="Success" [rounded]="true" />
            <p-tag severity="info" value="Info" [rounded]="true" />
            <p-tag severity="warn" value="Warn" [rounded]="true" />
            <p-tag severity="danger" value="Danger" [rounded]="true" />
            <p-tag severity="contrast" value="Contrast" [rounded]="true" />
        </div>
    `,
    standalone: true,
    imports: [TagModule]
})
export class TagPillDemo {}
```

## Severity

Severity defines the color of the tag, possible values are success , info , warn and danger in addition to the default theme color.

```typescript
import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2">
            <p-tag value="Primary" />
            <p-tag severity="secondary" value="Secondary" />
            <p-tag severity="success" value="Success" />
            <p-tag severity="info" value="Info" />
            <p-tag severity="warn" value="Warn" />
            <p-tag severity="danger" value="Danger" />
            <p-tag severity="contrast" value="Contrast" />
        </div>
    `,
    standalone: true,
    imports: [TagModule]
})
export class TagSeverityDemo {}
```

## Template

Children of the component are passed as the content for templating.

```typescript
import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Country } from '@/domain/customer';

@Component({
    template: `
        <div class="flex justify-center">
            <p-tag class="flex items-center gap-2 px-3" [style]="{ border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }">
                <img alt="Country" src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" class="flag flag-it" style="width: 18px" />
                <span class="text-base">Italy</span>
            </p-tag>
        </div>
    `,
    standalone: true,
    imports: [TagModule]
})
export class TagTemplateDemo {}
```
