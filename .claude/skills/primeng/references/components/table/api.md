# Angular Table Component — API

Table displays data in tabular format.

## Table

Table displays data in tabular format.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TablePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| frozenColumns | any[] \| undefined | - | An array of objects to represent dynamic columns that are frozen. |
| frozenValue | any[] \| undefined | - | An array of objects to display as frozen. |
| tableStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the table. |
| tableStyleClass | string \| undefined | - | Style class of the table. |
| paginator | boolean \| undefined | - | When specified as true, enables the pagination. |
| pageLinks | number | - | Number of page links to display in paginator. |
| rowsPerPageOptions | any[] \| undefined | - | Array of integer/object values to display inside rows per page dropdown of paginator |
| alwaysShowPaginator | boolean | - | Whether to show it even there is only one page. |
| paginatorPosition | "top" \| "bottom" \| "both" | - | Position of the paginator, options are "top", "bottom" or "both". |
| paginatorStyleClass | string \| undefined | - | Custom style class for paginator |
| paginatorDropdownAppendTo | any | - | Target element to attach the paginator dropdown overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| paginatorDropdownScrollHeight | string | - | Paginator dropdown height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| currentPageReportTemplate | string | - | Template of the current page report element. Available placeholders are {currentPage},{totalPages},{rows},{first},{last} and {totalRecords} |
| showCurrentPageReport | boolean \| undefined | - | Whether to display current page report. |
| showJumpToPageDropdown | boolean \| undefined | - | Whether to display a dropdown to navigate to any page. |
| showJumpToPageInput | boolean \| undefined | - | Whether to display a input to navigate to any page. |
| showFirstLastIcon | boolean | - | When enabled, icons are displayed on paginator to go first and last page. |
| showPageLinks | boolean | - | Whether to show page links. |
| defaultSortOrder | number | - | Sort order to use when an unsorted column gets sorted by user interaction. |
| sortMode | "single" \| "multiple" | - | Defines whether sorting works on single column or on multiple columns. |
| resetPageOnSort | boolean | - | When true, resets paginator to first page after sorting. Available only when sortMode is set to single. |
| selectionMode | TableSelectionMode \| null \| undefined | - | Specifies the selection mode, valid values are "single" and "multiple". |
| selectionPageOnly | boolean \| undefined | - | When enabled with paginator and checkbox selection mode, the select all checkbox in the header will select all rows on the current page. |
| contextMenuSelectionInput | any | - | Selected row with a context menu. |
| dataKey | string \| undefined | - | A property to uniquely identify a record in data. |
| metaKeySelection | boolean | - | Defines whether metaKey should be considered for the selection. On touch enabled devices, metaKeySelection is turned off automatically. |
| rowSelectable | ((row: { data: any; index: number }) => boolean) \| undefined | - | Defines if the row is selectable. |
| rowTrackBy | Function | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| lazyLoadOnInit | boolean | - | Whether to call lazy loading on initialization. |
| compareSelectionBy | "equals" \| "deepEquals" | - | Algorithm to define if a row is selected, valid values are "equals" that compares by reference and "deepEquals" that compares all fields. |
| csvSeparator | string | - | Character to use as the csv separator. |
| exportFilename | string | - | Name of the exported file. |
| filtersInput | { [s: string]: FilterMetadata \| FilterMetadata[] } | - | An array of FilterMetadata objects to provide external filters. |
| globalFilterFields | string[] \| undefined | - | An array of fields as string to use in global filtering. |
| filterDelay | number | - | Delay in milliseconds before filtering the data. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| expandedRowKeysInput | { [s: string]: boolean } | - | Map instance to keep the expanded rows where key of the map is the data key of the row. |
| editingRowKeysInput | { [s: string]: boolean } | - | Map instance to keep the rows being edited where key of the map is the data key of the row. |
| rowExpandMode | "multiple" \| "single" | - | Whether multiple rows can be expanded at any time. Valid values are "multiple" and "single". |
| scrollable | boolean \| undefined | - | Enables scrollable tables. |
| rowGroupMode | TableRowGroupMode \| undefined | - | Type of the row grouping, valid values are "subheader" and "rowspan". |
| scrollHeight | string \| undefined | - | Height of the scroll viewport in fixed pixels or the "flex" keyword for a dynamic size. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of a row to use in calculations of virtual scrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| virtualScrollDelay | number | - | Threshold in milliseconds to delay lazy loading during scrolling. |
| frozenWidth | string \| undefined | - | Width of the frozen columns container. |
| contextMenu | any | - | Local ng-template varilable of a ContextMenu. |
| resizableColumns | boolean \| undefined | - | When enabled, columns can be resized using drag and drop. |
| columnResizeMode | "fit" \| "expand" | - | Defines whether the overall table width should change on column resize, valid values are "fit" and "expand". |
| reorderableColumns | boolean \| undefined | - | When enabled, columns can be reordered using drag and drop. |
| loading | boolean \| undefined | - | Displays a loader to indicate data load is in progress. |
| loadingIcon | string \| undefined | - | The icon to show while indicating data load is in progress. |
| showLoader | boolean | - | Whether to show the loading mask when loading property is true. |
| rowHover | boolean \| undefined | - | Adds hover effect to rows without the need for selectionMode. Note that tr elements that can be hovered need to have "p-selectable-row" class for rowHover to work. |
| customSort | boolean \| undefined | - | Whether to use the default sorting or a custom one using sortFunction. |
| showInitialSortBadge | boolean | - | Whether to use the initial sort badge or not. |
| exportFunction | Function \| undefined | - | Export function. |
| exportHeader | string \| undefined | - | Custom export header of the column to be exported as CSV. |
| stateKey | string \| undefined | - | Unique identifier of a stateful table to use in state storage. |
| stateStorage | "session" \| "local" | - | Defines where a stateful table keeps its state, valid values are "session" for sessionStorage and "local" for localStorage. |
| editMode | "cell" \| "row" | - | Defines the editing mode, valid values are "cell" and "row". |
| groupRowsBy | any | - | Field name to use in row grouping. |
| size | TableSize \| undefined | - | Defines the size of the table. |
| showGridlines | boolean \| undefined | - | Whether to show grid lines between cells. |
| stripedRows | boolean \| undefined | - | Whether to display rows with alternating colors. |
| groupRowsByOrder | number | - | Order to sort when default row grouping is enabled. |
| paginatorLocale | string \| undefined | - | Locale to be used in paginator formatting. |
| valueInput | RowData[] \| undefined | - | An array of objects to display. |
| columnsInput | any[] \| undefined | - | An array of objects to represent dynamic columns. |
| first | number \| null \| undefined | - | Index of the first row to be displayed. |
| rows | number \| undefined | - | Number of rows to display per page. |
| totalRecords | number | - | Number of total records, defaults to length of value when not defined. |
| sortFieldInput | string \| null \| undefined | - | Name of the field to sort data by default. |
| sortOrderInput | number | - | Order to sort when default sorting is enabled. |
| multiSortMetaInput | SortMeta[] \| null \| undefined | - | An array of SortMeta objects to sort the data by default in multiple sort mode. |
| selection | any | - | Selected row in single mode or an array of values in multiple mode. |
| selectAllInput | boolean \| null | - | Whether all data is selected. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| contextMenuSelectionChange | value: any | Callback to invoke on context menu selection change. |
| selectAllChange | event: TableSelectAllChangeEvent | Emits when the all of the items selected or unselected. |
| onRowSelect | event: TableRowSelectEvent<RowData | Callback to invoke when a row is selected. |
| onRowUnselect | event: TableRowUnSelectEvent<RowData | Callback to invoke when a row is unselected. |
| onPage | event: TablePageEvent | Callback to invoke when pagination occurs. |
| onSort | value: any | Callback to invoke when a column gets sorted. |
| onFilter | event: TableFilterEvent | Callback to invoke when data is filtered. |
| onLazyLoad | event: TableLazyLoadEvent | Callback to invoke when paging, sorting or filtering happens in lazy mode. |
| onRowExpand | event: TableRowExpandEvent<RowData | Callback to invoke when a row is expanded. |
| onRowCollapse | event: TableRowCollapseEvent | Callback to invoke when a row is collapsed. |
| onContextMenuSelect | event: TableContextMenuSelectEvent<RowData | Callback to invoke when a row is selected with right click. |
| onColResize | event: TableColResizeEvent | Callback to invoke when a column is resized. |
| onColReorder | event: TableColumnReorderEvent | Callback to invoke when a column is reordered. |
| onRowReorder | event: TableRowReorderEvent | Callback to invoke when a row is reordered. |
| onEditInit | event: TableEditInitEvent | Callback to invoke when a cell switches to edit mode. |
| onEditComplete | event: TableEditCompleteEvent | Callback to invoke when cell edit is completed. |
| onEditCancel | event: TableEditCancelEvent | Callback to invoke when cell edit is cancelled with escape key. |
| onHeaderCheckboxToggle | event: TableHeaderCheckboxToggleEvent | Callback to invoke when state of header checkbox changes. |
| sortFunction | value: any | A function to implement custom sorting, refer to sorting section for details. |
| onStateSave | value: TableState | Callback to invoke table state is saved. |
| onStateRestore | value: TableState | Callback to invoke table state is restored. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| exportCSV | options: ExportCSVOptions | void | Data export method. |
| resetScrollTop |  | void | Resets scroll to top. |
| scrollToVirtualIndex | index: number | void | Scrolls to given index when using virtual scroll. |
| scrollTo | options: any | void | Scrolls to given index. |

## Accessibility

Screen Reader Default role of the table is table . Header, body and footer elements use rowgroup , rows use row role, header cells have columnheader and body cells use cell roles. Sortable headers utilizer aria-sort attribute either set to "ascending" or "descending". Table rows and table cells should be specified by users using the aria-posinset , aria-setsize , aria-label , and aria-describedby attributes, as they are determined through templating. Built-in checkbox and radiobutton components for row selection use checkbox and radiobutton . The label to describe them is retrieved from the aria.selectRow and aria.unselectRow properties of the locale API. Similarly header checkbox uses selectAll and unselectAll keys. When a row is selected, aria-selected is set to true on a row. The element to expand or collapse a row is a button with aria-expanded and aria-controls properties. Value to describe the buttons is derived from aria.expandRow and aria.collapseRow properties of the locale API. The filter menu button use aria.showFilterMenu and aria.hideFilterMenu properties as aria-label in addition to the aria-haspopup , aria-expanded and aria-controls to define the relation between the button and the overlay. Popop menu has dialog role with aria-modal as focus is kept within the overlay. The operator dropdown use aria.filterOperator and filter constraints dropdown use aria.filterConstraint properties. Buttons to add rules on the other hand utilize aria.addRule and aria.removeRule properties. The footer buttons similarly use aria.clear and aria.apply properties. filterInputProps of the Column component can be used to define aria labels for the built-in filter components, if a custom component is used with templating you also may define your own aria labels as well. Editable cells use custom templating so you need to manage aria roles and attributes manually if required. The row editor controls are button elements with aria.editRow , aria.cancelEdit and aria.saveEdit used for the aria-label . Paginator is a standalone component used inside the Table, refer to the paginator for more information about the accessibility features. Keyboard Support Any button element inside the Table used for cases like filter, row expansion, edit are tabbable and can be used with space and enter keys. Sortable Headers Keyboard Support Key Function tab Moves through the headers. enter Sorts the column. space Sorts the column. Filter Menu Keyboard Support Key Function tab Moves through the elements inside the popup. escape Hides the popup. enter Opens the popup. Selection Keyboard Support Key Function tab Moves focus to the first selected row, if there is none then first row receives the focus. up arrow Moves focus to the previous row. down arrow Moves focus to the next row. enter Toggles the selected state of the focused row depending on the metaKeySelection setting. space Toggles the selected state of the focused row depending on the metaKeySelection setting. home Moves focus to the first row. end Moves focus to the last row. shift + down arrow Moves focus to the next row and toggles the selection state. shift + up arrow Moves focus to the previous row and toggles the selection state. shift + space Selects the rows between the most recently selected row and the focused row. control + shift + home Selects the focused rows and all the options up to the first one. control + shift + end Selects the focused rows and all the options down to the last one. control + a Selects all rows.
