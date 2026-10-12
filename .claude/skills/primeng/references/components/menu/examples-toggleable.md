# Angular Menu Component — Toggleable

## Toggleable

Nested submenus are toggleable by default. Use toggleable to override the default per item (e.g. force a top-level group to be toggleable, or keep a nested group always open) and expandedKeys to control open/closed state.

```typescript
import { Component, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menu [model]="items" styleClass="w-44" />
        </div>
    `,
    standalone: true,
    imports: [MenuModule]
})
export class MenuToggleableDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Document',
                items: [
                    { label: 'New file', icon: 'pi pi-file' },
                    { label: 'Open recent', icon: 'pi pi-file-edit' },
                    { label: 'Duplicate', icon: 'pi pi-copy' },
                    {
                        label: 'Import',
                        icon: 'pi pi-download',
                        items: [
                            { label: 'From file', icon: 'pi pi-file' },
                            { label: 'From cloud', icon: 'pi pi-cloud' },
                            { label: 'From URL', icon: 'pi pi-globe' }
                        ]
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-file-export',
                        items: [
                            { label: 'PDF' },
                            { label: 'Word' },
                            { label: 'Markdown' },
                            { label: 'HTML' },
                            {
                                label: 'More',
                                items: [{ label: 'EPUB' }, { label: 'RTF' }, { label: 'LaTeX' }, { label: 'Plain Text' }]
                            }
                        ]
                    },
                    {
                        label: 'Share',
                        icon: 'pi pi-share-alt',
                        items: [
                            { label: 'Send via email', icon: 'pi pi-send' },
                            { label: 'Copy link', icon: 'pi pi-link' },
                            { separator: true },
                            {
                                label: 'Social',
                                toggleable: false,
                                items: [
                                    { label: 'Twitter', icon: 'pi pi-twitter' },
                                    { label: 'Facebook', icon: 'pi pi-facebook' },
                                    { label: 'LinkedIn', icon: 'pi pi-linkedin' }
                                ]
                            }
                        ]
                    },
                    { label: 'Rename', icon: 'pi pi-pencil' }
                ]
            }
        ];
    }
}
```
