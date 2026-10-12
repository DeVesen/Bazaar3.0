# Angular Splitter Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| panel | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the panel's DOM element. |
| gutter | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the gutter's DOM element. |
| gutterHandle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the gutter handle's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-splitter | Class name of the root element |
| p-splitter-panel | Class name of the panel element |
| p-splitter-gutter | Class name of the gutter element |
| p-splitter-gutter-handle | Class name of the handle element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| splitter.background | --p-splitter-background | Background of root |
| splitter.border.color | --p-splitter-border-color | Border color of root |
| splitter.color | --p-splitter-color | Color of root |
| splitter.transition.duration | --p-splitter-transition-duration | Transition duration of root |
| splitter.gutter.background | --p-splitter-gutter-background | Background of gutter |
| splitter.handle.size | --p-splitter-handle-size | Size of handle |
| splitter.handle.background | --p-splitter-handle-background | Background of handle |
| splitter.handle.border.radius | --p-splitter-handle-border-radius | Border radius of handle |
| splitter.handle.focus.ring.width | --p-splitter-handle-focus-ring-width | Focus ring width of handle |
| splitter.handle.focus.ring.style | --p-splitter-handle-focus-ring-style | Focus ring style of handle |
| splitter.handle.focus.ring.color | --p-splitter-handle-focus-ring-color | Focus ring color of handle |
| splitter.handle.focus.ring.offset | --p-splitter-handle-focus-ring-offset | Focus ring offset of handle |
| splitter.handle.focus.ring.shadow | --p-splitter-handle-focus-ring-shadow | Focus ring shadow of handle |

---
