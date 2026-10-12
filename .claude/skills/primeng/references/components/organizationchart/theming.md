# Angular Organization Chart Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| subtree | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the subtree's DOM element. |
| tree | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the tree's DOM element. |
| node | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the node's DOM element. |
| nodeContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the node content's DOM element. |
| label | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the node label's DOM element. |
| pcCheckbox | CheckboxPassThrough | Used to pass attributes to the Checkbox component in  `checkbox`  selection mode. |
| collapseButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the collapse button's DOM element. |
| collapseButtonIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the collapse button icon's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-organizationchart | Class name of the root element |
| p-organizationchart-subtree | Class name of the subtree element |
| p-organizationchart-tree | Class name of the tree element |
| p-organizationchart-node | Class name of the node element |
| p-organizationchart-node-content | Class name of the node content element |
| p-organizationchart-node-label | Class name of the node label element |
| p-organizationchart-node-toggle-button | Class name of the collapse button element |
| p-organizationchart-node-toggle-button-icon | Class name of the collapse button icon element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| organizationchart.gutter | --p-organizationchart-gutter | Gutter of root |
| organizationchart.transition.duration | --p-organizationchart-transition-duration | Transition duration of root |
| organizationchart.node.background | --p-organizationchart-node-background | Background of node |
| organizationchart.node.hover.background | --p-organizationchart-node-hover-background | Hover background of node |
| organizationchart.node.selected.background | --p-organizationchart-node-selected-background | Selected background of node |
| organizationchart.node.border.color | --p-organizationchart-node-border-color | Border color of node |
| organizationchart.node.color | --p-organizationchart-node-color | Color of node |
| organizationchart.node.selected.color | --p-organizationchart-node-selected-color | Selected color of node |
| organizationchart.node.hover.color | --p-organizationchart-node-hover-color | Hover color of node |
| organizationchart.node.padding | --p-organizationchart-node-padding | Padding of node |
| organizationchart.node.toggleable.padding | --p-organizationchart-node-toggleable-padding | Toggleable padding of node |
| organizationchart.node.border.radius | --p-organizationchart-node-border-radius | Border radius of node |
| organizationchart.node.font.size | --p-organizationchart-node-font-size | Font size of node |
| organizationchart.node.font.weight | --p-organizationchart-node-font-weight | Font weight of node |
| organizationchart.node.focus.ring.width | --p-organizationchart-node-focus-ring-width | Focus ring width of node |
| organizationchart.node.focus.ring.style | --p-organizationchart-node-focus-ring-style | Focus ring style of node |
| organizationchart.node.focus.ring.color | --p-organizationchart-node-focus-ring-color | Focus ring color of node |
| organizationchart.node.focus.ring.offset | --p-organizationchart-node-focus-ring-offset | Focus ring offset of node |
| organizationchart.node.focus.ring.shadow | --p-organizationchart-node-focus-ring-shadow | Focus ring shadow of node |
| organizationchart.node.toggle.button.background | --p-organizationchart-node-toggle-button-background | Background of node toggle button |
| organizationchart.node.toggle.button.hover.background | --p-organizationchart-node-toggle-button-hover-background | Hover background of node toggle button |
| organizationchart.node.toggle.button.border.color | --p-organizationchart-node-toggle-button-border-color | Border color of node toggle button |
| organizationchart.node.toggle.button.color | --p-organizationchart-node-toggle-button-color | Color of node toggle button |
| organizationchart.node.toggle.button.hover.color | --p-organizationchart-node-toggle-button-hover-color | Hover color of node toggle button |
| organizationchart.node.toggle.button.size | --p-organizationchart-node-toggle-button-size | Size of node toggle button |
| organizationchart.node.toggle.button.border.radius | --p-organizationchart-node-toggle-button-border-radius | Border radius of node toggle button |
| organizationchart.node.toggle.button.focus.ring.width | --p-organizationchart-node-toggle-button-focus-ring-width | Focus ring width of node toggle button |
| organizationchart.node.toggle.button.focus.ring.style | --p-organizationchart-node-toggle-button-focus-ring-style | Focus ring style of node toggle button |
| organizationchart.node.toggle.button.focus.ring.color | --p-organizationchart-node-toggle-button-focus-ring-color | Focus ring color of node toggle button |
| organizationchart.node.toggle.button.focus.ring.offset | --p-organizationchart-node-toggle-button-focus-ring-offset | Focus ring offset of node toggle button |
| organizationchart.node.toggle.button.focus.ring.shadow | --p-organizationchart-node-toggle-button-focus-ring-shadow | Focus ring shadow of node toggle button |
| organizationchart.node.toggle.button.icon.size | --p-organizationchart-node-toggle-button-icon-size | Icon size of node toggle button |
| organizationchart.connector.color | --p-organizationchart-connector-color | Color of connector |
| organizationchart.connector.border.radius | --p-organizationchart-connector-border-radius | Border radius of connector |
| organizationchart.connector.height | --p-organizationchart-connector-height | Height of connector |

---
