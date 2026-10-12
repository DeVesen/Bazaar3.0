# Angular Listbox Component — API

Listbox is used to select one or more values from a list of items.

## Listbox

ListBox is used to select one or more values from a list of items.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ListBoxPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| id | string \| undefined | - | Unique identifier of the component. |
| searchMessage | string \| undefined | '{0} results are available' | Text to display when the search is active. Defaults to global value in i18n translation configuration. |
| emptySelectionMessage | string \| undefined | 'No selected item' | Text to display when filtering does not return any results. Defaults to global value in i18n translation configuration. |
| selectionMessage | string \| undefined | '{0} items selected' | Text to be displayed in hidden accessible field when options are selected. Defaults to global value in i18n translation configuration. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| selectOnFocus | boolean \| undefined | - | When enabled, the focused option is selected. |
| searchLocale | boolean \| undefined | - | Locale to use in searching. The default locale is the host environment's current locale. |
| focusOnHover | boolean | - | When enabled, the hovered option will be focused. |
| filterMessage | string \| undefined | - | Text to display when filtering. |
| filterFields | any[] \| undefined | - | Fields used when filtering the options, defaults to optionLabel. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| scrollHeight | string | - | Height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| tabindex | number | - | Index of the element in tabbing order. |
| multiple | boolean \| undefined | - | When specified, allows selecting multiple values. |
| listStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the list element. |
| listStyleClass | string \| undefined | - | Style class of the list element. |
| readonly | boolean \| undefined | - | When present, it specifies that the element value cannot be changed. |
| checkbox | boolean | - | When specified, allows selecting items with checkboxes. |
| filter | boolean | - | When specified, displays a filter input at header. |
| filterBy | string \| undefined | - | When filtering is enabled, filterBy decides which field or fields (comma separated) to search against. |
| filterMatchMode | "startsWith" \| "contains" \| "notContains" \| "endsWith" \| "equals" \| "notEquals" \| "in" \| "between" \| "lt" \| "lte" \| "gt" \| "gte" \| "is" \| "isNot" \| "before" \| "after" \| "dateIs" \| "dateIsNot" \| "dateBefore" \| "dateAfter" | - | Defines how the items are filtered. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| metaKeySelection | boolean | - | Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically. |
| dataKey | string \| undefined | - | A property to uniquely identify a value in options. |
| showToggleAll | boolean | - | Whether header checkbox is shown in multiple mode. |
| optionLabel | string \| undefined | - | Name of the label field of an option. |
| optionValue | string \| undefined | - | Name of the value field of an option. |
| optionGroupChildren | string | - | Name of the options field of an option group. |
| optionGroupLabel | string | - | Name of the label field of an option group. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of an option or function to determine disabled state. |
| ariaFilterLabel | string \| undefined | - | Defines a string that labels the filter input. |
| filterPlaceHolder | string \| undefined | - | Defines placeholder of the filter input. |
| emptyFilterMessage | string \| undefined | - | Text to display when filtering does not return any results. |
| emptyMessage | string \| undefined | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| group | boolean \| undefined | - | Whether to display options as grouped when nested options are provided. |
| options | any[] \| undefined | - | An array of selectitems to display as the available options. |
| filterValue | string \| undefined | - | When specified, filter displays with this value. |
| selectAll | boolean \| undefined | - | Whether all data is selected. |
| striped | boolean | false | Whether to displays rows with alternating colors. |
| highlightOnSelect | boolean | true | Whether the selected option will be add highlight class. |
| checkmark | boolean | false | Whether the selected option will be shown with a check mark. |
| dragdrop | boolean | - | Whether to enable dragdrop based reordering. |
| dropListData | any[] \| undefined | - | Array to use for CDK drop list data binding. When not provided, uses options array. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: ListboxChangeEvent | Callback to invoke on value change. |
| onClick | event: ListboxClickEvent | Callback to invoke when option is clicked. |
| onDblClick | event: ListboxDoubleClickEvent | Callback to invoke when option is double clicked. |
| onFilter | event: ListboxFilterEvent | Callback to invoke when data is filtered. |
| onFocus | event: FocusEvent | Callback to invoke when component receives focus. |
| onBlur | event: FocusEvent | Callback to invoke when component loses focus. |
| onSelectAllChange | event: ListboxSelectAllChangeEvent | Callback to invoke when all data is selected. |
| onLazyLoad | event: ScrollerLazyLoadEvent | Emits on lazy load. |
| onDrop | value: CdkDragDrop<string[], string[], any | Emits on item is dropped. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<ListboxItemTemplateContext<any>> \| undefined | Custom item template. |
| group | TemplateRef<ListboxGroupTemplateContext<any>> \| undefined | Custom group template. |
| header | TemplateRef<ListboxHeaderTemplateContext<any>> \| undefined | Custom header template. |
| filter | TemplateRef<ListboxFilterTemplateContext> \| undefined | Custom filter template. |
| footer | TemplateRef<ListboxFooterTemplateContext<any>> \| undefined | Custom footer template. |
| emptyfilter | TemplateRef<void> \| undefined | Custom empty filter message template. |
| empty | TemplateRef<void> \| undefined | Custom empty message template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |
| checkicon | TemplateRef<ListboxCheckIconTemplateContext> \| undefined | Custom check icon template. |
| checkmark | TemplateRef<ListboxCheckmarkTemplateContext> \| undefined | Custom checkmark icon template. |
| loader | TemplateRef<ListboxLoaderTemplateContext> \| undefined | Custom loader template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| updateModel | value: any, event: any | void | Updates the model value. |

## Accessibility

Screen Reader Value to describe the component can be provided ariaLabelledBy or ariaLabel props. The list element has a listbox role with the aria-multiselectable attribute that sets to true when multiple selection is enabled. Each list item has an option role with aria-selected and aria-disabled as their attributes.
