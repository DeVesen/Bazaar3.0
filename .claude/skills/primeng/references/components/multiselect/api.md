# Angular MultiSelect Component — API

MultiSelect is used to select multiple items from a collection.

## Multi Select

MultiSelect is used to select multiple items from a collection.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, MultiSelectPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| id | string \| undefined | - | Unique identifier of the component |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the overlay panel. |
| panelStyleClass | string \| undefined | - | Style class of the overlay panel element. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| readonly | boolean \| undefined | - | When present, it specifies that the component cannot be edited. |
| group | boolean \| undefined | - | Whether to display options as grouped when nested options are provided. |
| filter | boolean | - | When specified, displays an input field to filter the items on keyup. |
| filterPlaceHolder | string \| undefined | - | Defines placeholder of the filter input. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| overlayVisible | boolean | - | Specifies the visibility of the options panel. |
| tabindex | number | - | Index of the element in tabbing order. |
| dataKey | string \| undefined | - | A property to uniquely identify a value in options. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| displaySelectedLabel | boolean | true | Whether to show labels of selected item labels or use default label. |
| maxSelectedLabels | number \| null | 3 | Decides how many selected item labels to show at most. |
| selectionLimit | number \| undefined | - | Maximum number of selectable items. |
| selectedItemsLabel | string \| undefined | - | Label to display after exceeding max selected labels e.g. ({0} items selected), defaults "ellipsis" keyword to indicate a text-overflow. |
| showToggleAll | boolean | - | Whether to show the checkbox at header to toggle all items at once. |
| emptyFilterMessage | string | - | Text to display when filtering does not return any results. |
| emptyMessage | string | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| resetFilterOnHide | boolean | - | Clears the filter value when hiding the dropdown. |
| dropdownIcon | string \| undefined | - | Icon class of the dropdown icon. |
| chipIcon | string \| undefined | - | Icon class of the chip icon. |
| optionLabel | string \| undefined | - | Name of the label field of an option. |
| optionValue | string \| undefined | - | Name of the value field of an option. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of an option or function to determine disabled state. |
| optionGroupLabel | string | - | Name of the label field of an option group. |
| optionGroupChildren | string | - | Name of the options field of an option group. |
| showHeader | boolean | - | Whether to show the header. |
| filterBy | string \| undefined | - | When filtering is enabled, filterBy decides which field or fields (comma separated) to search against. |
| scrollHeight | string | - | Height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| loading | boolean | - | Whether the multiselect is in loading state. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| loadingIcon | string \| undefined | - | Icon to display in loading state. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| overlayOptions | OverlayOptions \| undefined | - | Whether to use overlay API feature. The properties of overlay API can be used like an object in it. |
| ariaFilterLabel | string \| undefined | - | Defines a string that labels the filter input. |
| filterMatchMode | "startsWith" \| "contains" \| "notContains" \| "endsWith" \| "equals" \| "notEquals" \| "in" \| "between" \| "lt" \| "lte" \| "gt" \| "gte" \| "is" \| "isNot" \| "before" \| "after" \| "dateIs" \| "dateIsNot" \| "dateBefore" \| "dateAfter" | - | Defines how the items are filtered. |
| tooltip | string | - | Advisory information to display in a tooltip on hover. |
| tooltipPosition | "right" \| "left" \| "top" \| "bottom" | - | Position of the tooltip. |
| tooltipPositionStyle | string | - | Type of CSS position. |
| tooltipStyleClass | string \| undefined | - | Style class of the tooltip. |
| autofocusFilter | boolean | - | Applies focus to the filter element when the overlay is shown. |
| display | "comma" \| "chip" | - | Defines how the selected items are displayed. |
| autocomplete | string | - | Defines the autocomplete is active. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| autofocus | boolean \| undefined | - | When present, it specifies that the component should automatically get focus on load. |
| placeholder | string \| undefined | - | Label to display when there are no selections. |
| options | any[] \| undefined | - | An array of objects to display as the available options. |
| filterValue | string \| null \| undefined | - | When specified, filter displays with this value. |
| selectAll | boolean \| null \| undefined | - | Whether all data is selected. |
| focusOnHover | boolean | - | Indicates whether to focus on options when hovering over them, defaults to optionLabel. |
| filterFields | string[] \| undefined | - | Fields used when filtering the options, defaults to optionLabel. |
| selectOnFocus | boolean | - | Determines if the option will be selected on focus. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| highlightOnSelect | boolean | - | Whether the selected option will be add highlight class. |
| size | "small" \| "large" \| undefined | undefined | Specifies the size of the component. |
| variant | "filled" \| "outlined" \| undefined | undefined | Specifies the input variant of the component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: MultiSelectChangeEvent | Callback to invoke when value changes. |
| onFilter | event: MultiSelectFilterEvent | Callback to invoke when data is filtered. |
| onFocus | event: MultiSelectFocusEvent | Callback to invoke when multiselect receives focus. |
| onBlur | event: MultiSelectBlurEvent | Callback to invoke when multiselect loses focus. |
| onClick | event: Event | Callback to invoke when component is clicked. |
| onClear | value: void | Callback to invoke when input field is cleared. |
| onPanelShow | event: MotionEvent & AnimationEvent | Callback to invoke when overlay panel becomes visible. |
| onPanelHide | event: MotionEvent & AnimationEvent | Callback to invoke when overlay panel becomes hidden. |
| onLazyLoad | event: MultiSelectLazyLoadEvent | Callback to invoke in lazy mode to load new data. |
| onRemove | event: MultiSelectRemoveEvent | Callback to invoke in lazy mode to load new data. |
| onSelectAllChange | event: MultiSelectSelectAllChangeEvent | Callback to invoke when all data is selected. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<MultiSelectItemTemplateContext<any>> \| undefined | Custom item template. |
| group | TemplateRef<MultiSelectGroupTemplateContext<any>> \| undefined | Custom group template. |
| loader | TemplateRef<MultiSelectLoaderTemplateContext> \| undefined | Custom loader template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| filter | TemplateRef<MultiSelectFilterTemplateContext> \| undefined | Custom filter template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| emptyfilter | TemplateRef<void> \| undefined | Custom empty filter template. |
| empty | TemplateRef<void> \| undefined | Custom empty template. |
| selecteditems | TemplateRef<MultiSelectSelectedItemsTemplateContext<any>> \| undefined | Custom selected items template. |
| loadingicon | TemplateRef<void> \| undefined | Custom loading icon template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |
| removetokenicon | TemplateRef<MultiSelectChipIconTemplateContext> \| undefined | Custom remove token icon template. |
| chipicon | TemplateRef<MultiSelectChipIconTemplateContext> \| undefined | Custom chip icon template. |
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |
| dropdownicon | TemplateRef<MultiSelectDropdownIconTemplateContext> \| undefined | Custom dropdown icon template. |
| itemcheckboxicon | TemplateRef<MultiSelectItemCheckboxIconTemplateContext> \| undefined | Custom item checkbox icon template. |
| headercheckboxicon | TemplateRef<MultiSelectHeaderCheckboxIconTemplateContext> \| undefined | Custom header checkbox icon template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| updateModel | value: any, _event: any | void | Updates the model value. |
| show | isFocus: any | void | Displays the panel. |
| hide | isFocus: any | void | Hides the panel. |

## Accessibility

Screen Reader Value to describe the component can either be provided with ariaLabelledBy or ariaLabel props. The multiselect component has a combobox role in addition to aria-haspopup and aria-expanded attributes. The relation between the combobox and the popup is created with aria-controls attribute that refers to the id of the popup listbox. The popup listbox uses listbox as the role with aria-multiselectable enabled. Each list item has an option role along with aria-label , aria-selected and aria-disabled attributes. Checkbox component at the header uses a hidden native checkbox element internally that is only visible to screen readers. Value to read is defined with the selectAll and unselectAll keys of the aria property from the locale API. If filtering is enabled, filterInputProps can be defined to give aria-* props to the input element. Close button uses close key of the aria property from the locale API as the aria-label by default, this can be overriden with the closeButtonProps .
