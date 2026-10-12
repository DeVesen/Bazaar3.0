# Angular AutoComplete Component — API

AutoComplete is an input component that provides real-time suggestions when being typed.

## Auto Complete

AutoComplete is an input component that provides real-time suggestions when being typed.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| minQueryLength | number \| undefined | - | Minimum number of characters to initiate a search. |
| delay | number | - | Delay between keystrokes to wait before sending a query. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the overlay panel element. |
| panelStyleClass | string \| undefined | - | Style class of the overlay panel element. |
| inputStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the input field. |
| inputId | string \| undefined | - | Identifier of the focus input to match a label defined for the component. |
| inputStyleClass | string \| undefined | - | Inline style of the input field. |
| placeholder | string \| undefined | - | Hint text for the input field. |
| readonly | boolean | - | When present, it specifies that the input cannot be typed. |
| scrollHeight | string | - | Maximum height of the suggestions panel. |
| lazy | boolean | - | Defines if data is loaded and interacted with in lazy manner. |
| virtualScroll | boolean | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| autoHighlight | boolean | - | When enabled, highlights the first item in the list by default. |
| forceSelection | boolean | - | When present, autocomplete clears the manual input if it does not match of the suggestions to force only accepting values from the suggestions. |
| type | string | - | Type of the input, defaults to "text". |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| dropdownAriaLabel | string \| undefined | - | Defines a string that labels the dropdown button for accessibility. |
| ariaLabelledBy | string \| undefined | - | Specifies one or more IDs in the DOM that labels the input field. |
| dropdownIcon | string \| undefined | - | Icon class of the dropdown icon. |
| unique | boolean | - | Ensures uniqueness of selected items on multiple mode. |
| group | boolean | - | Whether to display options as grouped when nested options are provided. |
| completeOnFocus | boolean | - | Whether to run a query when input receives focus. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| dropdown | boolean | - | Displays a button next to the input field when enabled. |
| showEmptyMessage | boolean | - | Whether to show the empty message or not. |
| dropdownMode | string | - | Specifies the behavior dropdown button. Default "blank" mode sends an empty string and "current" mode sends the input value. |
| multiple | boolean | - | Specifies if multiple values can be selected. **(Deprecated)** |
| addOnTab | boolean | - | When enabled, the input value is added to the selected items on tab key press when multiple is true and typeahead is false. **(Deprecated)** |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| dataKey | string \| undefined | - | A property to uniquely identify a value in options. |
| emptyMessage | string \| undefined | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| autocomplete | string | - | Used to define a string that autocomplete attribute the current element. |
| optionGroupChildren | string | - | Name of the options field of an option group. |
| optionGroupLabel | string | - | Name of the label field of an option group. |
| overlayOptions | OverlayOptions \| undefined | - | Options for the overlay element. |
| suggestions | any[] | - | An array of suggestions to display. |
| optionLabel | string \| ((item: any) => string) \| undefined | - | Property name or getter function to use as the label of an option. |
| optionValue | string \| ((item: any) => string) \| undefined | - | Property name or getter function to use as the value of an option. |
| id | string \| undefined | - | Unique identifier of the component. |
| searchMessage | string \| undefined | '{0} results are available' | Text to display when the search is active. Defaults to global value in i18n translation configuration. |
| emptySelectionMessage | string \| undefined | 'No selected item' | Text to display when filtering does not return any results. Defaults to global value in i18n translation configuration. |
| selectionMessage | string \| undefined | '{0} items selected' | Text to be displayed in hidden accessible field when options are selected. Defaults to global value in i18n translation configuration. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| selectOnFocus | boolean | - | When enabled, the focused option is selected. |
| searchLocale | string \| string[] \| undefined | - | Locale to use in searching. The default locale is the host environment's current locale. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Property name or getter function to use as the disabled flag of an option, defaults to false when not defined. |
| focusOnHover | boolean | - | When enabled, the hovered option will be focused. |
| typeahead | boolean | true | Whether typeahead is active or not. |
| addOnBlur | boolean | false | Whether to add an item on blur event if the input has value and typeahead is false with multiple mode. **(Deprecated)** |
| separator | string \| RegExp \| undefined | - | Separator char to add item when typeahead is false and multiple mode is enabled. **(Deprecated)** |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, AutoCompletePassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
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

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| completeMethod | event: AutoCompleteCompleteEvent | Callback to invoke to search for suggestions. |
| onSelect | event: AutoCompleteSelectEvent | Callback to invoke when a suggestion is selected. |
| onUnselect | event: AutoCompleteUnselectEvent | Callback to invoke when a selected value is removed. |
| onAdd | event: AutoCompleteAddEvent | Callback to invoke when an item is added via addOnBlur or separator features. |
| onFocus | event: Event | Callback to invoke when the component receives focus. |
| onBlur | event: Event | Callback to invoke when the component loses focus. |
| onDropdownClick | event: AutoCompleteDropdownClickEvent | Callback to invoke to when dropdown button is clicked. |
| onClear | value: void | Callback to invoke when clear button is clicked. |
| onInputKeydown | event: KeyboardEvent | Callback to invoke on input key down. |
| onKeyUp | event: KeyboardEvent | Callback to invoke on input key up. |
| onShow | value: void | Callback to invoke on overlay is shown. |
| onHide | value: void | Callback to invoke on overlay is hidden. |
| onLazyLoad | event: AutoCompleteLazyLoadEvent | Callback to invoke on lazy load data. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<AutoCompleteItemTemplateContext<any>> \| undefined | Custom item template. |
| empty | TemplateRef<void> \| undefined | Custom empty message template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| selecteditem | TemplateRef<AutoCompleteSelectedItemTemplateContext<any>> \| undefined | Custom selected item template. |
| group | TemplateRef<AutoCompleteGroupTemplateContext<any>> \| undefined | Custom group template. |
| loader | TemplateRef<AutoCompleteLoaderTemplateContext> \| undefined | Custom loader template. |
| removeicon | TemplateRef<AutoCompleteRemoveIconTemplateContext> \| undefined | Custom remove icon template. |
| loadingicon | TemplateRef<void> \| undefined | Custom loading icon template. |
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |
| dropdownicon | TemplateRef<void> \| undefined | Custom dropdown icon template. |

## Accessibility

Screen Reader Value to describe the component can either be provided via label tag combined with inputId prop or using ariaLabelledBy , ariaLabel props. The input element has combobox role in addition to aria-autocomplete , aria-haspopup and aria-expanded attributes. The relation between the input and the popup is created with aria-controls and aria-activedescendant attribute is used to instruct screen reader which option to read during keyboard navigation within the popup list. In multiple mode, chip list uses listbox role whereas each chip has the option role with aria-label set to the label of the chip. The popup list has an id that refers to the aria-controls attribute of the input element and uses listbox as the role. Each list item has option role and an id to match the aria-activedescendant of the input element.
