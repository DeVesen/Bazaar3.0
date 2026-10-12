# Angular Editor Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| toolbar | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the toolbar's DOM element. |
| formats | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the formats span's DOM element. |
| header | PassThroughOption<HTMLSelectElement, I> | Used to pass attributes to the header select's DOM element. |
| option | PassThroughOption<HTMLOptionElement, I> | Used to pass attributes to the option's DOM element. |
| bold | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the bold button's DOM element. |
| italic | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the italic button's DOM element. |
| underline | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the underline button's DOM element. |
| color | PassThroughOption<HTMLSelectElement, I> | Used to pass attributes to the color select's DOM element. |
| background | PassThroughOption<HTMLSelectElement, I> | Used to pass attributes to the background select's DOM element. |
| list | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the list button's DOM element. |
| select | PassThroughOption<HTMLSelectElement, I> | Used to pass attributes to the select's DOM element. |
| link | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the link button's DOM element. |
| image | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the image button's DOM element. |
| codeBlock | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the code block button's DOM element. |
| clean | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the clean button's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-editor | Class name of the root element |
| p-editor-toolbar | Class name of the toolbar element |
| p-editor-content | Class name of the content element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| editor.toolbar.background | --p-editor-toolbar-background | Background of toolbar |
| editor.toolbar.border.color | --p-editor-toolbar-border-color | Border color of toolbar |
| editor.toolbar.border.radius | --p-editor-toolbar-border-radius | Border radius of toolbar |
| editor.toolbar.item.color | --p-editor-toolbar-item-color | Color of toolbar item |
| editor.toolbar.item.hover.color | --p-editor-toolbar-item-hover-color | Hover color of toolbar item |
| editor.toolbar.item.active.color | --p-editor-toolbar-item-active-color | Active color of toolbar item |
| editor.overlay.background | --p-editor-overlay-background | Background of overlay |
| editor.overlay.border.color | --p-editor-overlay-border-color | Border color of overlay |
| editor.overlay.border.radius | --p-editor-overlay-border-radius | Border radius of overlay |
| editor.overlay.color | --p-editor-overlay-color | Color of overlay |
| editor.overlay.shadow | --p-editor-overlay-shadow | Shadow of overlay |
| editor.overlay.padding | --p-editor-overlay-padding | Padding of overlay |
| editor.overlay.option.focus.background | --p-editor-overlay-option-focus-background | Focus background of overlay option |
| editor.overlay.option.color | --p-editor-overlay-option-color | Color of overlay option |
| editor.overlay.option.focus.color | --p-editor-overlay-option-focus-color | Focus color of overlay option |
| editor.overlay.option.padding | --p-editor-overlay-option-padding | Padding of overlay option |
| editor.overlay.option.border.radius | --p-editor-overlay-option-border-radius | Border radius of overlay option |
| editor.content.background | --p-editor-content-background | Background of content |
| editor.content.border.color | --p-editor-content-border-color | Border color of content |
| editor.content.color | --p-editor-content-color | Color of content |
| editor.content.border.radius | --p-editor-content-border-radius | Border radius of content |

---
