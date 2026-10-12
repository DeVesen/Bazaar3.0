# Angular OrderList Component — API

OrderList is used to sort a collection.

## Order List

OrderList is used to manage the order of a collection.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, OrderListPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| header | string \| undefined | - | Text for the caption. |
| tabindex | number \| undefined | - | Index of the element in tabbing order. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Specifies one or more IDs in the DOM that labels the input field. |
| listStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the list element. |
| responsive | boolean | - | A boolean value that indicates whether the component should be responsive. |
| filterBy | string \| undefined | - | When specified displays an input field to filter the items on keyup and decides which fields to search against. |
| filterPlaceholder | string \| undefined | - | Placeholder of the filter input. |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| metaKeySelection | boolean | - | When true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically. |
| dragdrop | boolean | - | Whether to enable dragdrop based reordering. |
| controlsPosition | "left" \| "right" | - | Defines the location of the buttons with respect to the list. |
| ariaFilterLabel | string \| undefined | - | Defines a string that labels the filter input. |
| filterMatchMode | "startsWith" \| "contains" \| "notContains" \| "endsWith" \| "equals" \| "notEquals" \| "in" \| "between" \| "lt" \| "lte" \| "gt" \| "gte" \| "is" \| "isNot" \| "before" \| "after" \| "dateIs" \| "dateIsNot" \| "dateBefore" \| "dateAfter" | - | Defines how the items are filtered. |
| breakpoint | string | - | Indicates the width of the screen at which the component should change its behavior. |
| stripedRows | boolean | - | Whether to displays rows with alternating colors. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |
| trackBy | Function | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. |
| scrollHeight | string | - | Height of the viewport, a scrollbar is defined if height of list exceeds this value. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element. |
| dataKey | string \| undefined | - | Name of the field that uniquely identifies the record in the data. |
| selection | any[] | - | A list of values that are currently selected. |
| value | any[] \| undefined | - | Array of values to be displayed in the component. It represents the data source for the list of items. |
| buttonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the Button component. |
| moveUpButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move up button inside the component. |
| moveTopButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move top button inside the component. |
| moveDownButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move down button inside the component. |
| moveBottomButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move bottom button inside the component. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onReorder | value: any | Callback to invoke when list is reordered. |
| onSelectionChange | event: OrderListSelectionChangeEvent | Callback to invoke when selection changes. |
| onFilterEvent | event: OrderListFilterEvent | Callback to invoke when filtering occurs. |
| onFocus | event: Event | Callback to invoke when the list is focused |
| onBlur | event: Event | Callback to invoke when the list is blurred |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<OrderListItemTemplateContext> \| undefined | Custom item template. |
| emptymessage | TemplateRef<void> \| undefined | Custom empty template. |
| emptyfiltermessage | TemplateRef<void> \| undefined | Custom empty filter template. |
| filter | TemplateRef<OrderListFilterTemplateContext> \| undefined | Custom filter template. |
| header | TemplateRef<void> \| undefined | Custom header template. |
| moveupicon | TemplateRef<void> \| undefined | Custom move up icon template. |
| movetopicon | TemplateRef<void> \| undefined | Custom move top icon template. |
| movedownicon | TemplateRef<void> \| undefined | Custom move down icon template. |
| movebottomicon | TemplateRef<void> \| undefined | Custom move bottom icon template. |
| filtericon | TemplateRef<void> \| undefined | Custom filter icon template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| resetFilter |  | void | Callback to invoke on filter reset. |

## Accessibility

Screen Reader Value to describe the source listbox and target listbox can be provided with sourceListProps and targetListProps by passing aria-labelledby or aria-label props. The list elements has a listbox role with the aria-multiselectable attribute. Each list item has an option role with aria-selected and aria-disabled as their attributes. Controls buttons are button elements with an aria-label that refers to the aria.moveTop , aria.moveUp , aria.moveDown , aria.moveBottom , aria.moveTo , aria.moveAllTo , aria.moveFrom and aria.moveAllFrom properties of the locale API by default, alternatively you may use moveTopButtonProps , moveUpButtonProps , moveDownButtonProps , moveToButtonProps , moveAllToButtonProps , moveFromButtonProps , moveFromButtonProps and moveAllFromButtonProps to customize the buttons like overriding the default aria-label attributes. OrderList Keyboard Support Key Function tab Moves focus to the first selected option, if there is none then first option receives the focus. up arrow Moves focus to the previous option. down arrow Moves focus to the next option. enter Toggles the selected state of the focused option. space Toggles the selected state of the focused option. home Moves focus to the first option. end Moves focus to the last option. shift + down arrow Moves focus to the next option and toggles the selection state. shift + up arrow Moves focus to the previous option and toggles the selection state. shift + space Selects the items between the most recently selected option and the focused option. control + shift + home Selects the focused options and all the options up to the first one. control + shift + end Selects the focused options and all the options down to the first one. control + a Selects all options. Buttons Keyboard Support Key Function enter Executes button action. space Executes button action.
