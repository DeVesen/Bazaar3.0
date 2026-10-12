# Angular Terminal Component — Beispiele

## Basic

An interactive terminal that accepts and responds to text commands.

```typescript
import { Component, inject } from '@angular/core';
import { TerminalModule } from 'primeng/terminal';

@Component({
    template: `
        <p-terminal welcomeMessage='Welcome to PrimeNG Terminal. Type "help" for available commands.' prompt="$" />
    `,
    standalone: true,
    imports: [TerminalModule]
})
export class TerminalBasicDemo {
    private terminalService = inject(TerminalService);

    private subscription: Subscription;

    constructor() {
        this.subscription = this.terminalService.commandHandler.subscribe((text) => {
            const argsIndex = text.indexOf(' ');
            const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;
            let response: string;
            switch (command) {
                case 'help':
                    response = 'Available commands:\n  date    - Display current date and time\n  greet   - Get a personalized greeting\n  random  - Generate a random number\n  clear   - Clear the terminal';
                    break;
                case 'date':
                    response = new Date().toLocaleString();
                    break;
                case 'greet': {
                    const name = text.substring(argsIndex + 1).trim() || 'World';
                    response = `Hello, ${name}!`;
                    break;
                }
                case 'random':
                    response = `Your random number: ${Math.floor(Math.random() * 100)}`;
                    break;
                default:
                    response = `Command not found: ${command}. Type "help" for available commands.`;
            }
            this.terminalService.sendResponse(response);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
```

## File System

An interactive file browser demonstrating navigation commands like ls , cd , cat , and pwd .

```typescript
import { Component, inject } from '@angular/core';
import { TerminalModule } from 'primeng/terminal';

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    content?: string;
}

@Component({
    template: `
        <p-terminal welcomeMessage='File System Browser - Type "help" for available commands.' [prompt]="prompt" />
    `,
    standalone: true,
    imports: [TerminalModule]
})
export class TerminalFilesystemDemo {
    private terminalService = inject(TerminalService);

    private subscription: Subscription;

    currentPath: string[] = ['~'];

    constructor() {
        this.subscription = this.terminalService.commandHandler.subscribe((text) => {
            const parts = text.trim().split(/\s+/);
            const command = parts[0];
            const arg = parts.slice(1).join(' ');
            const folder = this.getCurrentFolder();
            let response: string;
            switch (command) {
                case 'ls': {
                    const items = folder.children || [];
                    response = items.length === 0 ? '(empty directory)' : items.map((item) => (item.type === 'folder' ? `${item.name}/` : item.name)).join('  ');
                    break;
                }
                case 'cd': {
                    if (!arg || arg === '~') {
                        this.currentPath = ['~'];
                        return;
                    }
                    if (arg === '..') {
                        if (this.currentPath.length > 1) {
                            this.currentPath = this.currentPath.slice(0, -1);
                        }
                        return;
                    }
                    const target = folder.children?.find((c) => c.name === arg && c.type === 'folder');
                    if (target) {
                        this.currentPath = [...this.currentPath, arg];
                        return;
                    }
                    response = `cd: ${arg}: No such directory`;
                    break;
                }
                case 'cat': {
                    if (!arg) {
                        response = 'Usage: cat [filename]';
                        break;
                    }
                    const file = folder.children?.find((c) => c.name === arg && c.type === 'file');
                    response = file ? file.content || '' : `cat: ${arg}: No such file`;
                    break;
                }
                case 'pwd':
                    response = this.currentPath.join('/').replace('~/', '~/');
                    break;
                case 'help':
                    response = 'ls          List directory contents\ncd [dir]    Change directory\ncat [file]  Display file contents\npwd         Print working directory\nclear       Clear terminal';
                    break;
                default:
                    response = `${command}: command not found. Type "help" for available commands.`;
            }
            this.terminalService.sendResponse(response!);
        });
    }

    get prompt(): string {
        return this.currentPath.join('/').replace('~/', '~/') + ' $';
    }

    private getCurrentFolder(): FileNode {
        let current = fileSystem;

        for (let i = 1; i < this.currentPath.length; i++) {
            const child = current.children?.find((c) => c.name === this.currentPath[i]);

            if (child && child.type === 'folder') {
                current = child;
            }
        }

        return current;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
```
