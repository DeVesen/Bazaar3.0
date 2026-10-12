# Angular Gallery Component — API

Gallery is an image viewer with zoom, rotate, flip and download capabilities.

## Gallery

Gallery is the main container component for the Gallery.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, GalleryPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| activeIndex | number | 0 | The index of the active item. |
| fullscreen | boolean \| undefined | - | When defined, puts the fullscreen state in controlled mode; the value drives whether the gallery is fullscreen and changes are reported via onFullscreenChange instead of being handled internally. |
| closeOnEscape | boolean | true | Whether pressing the Escape key exits fullscreen mode. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onActiveIndexChange | event: GalleryActiveIndexChangeEvent | Callback fired when the gallery's active index changes. |
| onFullscreenChange | value: boolean | Callback fired when the fullscreen state should change (controlled mode). |
| onZoomChange | value: number | Callback fired when the active item's zoom scale changes. |
| onRotateChange | value: number | Callback fired when the active item's rotation changes. |
| onFlipChange | value: { x: number; y: number } | Callback fired when the active item's flip state changes. |

## Accessibility

Screen Reader Gallery uses semantic button elements for all interactive controls. The data-scope and data-part attributes identify each part of the gallery for assistive technologies. Use aria-label attributes on buttons to provide accessible names.
