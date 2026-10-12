# Angular Scroll Area Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| viewport | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the viewport's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| scrollbar | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the scrollbar's DOM element. |
| handle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the handle's DOM element. |
| corner | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the corner's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-scrollarea | Class name of the root element |
| p-scrollarea-viewport | Class name of the viewport element |
| p-scrollarea-content | Class name of the content element |
| p-scrollarea-scrollbar | Class name of the scrollbar element |
| p-scrollarea-handle | Class name of the handle element |
| p-scrollarea-corner | Class name of the corner element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| scrollarea.background | --p-scrollarea-background | Background of root |
| scrollarea.border.color | --p-scrollarea-border-color | Border color of root |
| scrollarea.border.radius | --p-scrollarea-border-radius | Border radius of root |
| scrollarea.focus.ring.width | --p-scrollarea-focus-ring-width | Focus ring width of root |
| scrollarea.focus.ring.style | --p-scrollarea-focus-ring-style | Focus ring style of root |
| scrollarea.focus.ring.color | --p-scrollarea-focus-ring-color | Focus ring color of root |
| scrollarea.focus.ring.offset | --p-scrollarea-focus-ring-offset | Focus ring offset of root |
| scrollarea.focus.ring.shadow | --p-scrollarea-focus-ring-shadow | Focus ring shadow of root |
| scrollarea.viewport.padding | --p-scrollarea-viewport-padding | Padding of viewport |
| scrollarea.scrollbar.background | --p-scrollarea-scrollbar-background | Background of scrollbar |
| scrollarea.scrollbar.margin | --p-scrollarea-scrollbar-margin | Margin of scrollbar |
| scrollarea.scrollbar.size | --p-scrollarea-scrollbar-size | Size of scrollbar (track thickness) |
| scrollarea.scrollbar.transition.duration | --p-scrollarea-scrollbar-transition-duration | Transition duration of scrollbar |
| scrollarea.handle.background | --p-scrollarea-handle-background | Background of handle |
| scrollarea.mask.fade.size | --p-scrollarea-mask-fade-size | Fade size of mask gradient |

---
