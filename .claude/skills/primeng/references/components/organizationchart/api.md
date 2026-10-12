# Angular Organization Chart Component — API

OrganizationChart visualizes hierarchical organization data.

## Organization Chart

OrganizationChart visualizes hierarchical organization data.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, OrganizationChartPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | OrgChartNode<any>[] \| undefined | - | An array of nested OrgChartNodes. |
| selectionMode | OrganizationChartSelectionMode \| null \| undefined | - | Defines the selection mode. |
| collapsible | boolean | false | Whether the nodes can be expanded or toggled. |
| selectable | boolean | true | Whether the nodes can be selected when a  `selectionMode`  is defined. Can be overridden per node with  `OrgChartNode.selectable` . |
| gap | number \| [number, number] | - | Defines the gap between nodes. Can be a single number or a tuple [gapX, gapY]. |
| selectionKeys | OrganizationChartNodeKeys \| null | - | A map of node keys whose values are  `true`  for the selected nodes. Two-way bindable. When omitted, it is seeded from each node's  `selectedByDefault`  flag. |
| collapsedKeys | OrganizationChartNodeKeys \| null | - | A map of node keys whose values are  `true`  for the collapsed nodes. Two-way bindable. When omitted, it is seeded from each node's  `collapsedByDefault`  flag. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onNodeSelect | event: OrganizationChartNodeSelectEvent | Callback to invoke when a node is selected. |
| onNodeUnselect | event: OrganizationChartNodeUnSelectEvent | Callback to invoke when a node is unselected. |
| onNodeExpand | event: OrganizationChartNodeExpandEvent | Callback to invoke when a node is expanded. |
| onNodeCollapse | event: OrganizationChartNodeCollapseEvent | Callback to invoke when a node is collapsed. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| togglericon | TemplateRef<any> \| undefined | Custom toggler icon template. |
| collapsebutton | TemplateRef<any> \| undefined | Custom collapse button template. |
| checkboxicon | TemplateRef<any> \| undefined | Custom checkbox icon template for  `checkbox`  selection mode. |
| node | TemplateRef<any> \| undefined | Custom node template. |

## Accessibility

Screen Reader Component uses ARIA roles and attributes for screen reader accessibility. The root element has role="tree" with aria-multiselectable for multiple selection support. Each tree item uses role="treeitem" with aria-level for hierarchy, aria-expanded for collapse state, and aria-selected for selection state. Child nodes are grouped with role="group" . Keyboard Support Node Key Function tab Moves focus through the focusable nodes within the chart. enter Toggles the selection state of a node. space Toggles the selection state of a node. Collapse Button Key Function tab Moves focus through the focusable elements within the chart. enter Toggles the expanded state of a node. space Toggles the expanded state of a node.
