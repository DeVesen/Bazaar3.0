# Angular AutoComplete Component — Basic

## Basic

AutoComplete uses ngModel for two-way binding, requires a list of suggestions and a completeMethod to query for the results. The completeMethod gets the query text as event.query property and should update the suggestions with the search results. Use optionLabel to display a property of an object as the suggestion label.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

interface Command {
    label: string;
    shortcut: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete [(ngModel)]="selectedCommand" [suggestions]="filtere …(lange Zeile gekürzt)
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, FormsModule]
})
export class AutoCompleteBasicDemo {
    selectedCommand: Command | undefined;

    filteredCommands: Command[] = [];

    commands: Command[] = [
        { label: 'New File', shortcut: '⌘N' },
        { label: 'Open File', shortcut: '⌘O' },
        { label: 'Save', shortcut: '⌘S' },
        { label: 'Save As', shortcut: '⇧⌘S' },
        { label: 'Find', shortcut: '⌘F' },
        { label: 'Replace', shortcut: '⌘H' },
        { label: 'Go to Line', shortcut: '⌘G' },
        { label: 'Toggle Sidebar', shortcut: '⌘B' },
        { label: 'Split Editor', shortcut: '⌘\\' },
        { label: 'Close Tab', shortcut: '⌘W' }
    ];

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();

        this.filteredCommands = query ? this.commands.filter((cmd) => cmd.label.toLowerCase().includes(query)) : [...this.commands];
    }
}
```
