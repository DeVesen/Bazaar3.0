# Angular Gallery Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-gallery | Class name of the root element |
| p-gallery-backdrop | Class name of the backdrop element |
| p-gallery-header | Class name of the header element |
| p-gallery-footer | Class name of the footer element |
| p-gallery-content | Class name of the content element |
| p-gallery-item | Class name of the item element |
| p-gallery-next | Class name of the next button element |
| p-gallery-prev | Class name of the prev button element |
| p-gallery-toolbar | Class name of the toolbar element |
| p-gallery-toolbar-item | Class name of the toolbar item element |
| p-gallery-action | Class name of the action element |
| p-gallery-thumbnail | Class name of the thumbnail element |
| p-gallery-thumbnail-content | Class name of the thumbnail content element |
| p-gallery-thumbnail-item | Class name of the thumbnail item element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| gallery.backdrop.background | --p-gallery-backdrop-background | Background of backdrop |
| gallery.header.padding | --p-gallery-header-padding | Padding of header |
| gallery.header.background | --p-gallery-header-background | Background of header |
| gallery.footer.padding | --p-gallery-footer-padding | Padding of footer |
| gallery.footer.background | --p-gallery-footer-background | Background of footer |
| gallery.footer.border.color | --p-gallery-footer-border-color | Border color of footer |
| gallery.item.transition.duration | --p-gallery-item-transition-duration | Transition duration of item (transform and opacity) |
| gallery.action.size | --p-gallery-action-size | Size of action (shared by action / next / prev) |
| gallery.action.border.radius | --p-gallery-action-border-radius | Border radius of action |
| gallery.action.color | --p-gallery-action-color | Color of action |
| gallery.action.hover.background | --p-gallery-action-hover-background | Hover background of action |
| gallery.action.hover.color | --p-gallery-action-hover-color | Hover color of action |
| gallery.action.disabled.opacity | --p-gallery-action-disabled-opacity | Disabled opacity of action |
| gallery.action.transition.duration | --p-gallery-action-transition-duration | Transition duration of action |
| gallery.action.icon.size | --p-gallery-action-icon-size | Icon size of action |
| gallery.navigation.background | --p-gallery-navigation-background | Background of navigation (next / prev) |
| gallery.navigation.size | --p-gallery-navigation-size | Size of navigation |
| gallery.navigation.border.radius | --p-gallery-navigation-border-radius | Border radius of navigation |
| gallery.navigation.color | --p-gallery-navigation-color | Color of navigation |
| gallery.navigation.hover.background | --p-gallery-navigation-hover-background | Hover background of navigation |
| gallery.navigation.hover.color | --p-gallery-navigation-hover-color | Hover color of navigation |
| gallery.navigation.offset | --p-gallery-navigation-offset | Edge offset of navigation |
| gallery.navigation.transition.duration | --p-gallery-navigation-transition-duration | Transition duration of navigation |
| gallery.navigation.icon.size | --p-gallery-navigation-icon-size | Icon size of navigation |
| gallery.thumbnail.size | --p-gallery-thumbnail-size | Size of thumbnail item |
| gallery.thumbnail.padding | --p-gallery-thumbnail-padding | Padding of thumbnail item |
| gallery.thumbnail.background | --p-gallery-thumbnail-background | Background of thumbnail item |
| gallery.thumbnail.border.radius | --p-gallery-thumbnail-border-radius | Border radius of thumbnail item |
| gallery.thumbnail.border.width | --p-gallery-thumbnail-border-width | Border width of thumbnail item (outline width) |
| gallery.thumbnail.hover.border.color | --p-gallery-thumbnail-hover-border-color | Hover border color of thumbnail item |
| gallery.thumbnail.active.border.color | --p-gallery-thumbnail-active-border-color | Active border color of thumbnail item |
| gallery.thumbnail.active.scale | --p-gallery-thumbnail-active-scale | Active scale of thumbnail item |
| gallery.thumbnail.transition.duration | --p-gallery-thumbnail-transition-duration | Transition duration of thumbnail item |
| gallery.thumbnail.content.padding | --p-gallery-thumbnail-content-padding | Padding of thumbnail content |

---
