# Angular InputColor Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-inputcolor | Class name of the root element |
| p-inputcolor-area | Class name of the area element |
| p-inputcolor-area-background | Class name of the area background element |
| p-inputcolor-area-handle | Class name of the area handle element |
| p-inputcolor-slider | Class name of the slider element |
| p-inputcolor-slider-track | Class name of the slider track element |
| p-inputcolor-slider-handle | Class name of the slider handle element |
| p-inputcolor-swatch | Class name of the swatch element |
| p-inputcolor-swatch-background | Class name of the swatch background element |
| p-inputcolor-transparency-grid | Class name of the transparency grid element |
| p-inputcolor-input | Class name of the input element |
| p-inputcolor-eyedropper | Class name of the eye dropper element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| inputcolor.border.color | --p-inputcolor-border-color | Shared inset border color (area background, slider track, swatch background) |
| inputcolor.area.border.radius | --p-inputcolor-area-border-radius | Border radius of area |
| inputcolor.slider.border.radius | --p-inputcolor-slider-border-radius | Border radius of slider |
| inputcolor.slider.size | --p-inputcolor-slider-size | Size of slider (horizontal height / vertical width) |
| inputcolor.handle.size | --p-inputcolor-handle-size | Size of handle (area and slider) |
| inputcolor.handle.border.color | --p-inputcolor-handle-border-color | Border color of handle |
| inputcolor.handle.border.width | --p-inputcolor-handle-border-width | Border width of handle |
| inputcolor.handle.shadow | --p-inputcolor-handle-shadow | Shadow of handle |
| inputcolor.handle.transition.duration | --p-inputcolor-handle-transition-duration | Transition duration of handle |
| inputcolor.handle.focus.ring.border.width | --p-inputcolor-handle-focus-ring-border-width | Focus ring border width of handle |
| inputcolor.handle.focus.ring.border.color | --p-inputcolor-handle-focus-ring-border-color | Focus ring border color of handle |
| inputcolor.handle.focus.ring.outline.width | --p-inputcolor-handle-focus-ring-outline-width | Focus ring outline width of handle |
| inputcolor.handle.focus.ring.outline.color | --p-inputcolor-handle-focus-ring-outline-color | Focus ring outline color of handle |
| inputcolor.handle.focus.ring.outline.offset | --p-inputcolor-handle-focus-ring-outline-offset | Focus ring outline offset of handle |
| inputcolor.transparency.grid.color | --p-inputcolor-transparency-grid-color | Color of transparency grid (checker pattern) |
| inputcolor.transparency.grid.background | --p-inputcolor-transparency-grid-background | Background of transparency grid (checker base) |
| inputcolor.transparency.grid.tile.size | --p-inputcolor-transparency-grid-tile-size | Tile size of transparency grid |
| inputcolor.swatch.size | --p-inputcolor-swatch-size | Size of swatch |
| inputcolor.swatch.border.radius | --p-inputcolor-swatch-border-radius | Border radius of swatch |

---
