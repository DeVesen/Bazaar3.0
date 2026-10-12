# Angular Gallery Component — Advanced

## Advanced

Galleria can be extended further to implement complex requirements.

```typescript
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <p-galleria
            #galleria
            [value]="images()"
            [activeIndex]="activeIndex"
            [numVisible]="5"
            [showThumbnails]="showThumbnails"
            [showItemNavigators]="true"
            [showItemNavigatorsOnHover]="true"
            [circular]="true"
            [autoPlay]="isAutoPlay"
            [transitionInterval]="3000"
            [containerStyle]="{ 'max-width': '640px' }"
            [pt]="galleriaPT"
        >
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" [ngStyle]="{ width: !fullscreen ? '100%' : '', display: !fullscreen ? 'block' : '' }" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <div class="grid gap-4 justify-center">
                    <img [src]="item.thumbnailImageSrc" style="display: block" />
                </div>
            </ng-template>
            <ng-template #footer let-item>
                <div class="flex items-stretch gap-2 bg-surface-950 text-white h-10">
                    <button type="button" pButton (click)="onThumbnailButtonClic …(lange Zeile gekürzt)
                        <i class="pi pi-th-large"></i>
                    </button>
                    <button type="button" pButton (click)="toggleAutoSlide()" class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
                        <i [class]="slideButtonIcon()"></i>
                    </button>
                    @if (images()) {
                        <span class="flex items-center gap-4 ml-3">
                            <span class="text-xs">{{ activeIndex + 1 }}/{{ images().length }}</span>
                            <span class="font-bold text-xs">{{ images()[activeIndex].title }}</span>
                            <span class="text-xs">{{ images()[activeIndex].alt }}</span>
                        </span>
                    }
                    <button type="button" pButton (click)="toggleFullScreen()" c …(lange Zeile gekürzt)
                        <i [class]="fullScreenIcon()"></i>
                    </button>
                </div>
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule, ButtonModule],
    providers: [PhotoService]
})
export class GalleriaAdvancedDemo implements OnInit {
    private platformId = inject(PLATFORM_ID);

    private photoService = inject(PhotoService);

    images = signal<any[]>([]);

    showThumbnails: boolean = false;

    fullscreen: boolean = false;

    activeIndex: number = 0;

    isAutoPlay: boolean = true;

    onFullScreenListener: any;

    responsiveOptions: any[] = [
        {
            breakpoint: '1300px',
            numVisible: 4
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

    ngOnInit() {
        this.photoService.getImages().then((images) => {
            this.images.set(images);
        });
        this.bindDocumentListeners();
    }

    get galleriaPT() {
        return {
            root: {
                class: [{ 'flex flex-col': this.fullscreen }]
            },
            content: {
                class: ['relative', { 'flex-1 justify-center': this.fullscreen }]
            },
            thumbnails: 'absolute w-full left-0 bottom-0'
        };
    }

    onThumbnailButtonClick() {
        this.showThumbnails = !this.showThumbnails;
    }

    toggleAutoSlide() {
        this.isAutoPlay = !this.isAutoPlay;
    }

    toggleFullScreen() {
        if (this.fullscreen) {
            this.closePreviewFullScreen();
        } else {
            this.openPreviewFullScreen();
        }
    }

    openPreviewFullScreen() {
        let elem = this.galleria?.element.nativeElement.querySelector('.p-galleria');

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem['mozRequestFullScreen']) {
            /* Firefox */
            elem['mozRequestFullScreen']();
        } else if (elem['webkitRequestFullscreen']) {
            /* Chrome, Safari & Opera */
            elem['webkitRequestFullscreen']();
        } else if (elem['msRequestFullscreen']) {
            /* IE/Edge */
            elem['msRequestFullscreen']();
        }
    }

    onFullScreenChange() {
        this.fullscreen = !this.fullscreen;
    }

    closePreviewFullScreen() {
        if (isPlatformBrowser(this.platformId)) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document['mozCancelFullScreen']) {
                document['mozCancelFullScreen']();
            } else if (document['webkitExitFullscreen']) {
                document['webkitExitFullscreen']();
            } else if (document['msExitFullscreen']) {
                document['msExitFullscreen']();
            }
        }
    }

    bindDocumentListeners() {
        if (isPlatformBrowser(this.platformId)) {
            this.onFullScreenListener = this.onFullScreenChange.bind(this);
            document.addEventListener('fullscreenchange', this.onFullScreenListener);
            document.addEventListener('mozfullscreenchange', this.onFullScreenListener);
            document.addEventListener('webkitfullscreenchange', this.onFullScreenListener);
            document.addEventListener('msfullscreenchange', this.onFullScreenListener);
        }
    }

    unbindDocumentListeners() {
        if (isPlatformBrowser(this.platformId)) {
            document.removeEventListener('fullscreenchange', this.onFullScreenListener);
            document.removeEventListener('mozfullscreenchange', this.onFullScreenListener);
            document.removeEventListener('webkitfullscreenchange', this.onFullScreenListener);
            document.removeEventListener('msfullscreenchange', this.onFullScreenListener);
            this.onFullScreenListener = null;
        }
    }

    ngOnDestroy() {
        this.unbindDocumentListeners();
    }

    slideButtonIcon() {
        return this.isAutoPlay ? 'pi pi-pause' : 'pi pi-play';
    }

    fullScreenIcon() {
        return `pi ${this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'}`;
    }
}
```
