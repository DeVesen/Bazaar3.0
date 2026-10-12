# Angular Menu Component — Group

## Group

Items are organized into labeled groups separated by a separator . Checkbox and radio selections are driven from the model by toggling an item's icon through its command .

```typescript
import { Component } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menu [model]="items" styleClass="w-60" />
        </div>
    `,
    standalone: true,
    imports: [MenuModule]
})
export class MenuGroupDemo {
    notifications: boolean = true;

    sound: boolean = false;

    marketing: boolean = false;

    autoUpdate: boolean = true;

    theme: string = 'light';

    language: string = 'en';

    get items(): MenuItem[] {
        return [
            {
                label: 'Notifications',
                items: [
                    { label: 'Enable notifications', icon: this.notifications ? 'pi pi-check' : 'pi pi-blank', command: () => (this.notifications = !this.notifications) },
                    { label: 'Play sound', icon: this.sound ? 'pi pi-check' : 'pi pi-blank', command: () => (this.sound = !this.sound) },
                    { label: 'Marketing emails', icon: this.marketing ? 'pi pi-check' : 'pi pi-blank', command: () => (this.marketing = !this.marketing) }
                ]
            },
            { separator: true },
            {
                label: 'System',
                items: [{ label: 'Auto-update apps', icon: this.autoUpdate ? 'pi pi-check' : 'pi pi-blank', command: () => (this.autoUpdate = !this.autoUpdate) }]
            },
            { separator: true },
            {
                label: 'Appearance',
                items: [
                    { label: 'Light', icon: this.theme === 'light' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.theme = 'light') },
                    { label: 'Dark', icon: this.theme === 'dark' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.theme = 'dark') },
                    { label: 'System', icon: this.theme === 'system' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.theme = 'system') }
                ]
            },
            { separator: true },
            {
                label: 'Language',
                items: [
                    { label: 'English', icon: this.language === 'en' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.language = 'en') },
                    { label: 'Türkçe', icon: this.language === 'tr' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.language = 'tr') },
                    { label: 'Deutsch', icon: this.language === 'de' ? 'pi pi-dot' : 'pi pi-blank', command: () => (this.language = 'de') }
                ]
            }
        ];
    }
}
```
