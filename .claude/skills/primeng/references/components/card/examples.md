# Angular Card Component — Beispiele

## Advanced

Use the header template to place an image, avatar or other content in the header.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { StarFill } from '@primeicons/angular/star-fill';
import { MapMarker } from '@primeicons/angular/map-marker';
import { Phone } from '@primeicons/angular/phone';
import { Globe } from '@primeicons/angular/globe';

@Component({
    template: `
        <div class="flex justify-center">
            <p-card class="max-w-sm w-full overflow-hidden" [pt]="{ body: { class: 'pt-16!' } }">
                <ng-template #header>
                    <div class="relative">
                        <img
                            class="w-full max-h-42 object-cover"
                            alt="user header"
                            src="https://images.unsplash.com/photo-1513649718256-1a7162666bad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        />
                        <p-avatar shape="circle" class="w-24! h-24! border-3 border-surface-0 dark:border-surface-900 absolute! -bottom-12! left-4!">
                            <img src="https://images.unsplash.com/photo-1722495178488-c8056c4ec2c0?q=80&w=2081&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                        </p-avatar>
                    </div>
                </ng-template>
                <ng-template #title>
                    <span class="font-bold text-xl">Sakura Fresh Market</span>
                </ng-template>
                <ng-template #subtitle>
                    <div class="flex items-center gap-2">
                        <p-tag severity="info" value="Daily" />
                        <p-tag severity="info" value="Premium" />
                    </div>
                </ng-template>
                <div class="space-y-4">
                    <p>Sakura Fresh Market is your go-to store for fresh local produce, Japanese snacks, and daily essentials — all in one place!</p>
                    <div class="flex items-center gap-2">
                        <svg data-p-icon="star-fill" class="text-yellow-500"></svg>
                        <span><b>4.6</b> (200+ reviews)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg data-p-icon="map-marker"></svg>
                        <span>Tokyo, Shibuya-ku</span>
                    </div>
                </div>
                <ng-template #footer>
                    <div class="flex items-center gap-2 mt-4">
                        <button type="button" pButton severity="secondary" [outlined]="true" class="flex-1">
                            <svg data-p-icon="phone"></svg>
                            Call Us
                        </button>
                        <button type="button" pButton class="flex-1">
                            <svg data-p-icon="globe"></svg>
                            Visit Site
                        </button>
                    </div>
                </ng-template>
            </p-card>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, CardModule, TagModule, ButtonModule, StarFill, MapMarker, Phone, Globe]
})
export class CardAdvancedDemo {}
```

## Basic

A container with a header, body, and footer for structured content.

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
    template: `
        <div class="flex justify-center">
            <p-card class="max-w-sm w-full" header="Starter Plan" subheader="For personal projects">
                <p class="m-0">Includes essential features, basic analytics and access to community support.</p>
                <ng-template #footer>
                    <span class="text-sm text-surface-500 dark:text-surface-400">Cancel anytime. No credit card required.</span>
                </ng-template>
            </p-card>
        </div>
    `,
    standalone: true,
    imports: [CardModule]
})
export class CardBasicDemo {}
```

## With Form

Card can be used as a form container with input fields and action buttons.

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <p-card class="max-w-sm w-full" header="Welcome back" subheader="Sign in with your email to continue.">
                <form class="space-y-6 mt-3">
                    <div class="flex flex-col gap-2">
                        <label pLabel for="email">Email</label>
                        <input pInputText id="email" type="email" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <label pLabel for="password" class="flex-1">Password</label>
                            <button type="button" pButton variant="link" class="p-0">Forgot password?</button>
                        </div>
                        <input pInputText id="password" type="password" />
                    </div>
                </form>
                <ng-template #footer>
                    <div class="flex flex-col gap-4">
                        <button type="button" pButton class="w-full">Login</button>
                        <button type="button" pButton severity="secondary" [outlined]="true" class="w-full">Login with Google</button>
                        <div class="mt-2 text-center text-surface-500 text-sm">
                            Don't have an account?
                            <button type="button" pButton variant="link" class="p-0">Sign up</button>
                        </div>
                    </div>
                </ng-template>
            </p-card>
        </div>
    `,
    standalone: true,
    imports: [CardModule, ButtonModule, InputTextModule, LabelModule]
})
export class CardWithFormDemo {}
```
