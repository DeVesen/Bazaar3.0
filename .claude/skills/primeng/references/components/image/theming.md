# Angular Image Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the root's DOM element. |
| image | PassThroughOption<HTMLImageElement, I> | Used to pass attributes to the image's DOM element. |
| previewMask | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the preview mask button's DOM element. |
| previewIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the preview icon's DOM element. |
| mask | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the mask's DOM element. |
| toolbar | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the toolbar's DOM element. |
| rotateRightButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the rotate right button's DOM element. |
| rotateLeftButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the rotate left button's DOM element. |
| zoomOutButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the zoom out button's DOM element. |
| zoomInButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the zoom in button's DOM element. |
| closeButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the close button's DOM element. |
| original | PassThroughOption<HTMLImageElement, I> | Used to pass attributes to the original/preview image's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |
| maskMotion | MotionOptions | Used to pass motion options for the mask animation. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-image | Class name of the root element |
| p-image-preview-mask | Class name of the preview mask element |
| p-image-preview-icon | Class name of the preview icon element |
| p-image-mask | Class name of the mask element |
| p-image-toolbar | Class name of the toolbar element |
| p-image-rotate-right-button | Class name of the rotate right button element |
| p-image-rotate-left-button | Class name of the rotate left button element |
| p-image-zoom-out-button | Class name of the zoom out button element |
| p-image-zoom-in-button | Class name of the zoom in button element |
| p-image-close-button | Class name of the close button element |
| p-image-original | Class name of the original element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| image.transition.duration | --p-image-transition-duration | Transition duration of root |
| image.preview.icon.size | --p-image-preview-icon-size | Icon size of preview |
| image.preview.mask.background | --p-image-preview-mask-background | Mask background of preview |
| image.preview.mask.color | --p-image-preview-mask-color | Mask color of preview |
| image.toolbar.position.left | --p-image-toolbar-position-left | Position left of toolbar |
| image.toolbar.position.right | --p-image-toolbar-position-right | Position right of toolbar |
| image.toolbar.position.top | --p-image-toolbar-position-top | Position top of toolbar |
| image.toolbar.position.bottom | --p-image-toolbar-position-bottom | Position bottom of toolbar |
| image.toolbar.blur | --p-image-toolbar-blur | Blur of toolbar |
| image.toolbar.background | --p-image-toolbar-background | Background of toolbar |
| image.toolbar.border.color | --p-image-toolbar-border-color | Border color of toolbar |
| image.toolbar.border.width | --p-image-toolbar-border-width | Border width of toolbar |
| image.toolbar.border.radius | --p-image-toolbar-border-radius | Border radius of toolbar |
| image.toolbar.padding | --p-image-toolbar-padding | Padding of toolbar |
| image.toolbar.gap | --p-image-toolbar-gap | Gap of toolbar |
| image.action.hover.background | --p-image-action-hover-background | Hover background of action |
| image.action.color | --p-image-action-color | Color of action |
| image.action.hover.color | --p-image-action-hover-color | Hover color of action |
| image.action.size | --p-image-action-size | Size of action |
| image.action.icon.size | --p-image-action-icon-size | Icon size of action |
| image.action.border.radius | --p-image-action-border-radius | Border radius of action |
| image.action.focus.ring.width | --p-image-action-focus-ring-width | Focus ring width of action |
| image.action.focus.ring.style | --p-image-action-focus-ring-style | Focus ring style of action |
| image.action.focus.ring.color | --p-image-action-focus-ring-color | Focus ring color of action |
| image.action.focus.ring.offset | --p-image-action-focus-ring-offset | Focus ring offset of action |
| image.action.focus.ring.shadow | --p-image-action-focus-ring-shadow | Focus ring shadow of action |

---
