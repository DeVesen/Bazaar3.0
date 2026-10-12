# Angular CascadeSelect Component — API

CascadeSelect displays a nested structure of options.

## Cascade Select

CascadeSelect is a form component to select a value from a nested structure of options.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, CascadeSelectPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| id | string \| undefined | - | Unique identifier of the component |
| searchMessage | string \| undefined | '{0} results are available' | Text to display when the search is active. Defaults to global value in i18n translation configuration. |
| emptyMessage | string \| undefined | - | Text to display when there is no data. Defaults to global value in i18n translation configuration. |
| selectionMessage | string \| undefined | '{0} items selected' | Text to be displayed in hidden accessible field when options are selected. Defaults to global value in i18n translation configuration. |
| emptySearchMessage | string \| undefined | 'No available options' | Text to display when filtering does not return any results. Defaults to value from PrimeNG locale configuration. |
| emptySelectionMessage | string \| undefined | 'No selected item' | Text to display when filtering does not return any results. Defaults to global value in i18n translation configuration. |
| searchLocale | string \| undefined | - | Locale to use in searching. The default locale is the host environment's current locale. |
| optionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of an option or function to determine disabled state. |
| focusOnHover | boolean | - | Fields used when filtering the options, defaults to optionLabel. |
| selectOnFocus | boolean | - | Determines if the option will be selected on focus. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| options | any[] \| undefined | - | An array of selectitems to display as the available options. |
| optionLabel | string \| undefined | - | Property name or getter function to use as the label of an option. |
| optionValue | string \| undefined | - | Property name or getter function to use as the value of an option, defaults to the option itself when not defined. |
| optionGroupLabel | string \| undefined | - | Property name or getter function to use as the label of an option group. |
| optionGroupChildren | string \| string[] \| null \| undefined | - | Property name or getter function to retrieve the items of a group. |
| placeholder | string \| undefined | - | Default text to display when no option is selected. |
| value | WritableSignal<unknown> | - | Selected value of the component. |
| dataKey | string \| undefined | - | A property to uniquely identify an option. |
| inputId | string \| undefined | - | Identifier of the underlying input element. |
| tabindex | number | - | Index of the element in tabbing order. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| inputLabel | string \| undefined | - | Label of the input for accessibility. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| panelStyleClass | string \| undefined | - | Style class of the overlay panel. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the overlay panel. |
| overlayOptions | OverlayOptions \| undefined | - | Whether to use overlay API feature. The properties of overlay API can be used like an object in it. |
| autofocus | boolean | - | When present, it specifies that the component should automatically get focus on load. |
| loading | boolean | - | Whether the dropdown is in loading state. |
| loadingIcon | string \| undefined | - | Icon to display in loading state. |
| breakpoint | string | - | The breakpoint to define the maximum width boundary. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onChange | event: CascadeSelectChangeEvent | Callback to invoke on value change. |
| onGroupChange | event: { originalEvent: Event; value?: unknown; isFocus?: boolean } | Callback to invoke when a group changes. |
| onShow | event: CascadeSelectShowEvent \| undefined | Callback to invoke when the overlay is shown. |
| onHide | value: any | Callback to invoke when the overlay is hidden. |
| onClear | event: MouseEvent \| undefined | Callback to invoke when the clear token is clicked. |
| onBeforeShow | event: CascadeSelectBeforeShowEvent | Callback to invoke before overlay is shown. |
| onBeforeHide | event: CascadeSelectBeforeHideEvent | Callback to invoke before overlay is hidden. |
| onFocus | event: FocusEvent | Callback to invoke when input receives focus. |
| onBlur | event: FocusEvent | Callback to invoke when input loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| value | TemplateRef<CascadeSelectValueTemplateContext<any>> \| undefined | Custom value template. |
| option | TemplateRef<CascadeSelectOptionTemplateContext<any>> \| undefined | Custom option template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| triggericon | TemplateRef<void> \| undefined | Custom trigger icon template. |
| loadingicon | TemplateRef<void> \| undefined | Custom loading icon template. |
| groupicon | TemplateRef<void> \| undefined | Custom option group icon template. |
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |

## Accessibility

Screen Reader Value to describe the component can either be provided with ariaLabelledBy or ariaLabel props. The cascadeselect element has a combobox role in addition to aria-haspopup and aria-expanded attributes. The relation between the combobox and the popup is created with aria-controls that refers to the id of the popup. The popup list has an id that refers to the aria-controls attribute of the combobox element and uses tree as the role. Each list item has a treeitem role along with aria-label , aria-selected and aria-expanded attributes. The container element of a treenode has the group role. The aria-setsize , aria-posinset and aria-level attributes are calculated implicitly and added to each treeitem.
