# Angular Menu Component — API

Menu is a navigation / command component that supports dynamic and static positioning.

## Menu

Menu is a navigation / command component that supports dynamic and static positioning.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, MenuPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| model | MenuItem[] \| undefined | - | An array of menuitems. |
| popup | boolean | - | Defines if menu would displayed as a popup. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| ariaLabel | string \| undefined | - | Defines a string value that labels an interactive element. |
| ariaLabelledBy | string \| undefined | - | Identifier of the underlying input element. |
| id | string \| undefined | - | Current id state as a string. |
| tabindex | number | - | Index of the element in tabbing order. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| expandedKeys | MenuExpandedKeys \| undefined | - | When provided, switches the component to controlled mode; each key is the DOM id of a toggleable submenu header and the value its expansion flag. Use two-way binding with  `[(expandedKeys)]` . |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onShow | value: object | Callback to invoke when overlay menu is shown. |
| onHide | value: object | Callback to invoke when overlay menu is hidden. |
| onBlur | event: Event | Callback to invoke when the list loses focus. |
| onFocus | event: Event | Callback to invoke when the list receives focus. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| start | TemplateRef<void> \| undefined | Defines template option for start. |
| end | TemplateRef<void> \| undefined | Defines template option for end. |
| item | TemplateRef<MenuItemTemplateContext> \| undefined | Custom item template. |
| submenuheader | TemplateRef<MenuSubmenuHeaderTemplateContext> \| undefined | Custom submenu header template. |
| submenuicon | TemplateRef<MenuSubmenuHeaderTemplateContext> \| undefined | Custom submenu toggle icon template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| toggle | event: Event | void | Toggles the visibility of the popup menu. |
| show | event: Event | void | Displays the popup menu. |
| hide |  | void | Hides the popup menu. |

## Accessibility

Screen Reader Menu component uses the menu role and the value to describe the menu can either be provided with aria-labelledby or aria-label props. Each list item has a presentation role whereas anchor elements have a menuitem role with aria-label referring to the label of the item and aria-disabled defined if the item is disabled. A submenu within a Menu uses the group role with an aria-labelledby defined as the id of the submenu root menuitem label. In popup mode, the component implicitly manages the aria-expanded , aria-haspopup and aria-controls attributes of the target element to define the relation between the target and the popup. Keyboard Support Key Function tab Add focus to the first item if focus moves in to the menu. If the focus is already within the menu, focus moves to the next focusable item in the page tab sequence. shift + tab Add focus to the last item if focus moves in to the menu. If the focus is already within the menu, focus moves to the previous focusable item in the page tab sequence. enter Activates the focused menuitem. If menu is in overlay mode, popup gets closes and focus moves to target. space Activates the focused menuitem. If menu is in overlay mode, popup gets closes and focus moves to target. escape If menu is in overlay mode, popup gets closes and focus moves to target. down arrow Moves focus to the next menuitem. up arrow Moves focus to the previous menuitem. home Moves focus to the first menuitem. end Moves focus to the last menuitem.
