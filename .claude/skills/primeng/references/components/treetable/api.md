# Angular TreeTable Component — API

TreeTable is used to display hierarchical data in tabular format.

## Tree Table

TreeTable is used to display hierarchical data in tabular format.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TreeTablePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| columns | any[] \| undefined | - | An array of objects to represent dynamic columns. |
| tableStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the table. |
| tableStyleClass | string \| undefined | - | Style class of the table. |
| autoLayout | boolean \| undefined | - | Whether the cell widths scale according to their content or not. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| lazyLoadOnInit | boolean | - | Whether to call lazy loading on initialization. |
| paginator | boolean \| undefined | - | When specified as true, enables the pagination. |
| rows | number \| undefined | - | Number of rows to display per page. |
| firstInput | number | - | Index of the first row to be displayed. |
| pageLinks | number | - | Number of page links to display in paginator. |
| rowsPerPageOptions | any[] \| undefined | - | Array of integer/object values to display inside rows per page dropdown of paginator |
| alwaysShowPaginator | boolean | - | Whether to show it even there is only one page. |
| paginatorPosition | "top" \| "bottom" \| "both" | - | Position of the paginator. |
| paginatorStyleClass | string \| undefined | - | Custom style class for paginator |
| paginatorDropdownAppendTo | any | - | Target element to attach the paginator dropdown overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| currentPageReportTemplate | string | - | Template of the current page report element. Available placeholders are {currentPage},{totalPages},{rows},{first},{last} and {totalRecords} |
| showCurrentPageReport | boolean \| undefined | - | Whether to display current page report. |
| showJumpToPageDropdown | boolean \| undefined | - | Whether to display a dropdown to navigate to any page. |
| showFirstLastIcon | boolean | - | When enabled, icons are displayed on paginator to go first and last page. |
| showPageLinks | boolean | - | Whether to show page links. |
| defaultSortOrder | number | - | Sort order to use when an unsorted column gets sorted by user interaction. |
| sortMode | "single" \| "multiple" | - | Defines whether sorting works on single column or on multiple columns. |
| resetPageOnSort | boolean | - | When true, resets paginator to first page after sorting. |
| customSort | boolean \| undefined | - | Whether to use the default sorting or a custom one using sortFunction. |
| selectionMode | TreeTableSelectionMode \| undefined | - | Specifies the selection mode, valid values are "single" and "multiple". |
| contextMenuSelection | any | - | Selected row with a context menu. |
| dataKey | string \| undefined | - | A property to uniquely identify a record in data. |
| metaKeySelection | boolean | - | Defines whether metaKey is should be considered for the selection. On touch enabled devices, metaKeySelection is turned off automatically. |
| compareSelectionBy | "equals" \| "deepEquals" | - | Algorithm to define if a row is selected, valid values are "equals" that compares by reference and "deepEquals" that compares all fields. |
| rowHover | boolean \| undefined | - | Adds hover effect to rows without the need for selectionMode. |
| loading | boolean \| undefined | - | Displays a loader to indicate data load is in progress. |
| loadingIcon | string \| undefined | - | The icon to show while indicating data load is in progress. |
| showLoader | boolean | - | Whether to show the loading mask when loading property is true. |
| scrollable | boolean \| undefined | - | When specified, enables horizontal and/or vertical scrolling. |
| scrollHeight | string \| undefined | - | Height of the scroll viewport in fixed pixels or the "flex" keyword for a dynamic size. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of a row to use in calculations of virtual scrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| virtualScrollDelay | number | - | The delay (in milliseconds) before triggering the virtual scroll. This determines the time gap between the user's scroll action and the actual rendering of the next set of items in the virtual scroll. |
| frozenWidth | string \| undefined | - | Width of the frozen columns container. |
| frozenColumns | any | - | An array of objects to represent dynamic columns that are frozen. |
| resizableColumns | boolean \| undefined | - | When enabled, columns can be resized using drag and drop. |
| columnResizeMode | "fit" \| "expand" | - | Defines whether the overall table width should change on column resize, valid values are "fit" and "expand". |
| reorderableColumns | boolean \| undefined | - | When enabled, columns can be reordered using drag and drop. |
| contextMenu | any | - | Local ng-template varilable of a ContextMenu. |
| rowTrackBy | Function | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. |
| filtersInput | { [s: string]: FilterMetadata \| undefined } | - | An array of FilterMetadata objects to provide external filters. |
| globalFilterFields | string[] \| undefined | - | An array of fields as string to use in global filtering. |
| filterDelay | number | - | Delay in milliseconds before filtering the data. |
| filterMode | "lenient" \| "strict" | - | Mode for filtering valid values are "lenient" and "strict". Default is lenient. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| paginatorLocale | string \| undefined | - | Locale to be used in paginator formatting. |
| totalRecordsInput | number | - | Number of total records, defaults to length of value when not defined. |
| sortFieldInput | string \| null \| undefined | - | Name of the field to sort data by default. |
| sortOrderInput | number | 1 | Order to sort when default sorting is enabled. |
| multiSortMetaInput | SortMeta[] \| null \| undefined | null | An array of SortMeta objects to sort the data by default in multiple sort mode. |
| selectionInput | any | null | Selected row in single mode or an array of values in multiple mode. **(Deprecated)** |
| valueInput | TreeNode<any>[] \| undefined | null | An array of objects to display. |
| selectionKeys | any | - | A map of keys to control the selection state. |
| collapsedKeys | any | - | A map of keys (by  `dataKey`  value) whose value is  `true`  for collapsed rows. Two-way bindable. When provided it controls row expansion (a row is expanded unless its key maps to  `true` ); leave it unset to keep driving expansion from each node's  `expanded`  flag (default, non-breaking). |
| showGridlines | boolean | false | Whether to show grid lines between cells. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| selectionChange | value: TreeTableNode<any | Callback to invoke on selected node change. |
| contextMenuSelectionChange | value: TreeTableNode<any | Callback to invoke on context menu selection change. |
| onFilter | event: TreeTableFilterEvent | Callback to invoke when data is filtered. |
| onNodeExpand | event: TreeTableNodeExpandEvent<any | Callback to invoke when a node is expanded. |
| onNodeCollapse | event: TreeTableNodeCollapseEvent<any | Callback to invoke when a node is collapsed. |
| onPage | value: TreeTablePaginatorState | Callback to invoke when pagination occurs. |
| onSort | value: any | Callback to invoke when a column gets sorted. |
| onLazyLoad | event: TreeTableLazyLoadEvent | Callback to invoke when paging, sorting or filtering happens in lazy mode. |
| sortFunction | event: TreeTableSortEvent | An event emitter to invoke on custom sorting, refer to sorting section for details. |
| onColResize | event: TreeTableColResizeEvent | Callback to invoke when a column is resized. |
| onColReorder | event: TreeTableColumnReorderEvent | Callback to invoke when a column is reordered. |
| onNodeSelect | value: TreeTableNode<any | Callback to invoke when a node is selected. |
| onNodeUnselect | event: TreeTableNodeUnSelectEvent | Callback to invoke when a node is unselected. |
| onContextMenuSelect | event: TreeTableContextMenuSelectEvent | Callback to invoke when a node is selected with right click. |
| onHeaderCheckboxToggle | event: TreeTableHeaderCheckboxToggleEvent | Callback to invoke when state of header checkbox changes. |
| onEditInit | event: TreeTableEditEvent | Callback to invoke when a cell switches to edit mode. |
| onEditComplete | event: TreeTableEditEvent | Callback to invoke when cell edit is completed. |
| onEditCancel | event: TreeTableEditEvent | Callback to invoke when cell edit is cancelled with escape key. |
| selectionKeysChange | value: any | Callback to invoke when selectionKeys are changed. |
| collapsedKeysChange | value: any | Callback to invoke when collapsedKeys are changed. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| colgroup | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| caption | TemplateRef<void> \| undefined |  |
| header | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| body | TemplateRef<TreeTableBodyTemplateContext> \| undefined |  |
| footer | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| summary | TemplateRef<void> \| undefined |  |
| emptymessage | TemplateRef<TreeTableEmptyMessageTemplateContext> \| undefined |  |
| paginatorleft | TemplateRef<PaginatorTemplateContext> \| undefined |  |
| paginatorright | TemplateRef<PaginatorTemplateContext> \| undefined |  |
| paginatordropdownitem | TemplateRef<PaginatorDropdownItemTemplateContext> \| undefined |  |
| frozenheader | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| frozenbody | TemplateRef<void> \| undefined |  |
| frozenfooter | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| frozencolgroup | TemplateRef<TreeTableColumnsTemplateContext> \| undefined |  |
| loadingicon | TemplateRef<void> \| undefined |  |
| reorderindicatorupicon | TemplateRef<void> \| undefined |  |
| reorderindicatordownicon | TemplateRef<void> \| undefined |  |
| sorticon | TemplateRef<TreeTableSortIconTemplateContext> \| undefined |  |
| checkboxicon | TemplateRef<TreeTableCheckboxIconTemplateContext> \| undefined |  |
| headercheckboxicon | TemplateRef<TreeTableHeaderCheckboxIconTemplateContext> \| undefined |  |
| togglericon | TemplateRef<TreeTableTogglerIconTemplateContext> \| undefined |  |
| paginatorfirstpagelinkicon | TemplateRef<void> \| undefined |  |
| paginatorlastpagelinkicon | TemplateRef<void> \| undefined |  |
| paginatorpreviouspagelinkicon | TemplateRef<void> \| undefined |  |
| paginatornextpagelinkicon | TemplateRef<void> \| undefined |  |
| loader | TemplateRef<ScrollerLoaderTemplateContext> \| undefined |  |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| resetScrollTop |  | void | Resets scroll to top. |
| scrollToVirtualIndex | index: number | void | Scrolls to given index when using virtual scroll. |
| scrollTo | options: ScrollToOptions | void | Scrolls to given index. |
| reset |  | void | Clears the sort and paginator state. |

## Accessibility

Screen Reader Default role of the table is table . Header, body and footer elements use rowgroup , rows use row role, header cells have columnheader and body cells use cell roles. Sortable headers utilizer aria-sort attribute either set to "ascending" or "descending". Row elements manage aria-expanded for state and aria-level attribute to define the hierachy by ttRow directive. Table rows and table cells should be specified by users using the aria-posinset , aria-setsize , aria-label , and aria-describedby attributes, as they are determined through templating. When selection is enabled, ttSelectableRow directive sets aria-selected to true on a row. In checkbox mode, the built-in checkbox component use checkbox role with aria-checked state attribute. Editable cells use custom templating so you need to manage aria roles and attributes manually if required. Paginator is a standalone component used inside the TreeTable, refer to the paginator for more information about the accessibility features. Sortable Headers Keyboard Support Key Function tab Moves through the headers. enter Sorts the column. space Sorts the column. Keyboard Support Key Function tab Moves focus to the first selected node when focus enters the component, if there is none then first element receives the focus. If focus is already inside the component, moves focus to the next focusable element in the page tab sequence. shift + tab Moves focus to the last selected node when focus enters the component, if there is none then first element receives the focus. If focus is already inside the component, moves focus to the previous focusable element in the page tab sequence. enter Selects the focused treenode. space Selects the focused treenode. down arrow Moves focus to the next treenode. up arrow Moves focus to the previous treenode. right arrow If node is closed, opens the node otherwise moves focus to the first child node. left arrow If node is open, closes the node otherwise moves focus to the parent node.
