# Angular Slider Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| track | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the track's DOM element. |
| range | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the range's DOM element. |
| handle | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the handle's DOM element. |
| startHandler | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the start handler's DOM element. |
| endHandler | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the end handler's DOM element. |
| input | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the hidden input's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-slider | Class name of the root element |
| p-slider-track | Class name of the track element |
| p-slider-range | Class name of the range element |
| p-slider-handle | Class name of the handle element |
| p-slider-input | Class name of the hidden input element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| slider.transition.duration | --p-slider-transition-duration | Transition duration of root |
| slider.track.background | --p-slider-track-background | Background of track |
| slider.track.border.radius | --p-slider-track-border-radius | Border radius of track |
| slider.track.size | --p-slider-track-size | Size of track |
| slider.range.background | --p-slider-range-background | Background of range |
| slider.handle.width | --p-slider-handle-width | Width of handle |
| slider.handle.height | --p-slider-handle-height | Height of handle |
| slider.handle.border.radius | --p-slider-handle-border-radius | Border radius of handle |
| slider.handle.background | --p-slider-handle-background | Background of handle |
| slider.handle.hover.background | --p-slider-handle-hover-background | Hover background of handle |
| slider.handle.content.border.radius | --p-slider-handle-content-border-radius | Content border radius of handle |
| slider.handle.content.background | --p-slider-handle-content-background | Background of handle |
| slider.handle.content.hover.background | --p-slider-handle-content-hover-background | Content hover background of handle |
| slider.handle.content.width | --p-slider-handle-content-width | Content width of handle |
| slider.handle.content.height | --p-slider-handle-content-height | Content height of handle |
| slider.handle.content.shadow | --p-slider-handle-content-shadow | Content shadow of handle |
| slider.handle.focus.ring.width | --p-slider-handle-focus-ring-width | Focus ring width of handle |
| slider.handle.focus.ring.style | --p-slider-handle-focus-ring-style | Focus ring style of handle |
| slider.handle.focus.ring.color | --p-slider-handle-focus-ring-color | Focus ring color of handle |
| slider.handle.focus.ring.offset | --p-slider-handle-focus-ring-offset | Focus ring offset of handle |
| slider.handle.focus.ring.shadow | --p-slider-handle-focus-ring-shadow | Focus ring shadow of handle |

---
