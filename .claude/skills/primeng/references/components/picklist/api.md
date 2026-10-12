# Angular PickList Component — API

PickList is used to reorder items between different lists.

## Pick List

PickList is used to reorder items between different lists.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, PickListPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| source | any[] | - | An array of objects for the source list. |
| target | any[] | - | An array of objects for the target list. |
| dataKey | string \| undefined | - | Name of the field that uniquely identifies the options. |
| sourceHeader | string \| undefined | - | Text for the source list caption |
| tabindex | number | - | Index of the element in tabbing order. |
| rightButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to right button for accessibility. |
| leftButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to left button for accessibility. |
| allRightButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to all right button for accessibility. |
| allLeftButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to all left button for accessibility. |
| upButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to up button for accessibility. |
| downButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to down button for accessibility. |
| topButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to top button for accessibility. |
| bottomButtonAriaLabel | string \| undefined | - | Defines a string that labels the move to bottom button for accessibility. |
| sourceAriaLabel | string \| undefined | - | Defines a string that labels the source list. |
| targetAriaLabel | string \| undefined | - | Defines a string that labels the target list. |
| targetHeader | string \| undefined | - | Text for the target list caption |
| responsive | boolean | - | When enabled orderlist adjusts its controls based on screen size. |
| filterBy | string \| undefined | - | When specified displays an input field to filter the items on keyup and decides which field to search (Accepts multiple fields with a comma). |
| filterLocale | string \| undefined | - | Locale to use in filtering. The default locale is the host environment's current locale. |
| trackBy | Function | - | Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. Use sourceTrackBy or targetTrackBy in case different algorithms are needed per list. |
| sourceTrackBy | Function \| undefined | - | Function to optimize the dom operations by delegating to ngForTrackBy in source list, default algorithm checks for object identity. |
| targetTrackBy | Function \| undefined | - | Function to optimize the dom operations by delegating to ngForTrackBy in target list, default algorithm checks for object identity. |
| showSourceFilter | boolean | - | Whether to show filter input for source list when filterBy is enabled. |
| showTargetFilter | boolean | - | Whether to show filter input for target list when filterBy is enabled. |
| metaKeySelection | boolean | - | Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically. |
| dragdrop | boolean | - | Whether to enable dragdrop based reordering. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| sourceStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the source list element. |
| targetStyle | { [klass: string]: any } \| null \| undefined | - | Inline style of the target list element. |
| showSourceControls | boolean | - | Whether to show buttons of source list. |
| showTargetControls | boolean | - | Whether to show buttons of target list. |
| sourceFilterPlaceholder | string \| undefined | - | Placeholder text on source filter input. |
| targetFilterPlaceholder | string \| undefined | - | Placeholder text on target filter input. |
| disabled | boolean | - | When present, it specifies that the component should be disabled. |
| sourceOptionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of a target option or function to determine disabled state. |
| targetOptionDisabled | string \| ((item: any) => boolean) \| undefined | - | Name of the disabled field of a target option or function to determine disabled state. |
| ariaSourceFilterLabel | string \| undefined | - | Defines a string that labels the filter input of source list. |
| ariaTargetFilterLabel | string \| undefined | - | Defines a string that labels the filter input of target list. |
| filterMatchMode | "startsWith" \| "contains" \| "notContains" \| "endsWith" \| "equals" \| "notEquals" \| "in" \| "between" \| "lt" \| "lte" \| "gt" \| "gte" \| "is" \| "isNot" \| "before" \| "after" \| "dateIs" \| "dateIsNot" \| "dateBefore" \| "dateAfter" | - | Defines how the items are filtered. |
| stripedRows | boolean | - | Whether to displays rows with alternating colors. |
| keepSelection | boolean | - | Keeps selection on the transfer list. |
| scrollHeight | string | - | Height of the viewport, a scrollbar is defined if height of list exceeds this value. |
| autoOptionFocus | boolean | - | Whether to focus on the first visible or selected element. |
| buttonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the Button component. |
| moveUpButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move up button inside the component. |
| moveTopButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move top button inside the component. |
| moveDownButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move down button inside the component. |
| moveBottomButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move bottom button inside the component. |
| moveToTargetProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move to target button inside the component. |
| moveAllToTargetProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move all to target button inside the component. |
| moveToSourceProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move to source button inside the component. |
| moveAllToSourceProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the move all to source button inside the component. |
| breakpoint | string | - | Indicates the width of the screen at which the component should change its behavior. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onMoveToSource | event: PickListMoveToSourceEvent | Callback to invoke when items are moved from target to source. |
| onMoveAllToSource | event: PickListMoveAllToSourceEvent | Callback to invoke when all items are moved from target to source. |
| onMoveAllToTarget | event: PickListMoveAllToTargetEvent | Callback to invoke when all items are moved from source to target. |
| onMoveToTarget | event: PickListMoveToTargetEvent | Callback to invoke when items are moved from source to target. |
| onSourceReorder | event: PickListSourceReorderEvent | Callback to invoke when items are reordered within source list. |
| onTargetReorder | event: PickListTargetReorderEvent | Callback to invoke when items are reordered within target list. |
| onSourceSelect | event: PickListSourceSelectEvent | Callback to invoke when items are selected within source list. |
| onTargetSelect | event: PickListTargetSelectEvent | Callback to invoke when items are selected within target list. |
| onSourceFilter | event: PickListSourceFilterEvent | Callback to invoke when the source list is filtered |
| onTargetFilter | event: PickListTargetFilterEvent | Callback to invoke when the target list is filtered |
| onFocus | event: Event | Callback to invoke when the list is focused |
| onBlur | event: Event | Callback to invoke when the list is blurred |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<PickListItemTemplateContext> \| undefined | Custom item template. |
| sourceitem | TemplateRef<PickListItemTemplateContext> \| undefined | Custom source item template, falls back to the shared item template when not defined. |
| targetitem | TemplateRef<PickListItemTemplateContext> \| undefined | Custom target item template, falls back to the shared item template when not defined. |
| sourceheader | TemplateRef<void> \| undefined | Custom source header template. |
| targetheader | TemplateRef<void> \| undefined | Custom target header template. |
| sourcefilter | TemplateRef<PickListFilterTemplateContext> \| undefined | Custom source filter template. |
| targetfilter | TemplateRef<PickListFilterTemplateContext> \| undefined | Custom target filter template. |
| emptymessagesource | TemplateRef<void> \| undefined | Custom empty message when source is empty template. |
| emptyfiltermessagesource | TemplateRef<void> \| undefined | Custom empty filter message when source is empty template. |
| emptymessagetarget | TemplateRef<void> \| undefined | Custom empty message when target is empty template. |
| emptyfiltermessagetarget | TemplateRef<void> \| undefined | Custom empty filter message when target is empty template. |
| moveupicon | TemplateRef<void> \| undefined | Custom move up icon template. |
| movetopicon | TemplateRef<void> \| undefined | Custom move top icon template. |
| movedownicon | TemplateRef<void> \| undefined | Custom move down icon template. |
| movebottomicon | TemplateRef<void> \| undefined | Custom move bottom icon template. |
| movetotargeticon | TemplateRef<PickListTransferIconTemplateContext> \| undefined | Custom move to target icon template. |
| movealltotargeticon | TemplateRef<PickListTransferIconTemplateContext> \| undefined | Custom move all to target icon template. |
| movetosourceicon | TemplateRef<PickListTransferIconTemplateContext> \| undefined | Custom move to source icon template. |
| movealltosourceicon | TemplateRef<PickListTransferIconTemplateContext> \| undefined | Custom move all to source icon template. |
| targetfiltericon | TemplateRef<void> \| undefined | Custom target filter icon template. |
| sourcefiltericon | TemplateRef<void> \| undefined | Custom source filter icon template. |

## Accessibility

Screen Reader Value to describe the source listbox and target listbox can be provided with ariaLabelledBy or ariaLabel props. The list elements has a listbox role with the aria-multiselectable attribute. Each list item has an option role with aria-selected and aria-disabled as their attributes. Controls buttons are button elements with an aria-label that refers to the aria.moveTop , aria.moveUp , aria.moveDown , aria.moveBottom , aria.moveTo , aria.moveAllTo , aria.moveFrom and aria.moveAllFrom properties of the locale API by default, alternatively you may use moveTopButtonProps , moveUpButtonProps , moveDownButtonProps , moveToButtonProps , moveAllToButtonProps , moveFromButtonProps , moveFromButtonProps and moveAllFromButtonProps to customize the buttons like overriding the default aria-label attributes. PickList Keyboard Support Key Function tab Moves focus to the first selected option, if there is none then first option receives the focus. up arrow Moves focus to the previous option. down arrow Moves focus to the next option. enter Toggles the selected state of the focused option. space Toggles the selected state of the focused option. home Moves focus to the first option. end Moves focus to the last option. shift + down arrow Moves focus to the next option and toggles the selection state. shift + up arrow Moves focus to the previous option and toggles the selection state. shift + space Selects the items between the most recently selected option and the focused option. control + shift + home Selects the focused options and all the options up to the first one. control + shift + end Selects the focused options and all the options down to the first one. control + a Selects all options. Buttons Keyboard Support Key Function enter Executes button action. space Executes button action.
