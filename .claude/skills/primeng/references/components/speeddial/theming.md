# Angular Speed Dial Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| pcButton | ButtonPassThrough | Used to pass attributes to the Button component. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| pcAction | ButtonPassThrough | Used to pass attributes to the action's Button component. |
| actionIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the action icon's DOM element. |
| mask | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the mask's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-speeddial | Class name of the root element |
| p-speeddial-button | Class name of the button element |
| p-speeddial-list | Class name of the list element |
| p-speeddial-item | Class name of the item element |
| p-speeddial-action | Class name of the action element |
| p-speeddial-action-icon | Class name of the action icon element |
| p-speeddial-mask | Class name of the mask element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| speeddial.gap | --p-speeddial-gap | Gap of root |
| speeddial.transition.duration | --p-speeddial-transition-duration | Transition duration of root |

---
