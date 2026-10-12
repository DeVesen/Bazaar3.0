# Angular TreeSelect Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| hiddenInputContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the hidden input container's DOM element. |
| hiddenInput | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the hidden input's DOM element. |
| labelContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the label container's DOM element. |
| label | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the label's DOM element. |
| chipItem | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the chip item's DOM element. |
| pcChip | ChipPassThrough | Used to pass attributes to the Chip component. |
| clearIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the clear icon's DOM element. |
| dropdown | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the dropdown's DOM element. |
| dropdownIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the dropdown icon's DOM element. |
| panel | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the panel's DOM element. |
| hiddenFirstFocusableEl | PassThroughOption<HTMLElement, I> | Used to pass attributes to the first hidden focusable element's DOM element. |
| treeContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the tree container's DOM element. |
| pcTree | TreePassThrough | Used to pass attributes to the Tree component. |
| hiddenLastFocusableEl | PassThroughOption<HTMLElement, I> | Used to pass attributes to the last hidden focusable element's DOM element. |
| pcOverlay | OverlayPassThrough | Used to pass attributes to the Overlay component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-treeselect | Class name of the root element |
| p-treeselect-label-container | Class name of the label container element |
| p-treeselect-label | Class name of the label element |
| p-treeselect-chip-item | Class name of the chip item element |
| p-treeselect-clear-icon | Class name of the clear icon element |
| p-treeselect-chip | Class name of the chip element |
| p-treeselect-dropdown | Class name of the dropdown element |
| p-treeselect-dropdown-icon | Class name of the dropdown icon element |
| p-treeselect-overlay | Class name of the panel element |
| p-treeselect-tree-container | Class name of the tree container element |
| p-treeselect-empty-message | Class name of the empty message element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| treeselect.background | --p-treeselect-background | Background of root |
| treeselect.disabled.background | --p-treeselect-disabled-background | Disabled background of root |
| treeselect.filled.background | --p-treeselect-filled-background | Filled background of root |
| treeselect.filled.hover.background | --p-treeselect-filled-hover-background | Filled hover background of root |
| treeselect.filled.focus.background | --p-treeselect-filled-focus-background | Filled focus background of root |
| treeselect.border.color | --p-treeselect-border-color | Border color of root |
| treeselect.hover.border.color | --p-treeselect-hover-border-color | Hover border color of root |
| treeselect.focus.border.color | --p-treeselect-focus-border-color | Focus border color of root |
| treeselect.invalid.border.color | --p-treeselect-invalid-border-color | Invalid border color of root |
| treeselect.color | --p-treeselect-color | Color of root |
| treeselect.disabled.color | --p-treeselect-disabled-color | Disabled color of root |
| treeselect.placeholder.color | --p-treeselect-placeholder-color | Placeholder color of root |
| treeselect.invalid.placeholder.color | --p-treeselect-invalid-placeholder-color | Invalid placeholder color of root |
| treeselect.shadow | --p-treeselect-shadow | Shadow of root |
| treeselect.padding.x | --p-treeselect-padding-x | Padding x of root |
| treeselect.padding.y | --p-treeselect-padding-y | Padding y of root |
| treeselect.border.radius | --p-treeselect-border-radius | Border radius of root |
| treeselect.focus.ring.width | --p-treeselect-focus-ring-width | Focus ring width of root |
| treeselect.focus.ring.style | --p-treeselect-focus-ring-style | Focus ring style of root |
| treeselect.focus.ring.color | --p-treeselect-focus-ring-color | Focus ring color of root |
| treeselect.focus.ring.offset | --p-treeselect-focus-ring-offset | Focus ring offset of root |
| treeselect.focus.ring.shadow | --p-treeselect-focus-ring-shadow | Focus ring shadow of root |
| treeselect.transition.duration | --p-treeselect-transition-duration | Transition duration of root |
| treeselect.sm.font.size | --p-treeselect-sm-font-size | Sm font size of root |
| treeselect.sm.padding.x | --p-treeselect-sm-padding-x | Sm padding x of root |
| treeselect.sm.padding.y | --p-treeselect-sm-padding-y | Sm padding y of root |
| treeselect.lg.font.size | --p-treeselect-lg-font-size | Lg font size of root |
| treeselect.lg.padding.x | --p-treeselect-lg-padding-x | Lg padding x of root |
| treeselect.lg.padding.y | --p-treeselect-lg-padding-y | Lg padding y of root |
| treeselect.font.weight | --p-treeselect-font-weight | Font weight of root |
| treeselect.font.size | --p-treeselect-font-size | Font size of root |
| treeselect.dropdown.width | --p-treeselect-dropdown-width | Width of dropdown |
| treeselect.dropdown.color | --p-treeselect-dropdown-color | Color of dropdown |
| treeselect.overlay.background | --p-treeselect-overlay-background | Background of overlay |
| treeselect.overlay.border.color | --p-treeselect-overlay-border-color | Border color of overlay |
| treeselect.overlay.border.radius | --p-treeselect-overlay-border-radius | Border radius of overlay |
| treeselect.overlay.color | --p-treeselect-overlay-color | Color of overlay |
| treeselect.overlay.shadow | --p-treeselect-overlay-shadow | Shadow of overlay |
| treeselect.tree.padding | --p-treeselect-tree-padding | Padding of tree |
| treeselect.clear.icon.color | --p-treeselect-clear-icon-color | Color of clear icon |
| treeselect.empty.message.padding | --p-treeselect-empty-message-padding | Padding of empty message |
| treeselect.chip.border.radius | --p-treeselect-chip-border-radius | Border radius of chip |

---
