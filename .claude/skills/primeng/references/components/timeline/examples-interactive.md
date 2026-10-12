# Angular Timeline Component — Interactive

## Interactive

Build interactive step-based workflows with progress tracking and state management.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { Refresh } from '@primeicons/angular/refresh';
import { Check } from '@primeicons/angular/check';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { PIcon } from '@primeicons/angular/p-icon';

interface Step {
    id: number;
    label: string;
    icon: string;
}

@Component({
    template: `
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-semibold m-0">Onboarding Progress</h3>
                    <p class="text-surface-500 text-sm mt-1 mb-0">{{ completedSteps.length }} of {{ allSteps.length }} steps completed</p>
                </div>
                <button pButton [variant]="'outlined'" [size]="'small'" (click)="handleReset()">
                    <svg data-p-icon="refresh" />
                    Reset
                </button>
            </div>
            <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                <div class="bg-primary rounded-full h-2 transition-all duration-500" [style.width.%]="(completedSteps.length / allSteps.length) * 100"></div>
            </div>
            <p-timeline [value]="allSteps" [pt]="{ eventContent: { class: 'min-w-0' } }">
                <ng-template #marker let-step>
                    <button
                        type="button"
                        [class]="
                            'w-10 h-10 rounded-full flex items-center justify-center border-none transition-all duration-300 ' +
                            (getStepStatus(step.id) === 'completed'
                                ? 'bg-green-500 text-white cursor-default'
                                : getStepStatus(step.id) === 'current'
                                  ? 'bg-primary text-primary-contrast cursor-pointer hover:scale-110 animate-pulse'
                                  : 'bg-surface-200 dark:bg-surface-700 text-surface-400 cursor-not-allowed')
                        "
                        (click)="handleComplete(step.id)"
                        [disabled]="getStepStatus(step.id) !== 'current'"
                    >
                        @if (getStepStatus(step.id) === 'completed') {
                            <svg data-p-icon="check" />
                        } @else {
                            <svg [pIcon]="step.icon" />
                        }
                    </button>
                </ng-template>
                <ng-template #content let-step>
                    <div [class]="'p-3 rounded-lg transition-all duration-300 '  …(lange Zeile gekürzt)
                        <p [class]="'m-0 font-medium ' + (getStepStatus(step.id) …(lange Zeile gekürzt)
                            {{ step.label }}
                        </p>
                        @if (getStepStatus(step.id) === 'current') {
                            <p class="text-xs text-surface-500 mt-1 mb-0">Click the marker to complete</p>
                        }
                    </div>
                </ng-template>
            </p-timeline>
            @if (completedSteps.length === allSteps.length) {
                <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex flex-col items-center gap-2">
                    <svg data-p-icon="check-circle" size="24 " class="text-green-500" />
                    <div class="font-semibold text-green-700 dark:text-green-400">Onboarding Complete!</div>
                    <span class="text-sm text-green-600 dark:text-green-500 leading-none">You've completed all the steps.</span>
                </div>
            }
        </div>
    `,
    standalone: true,
    imports: [TimelineModule, ButtonModule, Refresh, Check, CheckCircle, PIcon],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineInteractiveDemo {
    allSteps: Step[] = [
        { id: 1, label: 'Account Created', icon: 'user-plus' },
        { id: 2, label: 'Email Verified', icon: 'envelope' },
        { id: 3, label: 'Profile Completed', icon: 'id-card' },
        { id: 4, label: 'First Purchase', icon: 'shopping-bag' },
        { id: 5, label: 'Review Posted', icon: 'star' }
    ];

    completedSteps: number[] = [1];

    currentStep: number = 2;

    handleComplete(stepId: number): void {
        if (stepId === this.currentStep) {
            this.completedSteps = [...this.completedSteps, stepId];
            this.currentStep++;
        }
    }

    handleReset(): void {
        this.completedSteps = [1];
        this.currentStep = 2;
    }

    getStepStatus(stepId: number): 'completed' | 'current' | 'pending' {
        if (this.completedSteps.includes(stepId)) {
            return 'completed';
        }

        if (stepId === this.currentStep) {
            return 'current';
        }

        return 'pending';
    }
}
```
