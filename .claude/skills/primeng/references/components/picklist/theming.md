# Angular PickList Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| sourceControls | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the source controls' DOM element. |
| sourceListContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the source list container's DOM element. |
| transferControls | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the transfer controls' DOM element. |
| targetListContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the target list container's DOM element. |
| targetControls | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the target controls' DOM element. |
| pcSourceMoveUpButton | ButtonPassThrough | Used to pass attributes to the source move up Button component. |
| pcSourceMoveTopButton | ButtonPassThrough | Used to pass attributes to the source move top Button component. |
| pcSourceMoveDownButton | ButtonPassThrough | Used to pass attributes to the source move down Button component. |
| pcSourceMoveBottomButton | ButtonPassThrough | Used to pass attributes to the source move bottom Button component. |
| pcMoveToTargetButton | ButtonPassThrough | Used to pass attributes to the move to target Button component. |
| pcMoveAllToTargetButton | ButtonPassThrough | Used to pass attributes to the move all to target Button component. |
| pcMoveToSourceButton | ButtonPassThrough | Used to pass attributes to the move to source Button component. |
| pcMoveAllToSourceButton | ButtonPassThrough | Used to pass attributes to the move all to source Button component. |
| pcTargetMoveUpButton | ButtonPassThrough | Used to pass attributes to the target move up Button component. |
| pcTargetMoveTopButton | ButtonPassThrough | Used to pass attributes to the target move top Button component. |
| pcTargetMoveDownButton | ButtonPassThrough | Used to pass attributes to the target move down Button component. |
| pcTargetMoveBottomButton | ButtonPassThrough | Used to pass attributes to the target move bottom Button component. |
| pcListbox | ListBoxPassThrough | Used to pass attributes to the Listbox component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-picklist | Class name of the root element |
| p-picklist-source-controls | Class name of the source controls element |
| p-picklist-source-list-container | Class name of the source list container element |
| p-picklist-transfer-controls | Class name of the transfer controls element |
| p-picklist-target-list-container | Class name of the target list container element |
| p-picklist-target-controls | Class name of the target controls element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| picklist.gap | --p-picklist-gap | Gap of root |
| picklist.controls.gap | --p-picklist-controls-gap | Gap of controls |

---
