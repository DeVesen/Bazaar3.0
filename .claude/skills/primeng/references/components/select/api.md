# Angular Select Component — API

Select is used to choose an item from a collection of options.

## Select

Select is used to choose an item from a collection of options.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, SelectPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| fluid | boolean \| undefined | false | Spans 100% width of the container when enabled. |
| variant | "filled" \| "outlined" \| undefined | 'outlined' | Specifies the input variant of the component. |
| size | "small" \| "large" \| undefined | undefined | Specifies the size of the component. |
| inputSize | number \| null \| undefined | undefined | Specifies the visible width of the input element in characters. |
| pattern | string \| readonly RegExp[] \| null \| undefined | undefined | Specifies the value must match the pattern. |
| min | any | undefined | The value must be greater than or equal to the value. |
| max | any | undefined | The value must be less than or equal to the value. |
| step | number \| null \| undefined | undefined | Unless the step is set to the any literal, the value must be min + an integral multiple of the step. |
| minlength | number \| null \| undefined | undefined | The number of characters (code points) must not be less than the value of the attribute, if non-empty. |
| maxlength | number \| null \| undefined | undefined | The number of characters (code points) must not exceed the value of the attribute. |
| id | string \| undefined | - | Unique identifier of the component |
| scrollHeight | string | - | Height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value. |
| filter | boolean \| undefined | - | When specified, displays an input field to filter the items on keyup. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the overlay panel element. |
| panelStyleClass | string \| undefined | - | Style class of the overlay panel element. |
| readonly | boolean \| undefined | - | When present, it specifies that the component cannot be edited. |
| editable | boolean \| undefined | - | When present, custom value instead of predefined options can be entered using the editable input field. |
| tabindex | number | - | Index of the element in tabbing order. |
| placeholder | string \| undefined | - | Default text to display when no option is selected. |
| loadingIcon | string \| undefined | - | Icon to display in loading state. |
| filterPlaceholder | string \| undefined | - | Placeholder text to show when filter input is empty. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| inputId | string \| undefined | - | Identifier of the accessible input element. |
| dataKey | string \| undefined | - | A property to uniquely identify a value in options. |
| filterBy | string \| undefined | - | When filtering is enabled, filterBy decides which field or fields (comma separated) to search against. |
| filterFields | any[] \| undefined | - | Fields used when filtering the options, defaults to optionLabel. |
| autofocus | boolean \| undefined | - | When present, it specifies that the component should automatically get focus on load. |
| resetFilterOnHide | boolean | - | Clears the filter value when hiding the select. |
| checkmark | boolean | - | Whether the selected option will be shown with a check mark. |
| dropdownIcon | string \| undefined | - | Icon class of the select icon. |
| loading | boolean | - | Whether the select is in loading state. |
| optionLabel | string \| undefined | - | Name of the label field of an option. |
| optionValue | string \| undefined | - | Name of the value field of an option. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of an option or function to determine disabled state. |
| optionGroupLabel | string | - | Name of the label field of an option group. |
| optionGroupChildren | string | - | Name of the options field of an option group. |
| group | boolean \| undefined | - | Whether to display options as grouped when nested options are provided. |
| showClear | boolean \| undefined | - | When enabled, a clear icon is displayed to clear the value. |
| emptyFilterMessage | string | - | Text to display when filtering does not return any results. Defaults to global value in i18n translation configuration. |
| emptyMessage | string | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| overlayOptions | OverlayOptions \| undefined | - | Whether to use overlay API feature. The properties of overlay API can be used like an object in it. |
| ariaFilterLabel | string \| undefined | - | Defines a string that labels the filter input. |
| ariaLabel | string \| undefined | - | Used to define a aria label attribute the current element. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| filterMatchMode | "startsWith" \| "contains" \| "notContains" \| "endsWith" \| "equals" \| "notEquals" \| "in" \| "between" \| "lt" \| "lte" \| "gt" \| "gte" \| "is" \| "isNot" \| "before" \| "after" \| "dateIs" \| "dateIsNot" \| "dateBefore" \| "dateAfter" | - | Defines how the items are filtered. |
| tooltip | string | - | Advisory information to display in a tooltip on hover. |
| tooltipPosition | "right" \| "left" \| "top" \| "bottom" | - | Position of the tooltip. |
| tooltipPositionStyle | string | - | Type of CSS position. |
| tooltipStyleClass | string \| undefined | - | Style class of the tooltip. |
| focusOnHover | boolean | - | Fields used when filtering the options, defaults to optionLabel. |
| selectOnFocus | boolean | - | Determines if the option will be selected on focus. |
| multiple | boolean | - | When enabled, allows multiple items to be selected. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| autofocusFilter | boolean | - | Applies focus to the filter element when the overlay is shown. |
| filterValue | string \| null \| undefined | - | When specified, filter displays with this value. |
| options | any[] \| null \| undefined | - | An array of objects to display as the available options. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: SelectChangeEvent | Callback to invoke when value of select changes. |
| onFilter | event: SelectFilterEvent | Callback to invoke when data is filtered. |
| onFocus | event: Event | Callback to invoke when select gets focus. |
| onBlur | event: Event | Callback to invoke when select loses focus. |
| onClick | event: MouseEvent | Callback to invoke when component is clicked. |
| onShow | event: MotionEvent & AnimationEvent | Callback to invoke when select overlay gets visible. |
| onHide | event: MotionEvent & AnimationEvent | Callback to invoke when select overlay gets hidden. |
| onClear | event: Event | Callback to invoke when select clears the value. |
| onLazyLoad | event: SelectLazyLoadEvent | Callback to invoke in lazy mode to load new data. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<SelectItemTemplateContext<any>> \| undefined | Custom item template. |
| group | TemplateRef<SelectGroupTemplateContext<any>> \| undefined | Custom group template. |
| loader | TemplateRef<SelectLoaderTemplateContext> \| undefined | Custom loader template. |
| selecteditem | TemplateRef<SelectSelectedItemTemplateContext<any>> \| undefined | Custom selected item template. |
| header | TemplateRef<SelectHeaderTemplateContext> \| undefined | Custom header template. |
| filter | TemplateRef<SelectFilterTemplateContext> \| undefined | Custom filter template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| emptyfilter | TemplateRef<void> \| undefined | Custom empty filter template. |
| empty | TemplateRef<void> \| undefined | Custom empty template. |
| dropdownicon | TemplateRef<SelectIconTemplateContext> \| undefined | Custom dropdown icon template. |
| loadingicon | TemplateRef<void> \| undefined | Custom loading icon template. |
| clearicon | TemplateRef<SelectIconTemplateContext> \| undefined | Custom clear icon template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |
| onicon | TemplateRef<void> \| undefined | Custom on icon template. |
| officon | TemplateRef<void> \| undefined | Custom off icon template. |
| cancelicon | TemplateRef<void> \| undefined | Custom cancel icon template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| resetFilter |  | void | Callback to invoke on filter reset. |
| show | isFocus: any | void | Displays the panel. |
| hide | isFocus: any | void | Hides the panel. |
| focus |  | void | Applies focus. |
| clear | event: Event | void | Clears the model. |

## Accessibility

Screen Reader Value to describe the component can either be provided with ariaLabelledBy or ariaLabel props. The select element has a combobox role in addition to aria-haspopup and aria-expanded attributes. If the editable option is enabled aria-autocomplete is also added. The relation between the combobox and the popup is created with aria-controls and aria-activedescendant attribute is used to instruct screen reader which option to read during keyboard navigation within the popup list. The popup list has an id that refers to the aria-controls attribute of the combobox element and uses listbox as the role. Each list item has an option role, an id to match the aria-activedescendant of the input element along with aria-label , aria-selected and aria-disabled attributes. If filtering is enabled, filterInputProps can be defined to give aria-* props to the filter input element.
