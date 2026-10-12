# Angular Dock Component — Advanced

## Advanced

A mock desktop UI implemented with various components in addition to Dock.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { GalleryModule } from 'primeng/gallery';
import { MenubarModule } from 'primeng/menubar';
import { TerminalModule } from 'primeng/terminal';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { GalleryActiveIndexChangeEvent } from 'primeng/types/gallery';
import { NodeService } from '@/service/nodeservice';
import { PhotoService } from '@/service/photoservice';
import { MenuItem, MessageService } from 'primeng/api';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';
import { Replay } from '@primeicons/angular/replay';
import { Refresh } from '@primeicons/angular/refresh';
import { SearchPlus } from '@primeicons/angular/search-plus';
import { SearchMinus } from '@primeicons/angular/search-minus';
import { ArrowsH } from '@primeicons/angular/arrows-h';
import { ArrowsV } from '@primeicons/angular/arrows-v';
import { Download } from '@primeicons/angular/download';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="dock-demo">
            <p-menubar [model]="menubarItems">
                <ng-template #start>
                    <i class="pi pi-apple px-2"></i>
                </ng-template>
                <ng-template #end>
                    <i class="pi pi-video px-2"></i>
                    <i class="pi pi-wifi px-2"></i>
                    <i class="pi pi-volume-up px-2"></i>
                    <span class="px-2 text-sm">Fri 13:07</span>
                    <i class="pi pi-search px-2"></i>
                    <i class="pi pi-bars px-2"></i>
                </ng-template>
            </p-menubar>
            <div class="dock-window">
                <p-dock [model]="dockItems" position="bottom">
                    <ng-template #item let-item>
                        <a [pTooltip]="item.label" tooltipPosition="top" class="p-dock-item-link">
                            <img [alt]="item.label" [src]="item.icon" style="width: 100%" />
                        </a>
                    </ng-template>
                </p-dock>
                <p-toast position="top-center" key="tc" />
                <p-dialog [(visible)]="displayFinder" [breakpoints]="{ '960px': '50vw' }" [style]="{ width: '30vw', height: '18rem' }" [draggable]="false" [resizable]="false" header="Finder">
                    <p-tree [value]="nodes" />
                </p-dialog>
                <p-dialog [maximizable]="true" [(visible)]="displayTerminal" [breakpoints]="{ '960px': '50vw' }" [style]="{ width: '30vw' }" [draggable]="false" [resizable]="false" header="Terminal">
                    <p-terminal welcomeMessage="Welcome to PrimeNG (cmd: 'date', 'greet {0}', 'random')" prompt="primeng $" />
                </p-dialog>
                @if (displayGallery()) {
                    <div class="w-full h-dvh top-0 left-0 fixed! z-100000 opacity-100 transition-opacity duration-200">
                        <p-gallery [(activeIndex)]="activeIndex" (onActiveIndexChange)="onActiveIndexChange($event)">
                            <p-gallery-backdrop></p-gallery-backdrop>
                            <button pGalleryPrev>
                                <svg data-p-icon="chevron-left"></svg>
                            </button>
                            <button pGalleryNext>
                                <svg data-p-icon="chevron-right"></svg>
                            </button>
                            <p-gallery-header class="justify-end gap-0.5">
                                <button pGalleryRotateLeft>
                                    <svg data-p-icon="replay"></svg>
                                </button>
                                <button pGalleryRotateRight>
                                    <svg data-p-icon="refresh"></svg>
                                </button>
                                <button pGalleryZoomIn>
                                    <svg data-p-icon="search-plus"></svg>
                                </button>
                                <button pGalleryZoomOut>
                                    <svg data-p-icon="search-minus"></svg>
                                </button>
                                <button pGalleryFlipX>
                                    <svg data-p-icon="arrows-h"></svg>
                                </button>
                                <button pGalleryFlipY>
                                    <svg data-p-icon="arrows-v"></svg>
                                </button>
                                <button pGalleryDownload>
                                    <svg data-p-icon="download"></svg>
                                </button>
                                <button class="p-gallery-action" (click)="closeGallery()">
                                    <svg data-p-icon="times"></svg>
                                </button>
                            </p-gallery-header>
                            <p-gallery-content>
                                @for (image of images; track image.itemImageSrc) {
                                    <p-gallery-item>
                                        <img [src]="image.itemImageSrc" [alt]="image.alt" />
                                    </p-gallery-item>
                                }
                            </p-gallery-content>
                            <p-gallery-footer>
                                <p-gallery-thumbnail>
                                    <p-gallery-thumbnail-content>
                                        @for (image of images; track image.itemImageSrc; let i = $index) {
                                            <p-gallery-thumbnail-item [index]="i">
                                                <img [attr.draggable]="false" [src]="image.thumbnailImageSrc" class="h-full w-full object-cover" />
                                            </p-gallery-thumbnail-item>
                                        }
                                    </p-gallery-thumbnail-content>
                                </p-gallery-thumbnail>
                            </p-gallery-footer>
                        </p-gallery>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                .dock-demo > .dock-window {
                    width: 100%;
                    height: 450px;
                    position: relative;
                    background-image: url('https://primefaces.org/cdn/primevue/images/dock/window.jpg');
                    background-repeat: no-repeat;
                    background-size: cover;
                }

                .dock-demo .p-menubar {
                    padding: 0;
                    border-radius: 0;
                }
            }
        `
    ],
    standalone: true,
    imports: [DialogModule, DockModule, GalleryModule, MenubarModule, TerminalMo …(lange Zeile gekürzt)
    providers: [NodeService, PhotoService, MessageService]
})
export class DockAdvancedDemo implements OnInit {
    private photoService = inject(PhotoService);

    private nodeService = inject(NodeService);

    private messageService = inject(MessageService);

    private terminalService = inject(TerminalService);

    displayTerminal: boolean | undefined;

    displayFinder: boolean | undefined;

    displayGallery = signal(false);

    activeIndex: number = 0;

    dockItems: MenuItem[] | undefined;

    menubarItems: any[] | undefined;

    images: any[] = [];

    nodes: any[] | undefined;

    subscription: Subscription | undefined;

    ngOnInit() {
        this.dockItems = [
            {
                label: 'Finder',
                tooltipOptions: {
                    tooltipLabel: 'Finder',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg',
                command: () => {
                    this.displayFinder = true;
                }
            },
            {
                label: 'Terminal',
                tooltipOptions: {
                    tooltipLabel: 'Terminal',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/terminal.svg',
                command: () => {
                    this.displayTerminal = true;
                }
            },
            {
                label: 'App Store',
                tooltipOptions: {
                    tooltipLabel: 'App Store',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/appstore.svg',
                url: 'https://www.apple.com/app-store/'
            },
            {
                label: 'Safari',
                tooltipOptions: {
                    tooltipLabel: 'Safari',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/safari.svg'
            },
            {
                label: 'Photos',
                tooltipOptions: {
                    tooltipLabel: 'Photos',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/photos.svg',
                command: () => {
                    this.activeIndex = 0;
                    this.displayGallery.set(true);
                }
            },
            {
                label: 'GitHub',
                tooltipOptions: {
                    tooltipLabel: 'GitHub',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/github.svg',
                url: 'https://github.com/primefaces/primeng'
            },
            {
                label: 'Trash',
                tooltipOptions: {
                    tooltipLabel: 'Trash',
                    tooltipPosition: 'top',
                    positionTop: -15,
                    positionLeft: 15,
                    showDelay: 1000
                },
                icon: 'https://primefaces.org/cdn/primeng/images/dock/trash.png',
                command: () => {
                    this.messageService.add({ severity: 'info', summary: 'Trash is empty', key: 'tc' });
                }
            }
        ];
        this.menubarItems = [
            {
                label: 'Finder',
                styleClass: 'menubar-root'
            },
            {
                label: 'File',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-fw pi-plus',
                        items: [
                            {
                                label: 'Bookmark',
                                icon: 'pi pi-fw pi-bookmark'
                            },
                            {
                                label: 'Video',
                                icon: 'pi pi-fw pi-video'
                            }
                        ]
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-fw pi-trash'
                    },
                    {
                        separator: true
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-fw pi-external-link'
                    }
                ]
            },
            {
                label: 'Edit',
                items: [
                    {
                        label: 'Left',
                        icon: 'pi pi-fw pi-align-left'
                    },
                    {
                        label: 'Right',
                        icon: 'pi pi-fw pi-align-right'
                    },
                    {
                        label: 'Center',
                        icon: 'pi pi-fw pi-align-center'
                    },
                    {
                        label: 'Justify',
                        icon: 'pi pi-fw pi-align-justify'
                    }
                ]
            },
            {
                label: 'Users',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-fw pi-user-plus'
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-fw pi-user-minus'
                    },
                    {
                        label: 'Search',
                        icon: 'pi pi-fw pi-users',
                        items: [
                            {
                                label: 'Filter',
                                icon: 'pi pi-fw pi-filter',
                                items: [
                                    {
                                        label: 'Print',
                                        icon: 'pi pi-fw pi-print'
                                    }
                                ]
                            },
                            {
                                icon: 'pi pi-fw pi-bars',
                                label: 'List'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Events',
                items: [
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            {
                                label: 'Save',
                                icon: 'pi pi-fw pi-calendar-plus'
                            },
                            {
                                label: 'Delete',
                                icon: 'pi pi-fw pi-calendar-minus'
                            }
                        ]
                    },
                    {
                        label: 'Archieve',
                        icon: 'pi pi-fw pi-calendar-times',
                        items: [
                            {
                                label: 'Remove',
                                icon: 'pi pi-fw pi-calendar-minus'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Quit'
            }
        ];
        this.subscription = this.terminalService.commandHandler.subscribe((command) => this.commandHandler(command));
        this.photoService.getImages().then((data) => (this.images = data));
        this.nodeService.getFiles().then((data) => (this.nodes = data));
    }

    closeGallery() {
        this.displayGallery.set(false);
    }

    onActiveIndexChange(event: GalleryActiveIndexChangeEvent) {
        this.activeIndex = event.value;
    }

    commandHandler(text: any) {
        let response;
        let argsIndex = text.indexOf(' ');
        let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

        switch (command) {
            case 'date':
                response = 'Today is ' + new Date().toDateString();
                break;

            case 'greet':
                response = 'Hola ' + text.substring(argsIndex + 1) + '!';
                break;

            case 'random':
                response = Math.floor(Math.random() * 100);
                break;

            default:
                response = 'Unknown command: ' + command;
                break;
        }

        if (response) {
            this.terminalService.sendResponse(response as string);
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
```
