# Angular Dock Component — API

Dock is a navigation component consisting of menuitems.

## Dock

Dock is a navigation component consisting of menuitems.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DockPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| id | string \| undefined | - | Current id state as a string. |
| model | MenuItem[] \| null | - | MenuModel instance to define the action items. |
| position | "bottom" \| "top" \| "left" \| "right" | - | Position of element. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| breakpoint | string | 960px | The breakpoint to define the maximum width boundary. |
| ariaLabelledBy | string \| undefined | - | Defines a string that labels the dropdown button for accessibility. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onFocus | event: FocusEvent | Callback to execute when button is focused. |
| onBlur | event: FocusEvent | Callback to invoke when the component loses focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| item | TemplateRef<DockItemTemplateContext> \| undefined | Custom item template. |

## Accessibility

Screen Reader Dock component uses the menu role with the aria-orientation and the value to describe the menu can either be provided with aria-labelledby or aria-label props. Each list item has a presentation role whereas anchor elements have a menuitem role with aria-label referring to the label of the item and aria-disabled defined if the item is disabled. Keyboard Support Key Function tab Add focus to the first item if focus moves in to the menu. If the focus is already within the menu, focus moves to the next focusable item in the page tab sequence. shift + tab Add focus to the last item if focus moves in to the menu. If the focus is already within the menu, focus moves to the previous focusable item in the page tab sequence. enter Activates the focused menuitem. space Activates the focused menuitem. down arrow Moves focus to the next menuitem in vertical layout. up arrow Moves focus to the previous menuitem in vertical layout. home Moves focus to the first menuitem in horizontal layout. end Moves focus to the last menuitem in horizontal layout.
