# Angular TreeSelect Component — API

TreeSelect is a form component to choose from hierarchical data.

## Tree Select

TreeSelect is a form component to choose from hierarchical data.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TreeSelectPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| required | boolean \| undefined | false | There must be a value (if set). |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |
| disabled | boolean \| undefined | false | When present, it specifies that the component should have disabled state style. |
| name | string \| undefined | undefined | When present, it specifies that the name of the input. |
| inputId | string \| undefined | - | Identifier of the underlying input element. |
| scrollHeight | string | - | Height of the viewport, a scrollbar is defined if height of list exceeds this value. |
| metaKeySelection | boolean | - | Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically. |
| display | "comma" \| "chip" | - | Defines how the selected items are displayed. |
| selectionMode | "single" \| "multiple" \| "checkbox" | - | Defines the selection mode. |
| tabindex | string | - | Index of the element in tabbing order. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| placeholder | string \| undefined | - | Label to display when there are no selections. |
| panelClass | string \| string[] \| Set<string> \| { [klass: string]: any } \| undefined | - | Style class of the overlay panel. |
| panelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the panel element. |
| panelStyleClass | string \| undefined | - | Style class of the panel element. |
| labelStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the label element. |
| labelStyleClass | string \| undefined | - | Style class of the label element. |
| overlayOptions | OverlayOptions \| undefined | - | Specifies the options for the overlay. |
| emptyMessage | string | - | Text to display when there are no options available. Defaults to value from PrimeNG locale configuration. |
| filter | boolean | - | When specified, displays an input field to filter the items. |
| filterBy | string | - | When filtering is enabled, filterBy decides which field or fields (comma separated) to search against. |
| filterMode | string | - | Mode for filtering valid values are "lenient" and "strict". Default is lenient. |
| filterPlaceholder | string \| undefined | - | Placeholder text to show when filter input is empty. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| filterInputAutoFocus | boolean | - | Determines whether the filter input should be automatically focused when the component is rendered. |
| propagateSelectionDown | boolean | - | Whether checkbox selections propagate to descendant nodes. |
| propagateSelectionUp | boolean | - | Whether checkbox selections propagate to ancestor nodes. |
| showClear | boolean | - | When enabled, a clear icon is displayed to clear the value. |
| resetFilterOnHide | boolean | - | Clears the filter value when hiding the dropdown. |
| virtualScroll | boolean \| undefined | - | Whether the data should be loaded on demand during scroll. |
| virtualScrollItemSize | number \| undefined | - | Height of an item in the list for VirtualScrolling. |
| virtualScrollOptions | ScrollerOptions \| undefined | - | Whether to use the scroller feature. The properties of scroller component can be used like an object in it. |
| autofocus | boolean \| undefined | - | When present, it specifies that the component should automatically get focus on load. |
| options | TreeNode<any>[] \| undefined | undefined | An array of treenodes. |
| loading | boolean \| undefined | - | Displays a loader to indicate data load is in progress. |
| loadingMode | "mask" \| "icon" | - | Loading mode display. |
| size | InputSize \| undefined | undefined | Specifies the size of the component. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onNodeExpand | event: TreeSelectNodeExpandEvent | Callback to invoke when a node is expanded. |
| onNodeCollapse | event: TreeSelectNodeCollapseEvent | Callback to invoke when a node is collapsed. |
| onShow | value: any | Callback to invoke when the overlay is shown. |
| onHide | event: Event | Callback to invoke when the overlay is hidden. |
| onClear | value: any | Callback to invoke when input field is cleared. |
| onFilter | event: TreeFilterEvent | Callback to invoke when data is filtered. |
| onFocus | event: Event | Callback to invoke when treeselect gets focus. |
| onBlur | event: Event | Callback to invoke when treeselect loses focus. |
| onNodeUnselect | event: TreeNodeUnSelectEvent | Callback to invoke when a node is unselected. |
| onNodeSelect | event: TreeNodeSelectEvent | Callback to invoke when a node is selected. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| value | TemplateRef<TreeSelectValueTemplateContext> \| undefined | Custom value template. |
| header | TemplateRef<TreeSelectHeaderTemplateContext> \| undefined | Custom header template. |
| empty | TemplateRef<void> \| undefined | Custom empty message template. |
| footer | TemplateRef<TreeSelectHeaderTemplateContext> \| undefined | Custom footer template. |
| clearicon | TemplateRef<void> \| undefined | Custom clear icon template. |
| triggericon | TemplateRef<void> \| undefined | Custom trigger icon template. |
| dropdownicon | TemplateRef<void> \| undefined | Custom dropdown icon template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |
| closeicon | TemplateRef<void> \| undefined | Custom close icon template. |
| itemtogglericon | TemplateRef<TreeSelectItemTogglerIconTemplateContext> \| undefined | Custom item toggler icon template. |
| itemcheckboxicon | TemplateRef<TreeSelectItemCheckboxIconTemplateContext> \| undefined | Custom item checkbox icon template. |
| itemloadingicon | TemplateRef<void> \| undefined | Custom item loading icon template. |

## Accessibility

Screen Reader Value to describe the component can either be provided with ariaLabelledby or ariaLabel props. The treeselect element has a combobox role in addition to aria-haspopup and aria-expanded attributes. The relation between the combobox and the popup is created with aria-controls that refers to the id of the popup. The popup list has an id that refers to the aria-controls attribute of the combobox element and uses tree as the role. Each list item has a treeitem role along with aria-label , aria-selected and aria-expanded attributes. In checkbox selection, aria-checked is used instead of aria-selected . Checkbox and toggle icons are hidden from screen readers as their parent element with treeitem role and attributes are used instead for readers and keyboard support. The container element of a treenode has the group role. The aria-setsize , aria-posinset and aria-level attributes are calculated implicitly and added to each treeitem. If filtering is enabled, filterInputProps can be defined to give aria-* props to the filter input element.
