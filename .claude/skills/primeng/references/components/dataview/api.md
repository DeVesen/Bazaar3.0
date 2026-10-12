# Angular DataView Component — API

DataView displays data in grid grid-cols-12 gap-4 or list layout with pagination and sorting features.

## Data View

DataView displays data in grid or list layout with pagination and sorting features.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DataViewPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| paginator | boolean | - | When specified as true, enables the pagination. |
| rows | number | - | Number of rows to display per page. |
| totalRecords | number \| undefined | - | Number of total records, defaults to length of value when not defined. |
| pageLinks | number | - | Number of page links to display in paginator. |
| rowsPerPageOptions | any[] \| number[] \| undefined | - | Array of integer/object values to display inside rows per page dropdown of paginator |
| paginatorPosition | "top" \| "bottom" \| "both" | - | Position of the paginator. |
| paginatorStyleClass | string \| undefined | - | Custom style class for paginator |
| alwaysShowPaginator | boolean | - | Whether to show it even there is only one page. |
| paginatorDropdownAppendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | - | Target element to attach the paginator dropdown overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| paginatorDropdownScrollHeight | string | - | Paginator dropdown height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| currentPageReportTemplate | string | - | Template of the current page report element. Available placeholders are {currentPage},{totalPages},{rows},{first},{last} and {totalRecords} |
| showCurrentPageReport | boolean | - | Whether to display current page report. |
| showJumpToPageDropdown | boolean | - | Whether to display a dropdown to navigate to any page. |
| showFirstLastIcon | boolean | - | When enabled, icons are displayed on paginator to go first and last page. |
| showPageLinks | boolean | - | Whether to show page links. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| lazyLoadOnInit | boolean | - | Whether to call lazy loading on initialization. |
| emptyMessage | string | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| gridStyleClass | string | - | Style class of the grid. |
| trackBy | Function | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. |
| filterBy | string \| undefined | - | Comma separated list of fields in the object graph to search against. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| loading | boolean | - | Displays a loader to indicate data load is in progress. |
| loadingIcon | string \| undefined | - | The icon to show while indicating data load is in progress. |
| first | number | - | Index of the first row to be displayed. |
| sortField | string \| undefined | - | Property name of data to use in sorting by default. |
| sortOrder | number \| undefined | - | Order to sort the data by default. |
| value | any[] \| undefined | - | An array of objects to display. |
| layout | "list" \| "grid" | - | Defines the layout mode. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onLazyLoad | event: DataViewLazyLoadEvent | Callback to invoke when paging, sorting or filtering happens in lazy mode. |
| onPage | event: DataViewPageEvent | Callback to invoke when pagination occurs. |
| onSort | event: DataViewSortEvent | Callback to invoke when sorting occurs. |
| onChangeLayout | event: DataViewLayoutChangeEvent | Callback to invoke when changing layout. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| list | TemplateRef<DataViewListTemplateContext<any>> \| undefined | Template for the list layout. |
| grid | TemplateRef<DataViewGridTemplateContext<any>> \| undefined | Template for grid layout. |
| header | TemplateRef<void> \| undefined | Template for the header section. |
| emptymessage | TemplateRef<void> \| undefined | Template for the empty message section. |
| footer | TemplateRef<void> \| undefined | Template for the footer section. |
| paginatorleft | TemplateRef<DataViewPaginatorLeftTemplateContext> \| undefined | Template for the left side of paginator. |
| paginatorright | TemplateRef<DataViewPaginatorRightTemplateContext> \| undefined | Template for the right side of paginator. |
| paginatordropdownitem | TemplateRef<DataViewPaginatorDropdownItemTemplateContext> \| undefined | Template for items in paginator dropdown. |
| loadingicon | TemplateRef<void> \| undefined | Template for loading icon. |
| listicon | TemplateRef<void> \| undefined | Template for list icon. |
| gridicon | TemplateRef<void> \| undefined | Template for grid icon. |

## Accessibility

Screen Reader The container element that wraps the layout options buttons has a group role whereas each button element uses button role and aria-pressed is updated depending on selection state. Values to describe the buttons are derived from the aria.listView and aria.gridView properties of the locale API respectively. Refer to paginator accessibility documentation for the paginator of the component. Keyboard Support Key Function tab Moves focus to the buttons. space Toggles the checked state of a button.
