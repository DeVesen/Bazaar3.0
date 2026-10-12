# Angular Dialog Component — Responsive

## Responsive

Dialog dimensions can be made responsive with breakpoint-based utility classes applied directly to the component.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="visible = true">New Event</button>
            <p-dialog [(visible)]="visible" [modal]="true" header="Create Event" styleClass="w-[90vw] md:w-[75vw] lg:w-[50vw]">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <label pLabel for="eventName" class="text-sm font-semibold">Event Name</label>
                        <input pInputText id="eventName" [(ngModel)]="eventName" placeholder="e.g. Team Standup" />
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-1 flex-1">
                            <label pLabel for="organizer" class="text-sm font-semibold">Organizer</label>
                            <input pInputText id="organizer" [(ngModel)]="organizer" placeholder="Name" />
                        </div>
                        <div class="flex flex-col gap-1 flex-1">
                            <label pLabel for="email" class="text-sm font-semibold">Email</label>
                            <input pInputText id="email" [(ngModel)]="email" placeholder="organizer@example.com" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label pLabel for="location" class="text-sm font-semibold">Location</label>
                        <input pInputText id="location" [(ngModel)]="location" placeholder="Add a location or video link" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label pLabel for="description" class="text-sm font-semibold">Description</label>
                        <input pInputText id="description" [(ngModel)]="description" placeholder="Event details" />
                    </div>
                    <div class="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                        <button type="button" pButton severity="secondary" (click)="visible = false">Cancel</button>
                        <button type="button" pButton (click)="visible = false">Create Event</button>
                    </div>
                </div>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, LabelModule, FormsModule]
})
export class DialogResponsiveDemo {
    visible: boolean = false;

    eventName: string = '';

    organizer: string = '';

    email: string = '';

    location: string = '';

    description: string = '';
}
```
