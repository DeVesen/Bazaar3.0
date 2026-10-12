# Angular ColorPicker Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| preview | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the preview input's DOM element. |
| panel | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the panel's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| colorSelector | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the color selector's DOM element. |
| colorBackground | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the color background's DOM element. |
| colorHandle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the color handle's DOM element. |
| hue | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the hue's DOM element. |
| hueHandle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the hue handle's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-colorpicker | Class name of the root element |
| p-colorpicker-preview | Class name of the preview element |
| p-colorpicker-panel | Class name of the panel element |
| p-colorpicker-color-selector | Class name of the color selector element |
| p-colorpicker-color-background | Class name of the color background element |
| p-colorpicker-color-handle | Class name of the color handle element |
| p-colorpicker-hue | Class name of the hue element |
| p-colorpicker-hue-handle | Class name of the hue handle element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| colorpicker.transition.duration | --p-colorpicker-transition-duration | Transition duration of root |
| colorpicker.preview.width | --p-colorpicker-preview-width | Width of preview |
| colorpicker.preview.height | --p-colorpicker-preview-height | Height of preview |
| colorpicker.preview.border.radius | --p-colorpicker-preview-border-radius | Border radius of preview |
| colorpicker.preview.focus.ring.width | --p-colorpicker-preview-focus-ring-width | Focus ring width of preview |
| colorpicker.preview.focus.ring.style | --p-colorpicker-preview-focus-ring-style | Focus ring style of preview |
| colorpicker.preview.focus.ring.color | --p-colorpicker-preview-focus-ring-color | Focus ring color of preview |
| colorpicker.preview.focus.ring.offset | --p-colorpicker-preview-focus-ring-offset | Focus ring offset of preview |
| colorpicker.preview.focus.ring.shadow | --p-colorpicker-preview-focus-ring-shadow | Focus ring shadow of preview |
| colorpicker.panel.shadow | --p-colorpicker-panel-shadow | Shadow of panel |
| colorpicker.panel.border.radius | --p-colorpicker-panel-border-radius | Border radius of panel |
| colorpicker.panel.background | --p-colorpicker-panel-background | Background of panel |
| colorpicker.panel.border.color | --p-colorpicker-panel-border-color | Border color of panel |
| colorpicker.handle.color | --p-colorpicker-handle-color | Color of handle |

---
