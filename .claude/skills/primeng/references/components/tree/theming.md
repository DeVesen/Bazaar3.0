# Angular Tree Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| mask | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the loading mask's DOM element. |
| loadingIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the loading icon's DOM element. |
| pcFilterContainer | IconFieldPassThrough | Used to pass attributes to the filter container's DOM element. |
| pcFilterIconContainer | InputIconPassThrough | Used to pass attributes to the filter icon container's DOM element. |
| pcFilterInput | InputTextPassThrough | Used to pass attributes to the filter input's DOM element. |
| filterIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the filter icon's DOM element. |
| pcScroller | VirtualScrollerPassThrough | Used to pass attributes to the Scroller component. |
| wrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the wrapper's DOM element. |
| rootChildren | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root children's DOM element. |
| node | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the node's DOM element. |
| dropPoint | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the drop point's DOM element. |
| nodeContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the node content's DOM element. |
| nodeToggleButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the node toggle button's DOM element. |
| nodeTogglerIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the node toggle icon's DOM element. |
| pcNodeCheckbox | CheckboxPassThrough | Used to pass attributes to the node checkbox's DOM element. |
| nodeIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the node icon's DOM element. |
| nodeLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the node label's DOM element. |
| nodeChildren | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the node children's DOM element. |
| emptyMessage | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the empty message's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-tree | Class name of the root element |
| p-tree-mask | Class name of the mask element |
| p-tree-loading-icon | Class name of the loading icon element |
| p-tree-filter-input | Class name of the filter input element |
| p-tree-root | Class name of the wrapper element |
| p-tree-root-children | Class name of the root children element |
| p-tree-node | Class name of the node element |
| p-tree-node-content | Class name of the node content element |
| p-tree-node-toggle-button | Class name of the node toggle button element |
| p-tree-node-toggle-icon | Class name of the node toggle icon element |
| p-tree-node-checkbox | Class name of the node checkbox element |
| p-tree-node-icon | Class name of the node icon element |
| p-tree-node-label | Class name of the node label element |
| p-tree-node-children | Class name of the node children element |
| p-tree-empty-message | Class name of the empty message element |
| p-tree-node-droppoint | Class name of the drop point element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| tree.background | --p-tree-background | Background of root |
| tree.color | --p-tree-color | Color of root |
| tree.padding | --p-tree-padding | Padding of root |
| tree.gap | --p-tree-gap | Gap of root |
| tree.indent | --p-tree-indent | Indent of root |
| tree.transition.duration | --p-tree-transition-duration | Transition duration of root |
| tree.node.padding | --p-tree-node-padding | Padding of node |
| tree.node.border.radius | --p-tree-node-border-radius | Border radius of node |
| tree.node.hover.background | --p-tree-node-hover-background | Hover background of node |
| tree.node.selected.background | --p-tree-node-selected-background | Selected background of node |
| tree.node.color | --p-tree-node-color | Color of node |
| tree.node.hover.color | --p-tree-node-hover-color | Hover color of node |
| tree.node.selected.color | --p-tree-node-selected-color | Selected color of node |
| tree.node.focus.ring.width | --p-tree-node-focus-ring-width | Focus ring width of node |
| tree.node.focus.ring.style | --p-tree-node-focus-ring-style | Focus ring style of node |
| tree.node.focus.ring.color | --p-tree-node-focus-ring-color | Focus ring color of node |
| tree.node.focus.ring.offset | --p-tree-node-focus-ring-offset | Focus ring offset of node |
| tree.node.focus.ring.shadow | --p-tree-node-focus-ring-shadow | Focus ring shadow of node |
| tree.node.gap | --p-tree-node-gap | Gap of node |
| tree.node.icon.color | --p-tree-node-icon-color | Color of node icon |
| tree.node.icon.hover.color | --p-tree-node-icon-hover-color | Hover color of node icon |
| tree.node.icon.selected.color | --p-tree-node-icon-selected-color | Selected color of node icon |
| tree.node.label.font.weight | --p-tree-node-label-font-weight | Font weight of node label |
| tree.node.label.font.size | --p-tree-node-label-font-size | Font size of node label |
| tree.node.label.selected.font.weight | --p-tree-node-label-selected-font-weight | Font weight of a selected node label |
| tree.node.toggle.button.border.radius | --p-tree-node-toggle-button-border-radius | Border radius of node toggle button |
| tree.node.toggle.button.size | --p-tree-node-toggle-button-size | Size of node toggle button |
| tree.node.toggle.button.hover.background | --p-tree-node-toggle-button-hover-background | Hover background of node toggle button |
| tree.node.toggle.button.selected.hover.background | --p-tree-node-toggle-button-selected-hover-background | Selected hover background of node toggle button |
| tree.node.toggle.button.color | --p-tree-node-toggle-button-color | Color of node toggle button |
| tree.node.toggle.button.hover.color | --p-tree-node-toggle-button-hover-color | Hover color of node toggle button |
| tree.node.toggle.button.selected.hover.color | --p-tree-node-toggle-button-selected-hover-color | Selected hover color of node toggle button |
| tree.node.toggle.button.focus.ring.width | --p-tree-node-toggle-button-focus-ring-width | Focus ring width of node toggle button |
| tree.node.toggle.button.focus.ring.style | --p-tree-node-toggle-button-focus-ring-style | Focus ring style of node toggle button |
| tree.node.toggle.button.focus.ring.color | --p-tree-node-toggle-button-focus-ring-color | Focus ring color of node toggle button |
| tree.node.toggle.button.focus.ring.offset | --p-tree-node-toggle-button-focus-ring-offset | Focus ring offset of node toggle button |
| tree.node.toggle.button.focus.ring.shadow | --p-tree-node-toggle-button-focus-ring-shadow | Focus ring shadow of node toggle button |
| tree.loading.icon.size | --p-tree-loading-icon-size | Size of loading icon |
| tree.filter.margin | --p-tree-filter-margin | Margin of filter |

---
