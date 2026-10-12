# Angular Paginator Component — API

Paginator displays data in paged format and provides navigation between pages.

## Paginator

Paginator is a generic component to display content in paged format.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, PaginatorPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| pageLinkSize | number | - | Number of page links to display. |
| alwaysShow | boolean | - | Whether to show it even there is only one page. |
| templateLeft | TemplateRef<PaginatorTemplateContext> \| undefined | - | Template instance to inject into the left side of the paginator. |
| templateRight | TemplateRef<PaginatorTemplateContext> \| undefined | - | Template instance to inject into the right side of the paginator. |
| dropdownScrollHeight | string | - | Dropdown height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| currentPageReportTemplate | string | - | Template of the current page report element. Available placeholders are {currentPage},{totalPages},{rows},{first},{last} and {totalRecords} |
| showCurrentPageReport | boolean | - | Whether to display current page report. |
| showFirstLastIcon | boolean | - | When enabled, icons are displayed on paginator to go first and last page. |
| totalRecords | number | - | Number of total records. |
| rows | number | - | Data count to display per page. |
| first | number | - | Zero-relative number of the first row to be displayed. |
| rowsPerPageOptions | any[] \| undefined | - | Array of integer/object values to display inside rows per page dropdown. A object that have 'showAll' key can be added to it to show all data. Exp; [10,20,30,{showAll:'All'}] |
| showJumpToPageDropdown | boolean | - | Whether to display a dropdown to navigate to any page. |
| showJumpToPageInput | boolean | - | Whether to display a input to navigate to any page. |
| jumpToPageItemTemplate | TemplateRef<PaginatorDropdownItemTemplateContext> \| undefined | - | Template instance to inject into the jump to page dropdown item inside in the paginator. |
| showPageLinks | boolean | - | Whether to show page links. |
| locale | string \| undefined | - | Locale to be used in formatting. |
| dropdownItemTemplate | TemplateRef<PaginatorDropdownItemTemplateContext> \| undefined | - | Template instance to inject into the rows per page dropdown item inside in the paginator. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onPageChange | value: PaginatorState | Callback to invoke when page changes, the event object contains information about the new state. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| dropdownicon | TemplateRef<void> \| undefined | Template for the dropdown icon. |
| firstpagelinkicon | TemplateRef<void> \| undefined | Template for the first page link icon. |
| previouspagelinkicon | TemplateRef<void> \| undefined | Template for the previous page link icon. |
| lastpagelinkicon | TemplateRef<void> \| undefined | Template for the last page link icon. |
| nextpagelinkicon | TemplateRef<void> \| undefined | Template for the next page link icon. |

## Accessibility

Screen Reader Paginator is placed inside a nav element to indicate a navigation section. All of the paginator elements can be customized using templating however the default behavious is listed below. First, previous, next and last page navigators elements with aria-label attributes referring to the aria.firstPageLabel , aria.prevPageLabel , aria.nextPageLabel and aria.lastPageLabel properties of the locale API respectively. Page links are also button elements with an aria-label attribute derived from the aria.pageLabel of the locale API. Current page is marked with aria-current set to "page" as well. Current page report uses aria-live="polite" to instruct screen reader about the changes to the pagination state. Rows per page dropdown internally uses a dropdown component, refer to the dropdown documentation for accessibility details. Additionally, the dropdown uses an aria-label from the aria.rowsPerPage property of the locale API. Jump to page input is an input element with an aria-label that refers to the aria.jumpToPage property of the locale API. Keyboard Support Key Function tab Moves focus through the paginator elements. enter Executes the paginator element action. space Executes the paginator element action. Rows Per Page Dropdown Keyboard Support Refer to the dropdown documentation for more details about keyboard support.
