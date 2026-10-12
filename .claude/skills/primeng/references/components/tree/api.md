# Angular Tree Component — API

Tree is used to display hierarchical data.

## Tree

Tree is used to display hierarchical data.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TreePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| value | any | - | An array of treenodes. |
| selectionMode | "single" \| "multiple" \| "checkbox" \| null \| undefined | - | Defines the selection mode. |
| loadingMode | "mask" \| "icon" | - | Loading mode display. |
| selection | TreeNode<any> \| TreeNode<any>[] \| null \| undefined | - | A single treenode instance or an array to refer to the selections. **(Deprecated)** |
| collapsedKeys | { [key: string]: boolean } \| null | - | A map of node keys (by  `TreeNode.key` ) whose value is  `true`  for collapsed nodes. Two-way bindable. When provided it controls expansion (a node is expanded unless its key maps to  `true` ); leave it unset to keep driving expansion from each node's  `expanded`  flag (default, non-breaking). |
| selectionKeys | { [key: string]: any } \| null | - | A map of node keys (by  `TreeNode.key` ) describing the selection state. Two-way bindable. For single/multiple selection a key maps to  `true` ; for checkbox selection it maps to  `{ checked, partialChecked }` . When provided it is kept in sync with  `selection` ; leave it unset to keep using the node-reference based  `selection`  model (default, non-breaking). |
| contextMenu | any | - | Context menu instance. |
| contextMenuSelection | TreeNode<any> \| null | - | Selected node with a context menu. |
| draggableScope | any | - | Scope of the draggable nodes to match a droppableScope. |
| droppableScope | any | - | Scope of the droppable nodes to match a draggableScope. |
| draggableNodes | boolean | - | Whether the nodes are draggable. |
| droppableNodes | boolean | - | Whether the nodes are droppable. |
| metaKeySelection | boolean | - | Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically. |
| propagateSelectionUp | boolean | - | Whether checkbox selections propagate to ancestor nodes. |
| propagateSelectionDown | boolean | - | Whether checkbox selections propagate to descendant nodes. |
| loading | boolean | - | Displays a loader to indicate data load is in progress. |
| loadingIcon | string \| undefined | - | The icon to show while indicating data load is in progress. |
| emptyMessage | string | - | Text to display when there is no data. |
| ariaLabel | string \| undefined | - | Used to define a string that labels the tree. |
| togglerAriaLabel | string \| undefined | - | Defines a string that labels the toggler icon for accessibility. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| validateDrop | boolean | - | When enabled, drop can be accepted or rejected based on condition defined at onNodeDrop. |
| filter | boolean | - | When specified, displays an input field to filter the items. |
| filterInputAutoFocus | boolean | - | Determines whether the filter input should be automatically focused when the component is rendered. |
| filterBy | string | - | When filtering is enabled, filterBy decides which field or fields (comma separated) to search against. |
| filterMode | string | - | Mode for filtering valid values are "lenient" and "strict". Default is lenient. |
| filterOptions | any | - | Mode for filtering valid values are "lenient" and "strict". Default is lenient. |
| filterPlaceholder | string \| undefined | - | Placeholder text to show when filter input is empty. |
| filteredNodes | TreeNode<any>[] \| null \| undefined | - | Values after the tree nodes are filtered. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| scrollHeight | string \| undefined | - | Height of the scrollable viewport. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| virtualScroll | boolean | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| indentation | number | - | Indentation factor for spacing of the nested node when virtual scrolling is enabled. |
| trackBy | Function | - | Function to optimize the node list rendering, default algorithm checks for object identity. |
| highlightOnSelect | boolean | - | Highlights the node on select. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onNodeSelect | event: TreeNodeSelectEvent | Callback to invoke when a node is selected. |
| onNodeUnselect | event: TreeNodeUnSelectEvent | Callback to invoke when a node is unselected. |
| onNodeExpand | event: TreeNodeExpandEvent | Callback to invoke when a node is expanded. |
| onNodeCollapse | event: TreeNodeCollapseEvent | Callback to invoke when a node is collapsed. |
| onNodeContextMenuSelect | event: TreeNodeContextMenuSelectEvent | Callback to invoke when a node is selected with right click. |
| onNodeDoubleClick | event: TreeNodeDoubleClickEvent | Callback to invoke when a node is double clicked. |
| onNodeDrop | event: TreeNodeDropEvent | Callback to invoke when a node is dropped. |
| onLazyLoad | event: TreeLazyLoadEvent | Callback to invoke in lazy mode to load new data. |
| onScroll | event: TreeScrollEvent | Callback to invoke in virtual scroll mode when scroll position changes. |
| onScrollIndexChange | event: TreeScrollIndexChangeEvent | Callback to invoke in virtual scroll mode when scroll position and item's range in view changes. |
| onFilter | event: TreeFilterEvent | Callback to invoke when data is filtered. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| filter | TemplateRef<TreeFilterTemplateContext> \| undefined | Custom filter template. |
| node | TemplateRef<any> \| undefined | Custom node template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| loader | TemplateRef<TreeLoaderTemplateContext> \| undefined | Custom loader template. |
| empty | TemplateRef<void> \| undefined | Custom empty message template. |
| togglericon | TemplateRef<TreeTogglerIconTemplateContext> \| undefined | Custom toggler icon template. |
| checkboxicon | TemplateRef<TreeCheckboxIconTemplateContext> \| undefined | Custom checkbox icon template. |
| loadingicon | TemplateRef<void> \| undefined | Custom loading icon template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| resetFilter |  | void | Resets filter. |
| scrollToVirtualIndex | index: number | void | Scrolls to virtual index. |
| scrollTo | options: any | void | Scrolls to virtual index. |

## Accessibility

Screen Reader Value to describe the component can either be provided with aria-labelledby or aria-label props. The root list element has a tree role whereas each list item has a treeitem role along with aria-label , aria-selected and aria-expanded attributes. In checkbox selection, aria-checked is used instead of aria-selected . The container element of a treenode has the group role. Checkbox and toggle icons are hidden from screen readers as their parent element with treeitem role and attributes are used instead for readers and keyboard support. The aria-setsize , aria-posinset and aria-level attributes are calculated implicitly and added to each treeitem. Keyboard Support Key Function tab Moves focus to the first selected node when focus enters the component, if there is none then first element receives the focus. If focus is already inside the component, moves focus to the next focusable element in the page tab sequence. shift + tab Moves focus to the last selected node when focus enters the component, if there is none then first element receives the focus. If focus is already inside the component, moves focus to the previous focusable element in the page tab sequence. enter Selects the focused treenode. space Selects the focused treenode. down arrow Moves focus to the next treenode. up arrow Moves focus to the previous treenode. right arrow If node is closed, opens the node otherwise moves focus to the first child node. left arrow If node is open, closes the node otherwise moves focus to the parent node.
