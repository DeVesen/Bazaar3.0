# Angular OrderList Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| controls | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the controls container's DOM element. |
| pcMoveUpButton | ButtonPassThrough | Used to pass attributes to the move up button's DOM element. |
| pcMoveTopButton | ButtonPassThrough | Used to pass attributes to the move top button's DOM element. |
| pcMoveDownButton | ButtonPassThrough | Used to pass attributes to the move down button's DOM element. |
| pcMoveBottomButton | ButtonPassThrough | Used to pass attributes to the move bottom button's DOM element. |
| pcListbox | ListBoxPassThrough | Used to pass attributes to the Listbox component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-orderlist | Class name of the root element |
| p-orderlist-controls | Class name of the controls element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| orderlist.gap | --p-orderlist-gap | Gap of root |
| orderlist.controls.gap | --p-orderlist-controls-gap | Gap of controls |

---
